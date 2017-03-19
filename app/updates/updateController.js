var logger = require('../../lib/logger');
var Update = require('./updateModel');
var async = require('async');
var messenger = require('../messenger/messenger');

exports.params = function(req, res, next, id) {
    logger.silly('update params');
    Update.findById(id)
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

exports.respondToUpdate = function (req, res, next) {
    var update_request = req.update_request;
    var sender = req.user;
    var receiver = update_request.sender;
    
    update_request.populate([{ path: 'task'}, { path: 'sender' }]).execPopulate()
        .then(function (update_request) {
            var task = update_request.task;

            var update = new Update(req.body);
            update.task = task;
            update.sender = sender;
            update.receiver = receiver;

            update.save()
            .then(function(update) {

                update_request.status = 'responded';
                update_request.isNew = false;
                return update_request.save();
            })
            .then(function (update_request) {
                task.updates.push(update);
                task.completion_percentage = update.completion_percentage;
                task.isNew = false;
                return task.save();

                logger.silly('saved update_request: ' + update_request);

                sendMessage();

            })
            .then(function(task) {
                res.status(201).json({
                        success: true,
                        update: update,
                        update_request: update_request
                });
            })
            .catch(next);
        })
        .catch(next);

    function sendMessage() {
        logger.silly('about to send response to update request notification!!!');
        var channel = update.receiver;
        var message = {
            type: 'update',
            update: update
        }

        messenger.sendMessage(channel, message)
            .then(function (response) {
                logger.silly('successfully sent response to update request notification!');
                logger.silly('response: ' + response);
            })
            .catch(function (err) {
                logger.silly('error: ' + err);
            })
    }
};

exports.put = function(req, res, next) {
    logger.silly('updates put');

    var assignee_id = req.user._id;
    logger.silly('assignee id: ' + assignee_id);
    var update = req.update;
    var completion_percentage = req.body.completion_percentage;

    //  TODO: I think its broken right now because you're modifying the array while iterating over it
    async.forEachOf(update.responses, function(value, key, callback) {
        var response = value;
        logger.silly('response assignee: ' + response.assignee);
        if (response.assignee.toString() == assignee_id) {
            logger.silly('found a match!');

            response.isNew = false;
            response.completion_percentage = completion_percentage;
            response.status = 'sent';
            response.save()
            .then(function(response) {
                // TODO: There's a cleaner way to do this
                // Filter out old response and add updated one
                var filtered_responses = update.responses.filter(function(response) {
                    return response.assignee.toString() != assignee_id;
                });
                logger.silly('filtered responses length before: ' + filtered_responses.length);
                filtered_responses.push(response);
                logger.silly('filtered responses length after: ' + filtered_responses.length);
                update.responses = filtered_responses;
                logger.silly('update responses length: ' + update.responses.length);
                callback();
            })
            .catch(callback);
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
        })
        .catch(next);
    });
};

exports.post = function(req, res, next) {

    var task = req.task;
    var type = req.body.type;

    var update = new Update(req.body);
    update.task = task;
    update.type = type;

    logger.silly('about to save update: ' + update);
    
    update.save()
    .then(function(update) {

        logger.silly('saved update: ' + update);


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

        sendMessage();
    })
    .catch(next);

    function sendMessage() {
        logger.silly('about to send update notification!!!');
        var channel = update.receiver;
        var message = {
            type: 'update',
            update: update
        }

        messenger.sendMessage(channel, message)
            .then(function (response) {
                logger.silly('successfully sent update notification!');
                logger.silly('response: ' + response);
            })
            .catch(function (err) {
                logger.silly('error: ' + err);
            })
    }
};