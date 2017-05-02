const logger = require('../../lib/logger');
const UpdateRequest = require('./updateRequest');

exports.params = function(req, res, next, id) {
    UpdateRequest.findById(id)
    .then(update_request => {
        if (!update_request) return next(new Error('no update request exists with that id'));
        req.update_request = update_request;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    UpdateRequest.find()
    .then(update_requests => {
        res.status(200).json({
            success: true,
            update_requests: update_requests
        });
    })
    .catch(next);
};

exports.post = function(req, res, next) {
    var update_request = new UpdateRequest({
        sender: req.user,
        receiver: req.body.receiver,
        task: req.body.task
    });

    update_request.save()
    .then(update_request => {
        res.status(201).json({
            success: true,
            update_request: update_request
        });
    })
    .catch(next);
};