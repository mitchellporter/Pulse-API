const logger = require('../../lib/logger');
const config = require('../../config/config');
const Emailer = require('../../lib/emailer');
const Update = require('./updateModel');
const async = require('async');
const messenger = require('../messenger/messenger');

exports.params = function(req, res, next, id) {
    logger.silly('update params');
    Update.findById(id)
    .populate({ path: 'task', populate: [{ path: 'assigner' }, { path: 'assignees' }] })
    .then((update) => {
        if (!update) return next(new Error('no update exists with that id'));
        req.update = update;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    var task = req.task;

    Update.find({ task: task })
    .then((updates) => {
        res.status(200).json({
            success: true,
            updates: updates
        });
    })
    .catch(next);
};

exports.getOne = function(req, res, next) {
    var update = req.update;
    res.status(200).json({
        success: true,
        update: update
    });
};

exports.put = function(req, res, next) {
    logger.silly('updates put');

    const { message, completion_percentage } = req.body;

    var assignee = req.user;
    var assignee_id = assignee._id;

    var update = req.update;

    //  TODO: I think its broken right now because you're modifying the array while iterating over it
    var new_response;
    async.forEachOf(update.responses, (value, key, callback) => {
        var response = value;

        if (response.assignee.toString() == assignee_id) {

            response.isNew = false;
            response.message = message;
            response.completion_percentage = completion_percentage;
            response.status = 'sent';

            new_response = response;

            // TODO: There's a cleaner way to do this
            // Filter out old response and add updated one
            var filtered_responses = update.responses.filter(response => { return response.assignee.toString() != assignee_id });

            response.assignee = req.user;
            filtered_responses.push(response);
            update.responses = filtered_responses;

            callback();
        } else {
            callback();
        }

    }, (err) => {
        if (err) return next(err);

        update.isNew = false;
        update.save()
        .then((update) => {
            res.status(200).json({
                success: true,
                update: update
            });

            sendMessageToTaskAssigner(update)
            .then((response) => {
                logger.silly('successfully sent new update response notification to assigner');
            })
            .catch(logger.error);

            // Denormalized most recent update for user
            assignee.storeMostRecentResponseFromUpdate(update)
            .then((assignee) => {
                logger.silly('successfully stored most recent update for assignee');
            })
            .catch(logger.error);

            // Update task's completion percentage
            update.task.isNew = false;
            update.task.completion_percentage = completion_percentage
            update.task.save()
            .then((task) => {
                logger.silly('successfully updated the tasks completion percentage');
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

    const { type, message } = req.body;

    var update = new Update(req.body);
    update.task = task;
    update.type = type;

    var assignee_id;
    var assignee;
    var completion_percentage;
    if (type == 'random') {
        assignee = req.user;
        assignee_id = req.user._id;
        completion_percentage = req.body.completion_percentage;
    }
    update.generateResponses(assignee_id, completion_percentage, message)
    .then((update) => {
        return update.save();
    })
    .then((update) => {

        // TODO: Need to use addToSet to prevent duplicates
        task.updates.push(update);
        task.isNew = false;
        return task.save();
    })
    .then((task) => {
        res.status(201).json({
            success: true,
            update: update
        });

        // TODO: Handle automated as well
        if (type == 'requested') {
            sendEmailsToTaskAssignees()
            .then(sendMessageToTaskAssignees)
            .then(() => {
               logger.silly('successfully sent update request notification to all assignees');
            })
            .catch(logger.error)
        } else {
            sendMessageToTaskAssigner()
            .then(() => {
                logger.silly('successfully sent random update notification to assigner');
            })
            .catch(logger.error)

            update.responseForAssigneeId(assignee_id)
            .then((response) => {
                return assignee.storeMostRecentUpdateResponse(response);
            })
            .then(() => {
                logger.silly('successfully set most_recent_update_response on assignee');
            })
            .catch(logger.error);

            // Update task's completion percentage
            update.task.isNew = false;
            update.task.completion_percentage = completion_percentage
            update.task.save()
            .then((task) => {
                logger.silly('successfully updated the tasks completion percentage');
            })
            .catch(logger.error);
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
        return new Promise((resolve, reject) => {
            async.forEachOf(update.responses, (value, key, callback) => {
                channel = value.assignee._id;
                logger.silly('channel: ' + channel);
                messenger.sendMessage(channel, message)
                    .then((response) => {
                        callback();
                    })
                    .catch(callback);

            }, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    function sendEmailsToTaskAssignees() {
        logger.silly('sending update request emails to all task assignees');

        return new Promise((resolve, reject) => {
            var callback = (err, success) => {
                if (err) console.log(err);
                if (success) console.log(success);
                ready();
            }

            var options = {
                service: 'Gmail',
                auth: {
                    user: config.from_email,
                    pass: config.gmail_password
                }
            };

            var emailer = new Emailer(options, callback);

            function ready() {
                async.forEachOf(task.assignees, (value, key, callback) => {
                    var assignee = value;
                    logger.silly('assignee email: ' + assignee.email);

                    var message = {
                        from: config.formatted_from_email,
                        to: assignee.email, // TODO: Remove hardcoded email address
                        subject: task.assigner.name + ' has requested an update on the task you are working on titled: ' + task.title,
                        text: task.assigner.name + ' has requested an update on the task you are working on: ' + config.base_url  + '?update=' + update._id
                    };

                    emailer.send(message)
                        .then((info) => {
                            callback();
                        })
                        .catch(callback);

                }, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            }
        });
    }

    function sendMessageToTaskAssigner() {
        logger.silly('Sending random update notification to assigner');

        var channel = update.task.assigner._id;
        var message = {
            type: 'update',
            update: update
        }
        return messenger.sendMessage(channel, message);
    }
};