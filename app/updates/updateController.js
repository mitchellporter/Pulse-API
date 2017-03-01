var logger = require('../../lib/logger');
var UpdateRequest = require('./updateRequestModel');
var async = require('async');

// TODO: Update this, Update is no longer a model
exports.params = function(req, res, next, id) {
    Update.findById(id)
    .then(function(update) {
        if(!update) return next(new Error('no Update found with that id'));
        req.update = update;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    // TODO: Implement paging
    var user = req.user;

    UpdateRequest.find({ $or:[{'sender':user}, {'receivers':user}] })
    .populate('sender', '_id name position avatar_url')
    .then(function(updates) {
        res.status(200).json({
            success: true,
            updates: updates
        });
    })
    .catch(next);
}

exports.getOne = function(req, res, next) {
    var update = req.update;
    res.status(200).json({
        success: true,
        update: update
    });
}

// TODO: Send socket notifications
exports.post = function(req, res, next) {

    var sender = req.user;
    var task = req.task;
    var type = req.body.type;

    switch (type) {
        case 'request':
        requestUpdate();
        break;
        case 'response':
        sendUpdate();
        break;
        default: next(new Error('update needs a valid type - request or response'));
    }

    function requestUpdate() {
        logger.silly('requesting task update');
        task.populate('assignees', '_id').execPopulate()
            .then(function (task) {

                var assignees = task.assignees;
                var updates = [];
                async.forEachOf(assignees, function (value, key, callback) {
                    var assignee = value;
                    requestUpdateFromAssignee(assignee)
                        .then(function (update) {
                            updates.push(update);
                            callback();
                        })
                        .catch(callback);
                }, function (err) {
                    if (err) logger.error(err);
                    if (err) return next(err);

                    res.status(201).json({
                        success: true,
                        updates: updates
                    });
                });
            })
            .catch(next);

        function requestUpdateFromAssignee(assignee) {
            logger.silly('assignee: ' + assignee);
            return new Promise(function (resolve, reject) {
                var update = new Update(req.body);
                update.sender = sender;
                update.receiver = assignee;
                update.task = task;

                logger.silly('update: ' + update);

                update.save()
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