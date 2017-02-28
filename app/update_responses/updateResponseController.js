var logger = require('../../lib/logger');
var UpdateResponse = require('./updateResponseModel');
var async = require('async');

// TODO: The problem with this is after we create an UpdateResponse,
// we need to update the completion_percentage field on the task, but because
// we havent nested this route, we can't use req.task like normal. Revisit this later.
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