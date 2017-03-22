var mongoose = require('mongoose');
var Response = require('./responseModel');
var logger = require('../../lib/logger');

exports.params = function(req, res, next, id) {
    var responses = req.update.responses;
    var response = responses.find(function(response) {
        return response._id == id;
    });
    
    if (!response) return next(new Error('no update response exists with that id'));
    req.response = response;
    next();
};

// exports.put = function(req, res, next) {
//     var response = req.response;
//     response.status = req.body.status;
    
    
// }

exports.put = function(req, res, next) {
    var update = req.update;
    var response = req.response;

    response.message = req.body.message;
    response.completion_percentage = req.body.completion_percentage;
    response.status = 'sent';
    response.isNew = false;

    var index = update.responses.indexOf(response)
    if (index != undefined) {
        update.responses[index] = response;
    }
    
    update.isNew = false;
    update.save()
        .then(function (update) {
            res.status(200).json({
                success: true,
                update: update
            });
        })
        .catch(next);
};

exports.resend = function(req, res, next) {
    var update = req.update;
    var response = req.response;

    // TODO: Send notification to response.assignee
    function sendMessage() {
        
    }
};