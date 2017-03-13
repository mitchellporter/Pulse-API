var logger = require('../../lib/logger');
var Update = require('./updateModel');
var async = require('async');
var messenger = require('../messenger/messenger');

exports.get = function(req, res, next) {
    var update_request = req.update_request;

    Update.find({ update_request: update_request })
    .then(function(updates) {
        res.status(200).json({
            success: true,
            updates: updates
        });
    })
    .catch(next);
};

exports.respondToUpdateRequest = function (req, res, next) {
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

exports.post = function(req, res, next) {
    var task = req.task;
    var sender = req.user;
    var receiver = task.assigner;

    var update = new Update(req.body);
    update.task = task;
    logger.silly('TASK TASK TASK: ' + task);
    update.sender = sender;
    update.receiver = receiver;
    
    update.save()
    .then(function(update) {
        // TODO: Need to use addToSet to prevent duplicates
        task.updates.push(update);
        task.completion_percentage = update.completion_percentage;
        task.isNew = false;
        return task.save();

    })
    .then(function(task) {
        res.status(201).json({
            success: true,
            update: update
        });
    })
    .catch(next);

    // function sendMessage() {
    //     logger.silly('about to send update notification!!!');
    //     var channel = update.receiver;
    //     var message = {
    //         type: 'update',
    //         update: update
    //     }

    //     messenger.sendMessage(channel, message)
    //         .then(function (response) {
    //             logger.silly('successfully sent update notification!');
    //             logger.silly('response: ' + response);
    //         })
    //         .catch(function (err) {
    //             logger.silly('error: ' + err);
    //         })
    // }
};