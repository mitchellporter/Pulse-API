var logger = require('../../lib/logger');
var Update = require('./updateModel');
var async = require('async');

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

    Update.find({ $or:[{'sender':user}, {'receiver':user}] })
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
    logger.silly('requesting task update');

    var user = req.user;
    var task = req.task;
    
    task.populate('assignees', '_id').execPopulate()
    .then(function(task) {

        var assignees = task.assignees;
        var updates = [];
        async.forEachOf(assignees, function(value, key, callback) {
            var assignee = value;
            requestUpdateFromAssignee(assignee)
            .then(function(update) {
                updates.push(update);
                callback();
            })
            .catch(callback);
        }, function(err) {
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
            update.sender = user;
            update.receiver = assignee;
            update.task = task;

            logger.silly('update: ' + update);

            update.save()
            .then(resolve)
            .catch(reject);
        });
    }
};