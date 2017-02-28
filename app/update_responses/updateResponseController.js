var logger = require('../../lib/logger');
var UpdateResponse = require('./updateResponseModel');
var async = require('async');

exports.post = function(req, res, next) {
    var sender = req.user;

    var update_response = new UpdateResponse(req.body);
    update_response.sender = sender;

    logger.silly('update response: ' + update_response);

    update_response.save()
    .then(function(update_response) {
        res.status(201).json({
            success: true,
            update_response: update_response
        });
    })
    .catch(next);
};