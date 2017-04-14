const mongoose = require('mongoose');
const Response = require('./responseModel');
const logger = require('../../lib/logger');

exports.params = function(req, res, next, id) {
    var responses = req.update.responses;
    var response = responses.find(response =>  response._id == id );
    
    if (!response) return next(new Error('no update response exists with that id'));
    req.response = response;
    next();
};

exports.put = function(req, res, next) {
    var update = req.update;
    var response = req.response;

    const { message, completion_percentage } = req.body;

    response.message = message;
    response.completion_percentage = completion_percentage;
    response.status = 'sent';
    response.isNew = false;

    var index = update.responses.indexOf(response)
    if (index != undefined) {
        update.responses[index] = response;
    }
    
    update.isNew = false;
    update.save()
        .then((update) => {
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

    res.status(201).json({
        success: true
    });

    // TODO: Send notification to response.assignee
    function sendMessage() {
        
    }
};