var logger = require('../../lib/logger');
var Update = require('./updateModel');
var async = require('async');
var messenger = require('../messenger/messenger');

exports.params = function(req, res, next, id) {
    logger.silly('update params');
    Update.findById(id)
    .populate({ path: 'task', populate: [{ path: 'assigner' }, { path: 'assignees' }] })
    .then(function(update) {
        if (!update) return next(new Error('no update exists with that id'));
        req.update = update;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    var task = req.task;

    Update.find({ task: task })
    .then(function(updates) {
        res.status(200).json({
            success: true,
            updates: updates
        });
    })
    .catch(next);
};

exports.put = function(req, res, next) {
    logger.silly('updates put');

    var assignee_id = req.user._id;
    logger.silly('assignee id: ' + assignee_id);
    var update = req.update;
    var completion_percentage = req.body.completion_percentage;
    var message = req.body.message;

    // TODO: This is annoying, fix later

    //  TODO: I think its broken right now because you're modifying the array while iterating over it
    async.forEachOf(update.responses, function(value, key, callback) {
        var response = value;
        logger.silly('response assignee: ' + response.assignee);
        if (response.assignee.toString() == assignee_id) {
            logger.silly('found a match!');

            response.isNew = false;
            response.message = message;
            response.completion_percentage = completion_percentage;
            response.status = 'sent';
            // TODO: There's a cleaner way to do this
            // Filter out old response and add updated one
            var filtered_responses = update.responses.filter(function (response) {
                return response.assignee.toString() != assignee_id;
            });
            response.assignee = req.user;
            filtered_responses.push(response);
            update.responses = filtered_responses;
            callback();
        } else {
            callback();
        }
    }, function(err) {
        if (err) return next(err);

        update.isNew = false;
        update.save()
        .then(function(update) {
            res.status(200).json({
                success: true,
                update: update
            });

            sendMessageToTaskAssigner(update)
            .then(function(response) {
                logger.silly('successfully sent new update response notification to assigner');
            })
            .catch(logger.error);

        })
        .catch(next);
    });

    function sendMessageToTaskAssigner(update) {
        //  logger.silly('Sending new update response notification to assigner');
        //  logger.silly('update: ' + update);
        var channel = update.task.assigner._id;
        var message = {
            type: 'update',
            update: update
        }
        // logger.silly('channel: ' + channel);
        // logger.silly('message type: ' + message.type);
        // logger.silly('message update: ' + message.update);

        return messenger.sendMessage(channel, message);
    }
};

exports.post = function(req, res, next) {

    var task = req.task;
    var type = req.body.type;
    var message = req.body.message;

    var update = new Update(req.body);
    update.task = task;
    update.type = type;

    logger.silly('about to save update: ' + update);

    var assignee_id;
    var completion_percentage;
    if (type == 'random') {
        logger.silly('random!');
        assignee_id = req.user._id;
        completion_percentage = req.body.completion_percentage;
    }
    update.generateResponses(assignee_id, completion_percentage, message)
    .then(function(update) {
        return update.save();
    })
    .then(function(update) {

        // TODO: Need to use addToSet to prevent duplicates
        task.updates.push(update);
        task.isNew = false;
        return task.save();
    })
    .then(function(task) {
        res.status(201).json({
            success: true,
            update: update
        });

        // TODO: Handle automated as well
        if (type == 'requested') {
            sendMessageToTaskAssignees()
            .then(function() {
               logger.silly('successfully sent update request notification to all assignees');
            })
            .catch(logger.error)
        } else {
            sendMessageToTaskAssigner()
            .then(function() {
                logger.silly('successfully sent random update notification to assigner');
            })
            .catch(logger.error)
        }
    })
    .catch(next);

    function sendMessageToTaskAssignees() {
        logger.silly('Sending update request notification to all assignees');

        var channel;
        var message = {
            type: 'update_request',
            update: update
        }
        return new Promise(function (resolve, reject) {
            async.forEachOf(update.responses, function (value, key, callback) {
                channel = value.assignee._id;
                logger.silly('channel: ' + channel);
                messenger.sendMessage(channel, message)
                    .then(function (response) {
                        callback();
                    })
                    .catch(callback);

            }, function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    function sendMessageToTaskAssigner() {
        logger.silly('Sending random update notification to assigner');

        var channel = update.task.assigner._id;
        var message = {
            type: 'update',
            update: update
        }
        logger.silly('channel: ' + channel);
        logger.silly('message type: ' + message.type);
        logger.silly('message update: ' + message.update);

        return messenger.sendMessage(channel, message);
    }
};