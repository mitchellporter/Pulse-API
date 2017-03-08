var logger = require('../../lib/logger');
var Update = require('./updateModel');
var async = require('async');

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

exports.post = function(req, res, next) {
    var task = req.task;
    var sender = req.user;
    var receiver = task.assigner;

    var update = new Update(req.body);
    update.task = task;
    update.sender = sender;
    update.receiver = receiver;
    
    update.save()
    .then(function(update) {
        res.status(201).json({
            success: true,
            update: update
        });
    })
    .catch(next);
};