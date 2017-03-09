var logger = require('../../lib/logger');
var UpdateRequest = require('./updateRequestModel');
var Update = require('../updates/updateModel');
var async = require('async');
var messenger = require('../messenger/messenger');

exports.params = function(req, res, next, id) {
    UpdateRequest.findById(id)
    .then(function(update_request) {
        if(!update_request) return next(new Error('no Update Request found with that id'));
        req.update_request = update_request;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    // TODO: Implement paging
    var user = req.user;
    var populate = [{ path: 'sender' }, { path: 'task' , populate: [{ path: 'assigner', select: '_id name position avatar_url' }, { path: 'assignees', select: '_id name position avatar_url' }]}];
    UpdateRequest.find({ $or: [{'sender': user}, {'receivers': user}] })
    .populate(populate)
    .then(function(update_requests) {
        res.status(200).json({
            success: true,
            update_requests: update_requests
        });
    })
    .catch(next);
}

exports.getOne = function(req, res, next) {
    var update_request = req.update_request;
    res.status(200).json({
        success: true,
        update_request: update_request
    });
}

// TODO: Send socket notifications
exports.post = function(req, res, next) {

    var sender = req.user;
    var task = req.task;

    requestUpdate();
   
    function requestUpdate() {
        logger.silly('requesting task update');
        task.populate('assignees', '_id name email position avatar_url').execPopulate()
            .then(function (task) {

                var assignees = task.assignees;
                var update_requests = [];
                async.forEachOf(assignees, function (value, key, callback) {
                    var assignee = value;
                    requestUpdateFromAssignee(assignee)
                        .then(function (update_request) {
                            update_requests.push(update_request);

                                logger.silly('about to send update request notification to assignee: ' + assignee._id);
                                logger.silly('about to send update request notification to update requests assignee id: ' + update_request.receiver._id);

                                var channel = assignee._id;
                                var message = {
                                    type: 'update_request',
                                    update_request: update_request
                                }
                                messenger.sendMessage(channel, message)
                                    .then(function (response) {
                                        logger.silly('response: ' + response);
                                        callback();
                                    })
                                    .catch(function (err) {
                                        logger.silly('error: ' + err.errorData);
                                        logger.silly('status: ' + Object.keys(err.status));
                                        callback(err);
                                    });
                        })
                        .catch(callback);
                }, function (err) {
                    if (err) logger.error(err);
                    if (err) return next(err);

                    logger.silly('successfully sent update request notifications to all assignees!');

                    res.status(201).json({
                        success: true,
                        update_requests: update_requests
                    });
                });
            })
            .catch(next);

        function requestUpdateFromAssignee(assignee) {
            logger.silly('assignee: ' + assignee);
            return new Promise(function (resolve, reject) {
                var update_request = new UpdateRequest(req.body);
                update_request.sender = sender;
                update_request.receiver = assignee;
                update_request.task = task;

                logger.silly('update: ' + update_request);

                update_request.save()
                .then(resolve)
                .catch(reject);
            });
        }
    }

    function sendUpdate() {
        logger.silly('sending task update');

            task.populate('assigner', '_id').execPopulate()
            .then(function(task) {
                var assigner = task.assigner;

                var update = new Update(req.body);
                update.type = type;
                update.sender = sender;
                update.receiver = assigner;
                update.task = task;

                logger.silly('UPDATE: ' + update);

                return update.save()
            })
            .then(function(update) {
                res.status(201).json({
                        success: true,
                        update: update
                    });
            })
            .catch(next);
    }
};

exports.requestUpdate = function(req, res, next) {
    var sender = req.user;
    var task = req.task;

    var update_request = new UpdateRequest(req.body);
    update_request.sender = sender;
    update_request.receivers = task.assignees;
    update_request.task = task;

    update_request.save()
    .then(function(update_request) {
        res.status(201).json({
            success: true,
            update_request: update_request
        });
    })
    .catch(next);
};

// exports.sendUpdate = function(req, res, next) {
//     var sender = req.user;
//     var task = req.task;

//     var update_response = new UpdateResponse(req.body);
//     update_response.sender = sender;
//     update_response.task = task;

//     update_response.save()
//     .then(function(update_response) {
//         res.status(201).json({
//             success: true,
//             update_response: update_response
//         });
//     })
//     .catch(next);
// };