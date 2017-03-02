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
    var sender = req.user;

    var update = new Update(req.body);
    update.sender = sender;
    
    update.save()
    .then(function(update) {
        res.status(201).json({
            success: true,
            update: update
        });
    })
    .catch(next);
};