const logger = require('../../lib/logger');
const config = require('../../config/config');
const Emailer = require('../../lib/emailer');
const Update = require('./update');
const async = require('async');
const messenger = require('../messenger/messenger');

exports.params = function(req, res, next, id) {
    Update.findById(id)
    .populate({ path: 'task', populate: [{ path: 'assigner' }, { path: 'assignees' }] })
    .then(update => {
        if (!update) return next(new Error('no update exists with that id'));
        req.update = update;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    Update.find({ task: req.task })
    .then(updates => {
        res.status(200).json({
            success: true,
            updates: updates
        });
    })
    .catch(next);
};

exports.post = function(req, res, next) {
    var update = new Update({
        comment: req.body.comment,
        task: req.body.task,
        sender: req.user,
        update_request: req.body.update_request
    });

    update.save()
    .then(update => {
        res.status(201).json({
            success: true,
            update: update
        });
    })
    .catch(next);
};