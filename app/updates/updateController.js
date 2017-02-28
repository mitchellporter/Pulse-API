var logger = require('../../lib/logger');
var Update = require('./updateModel');

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

exports.post = function(req, res, next) {
    var user = req.user;

    var update = new Update(req.body);
    update.sender = user;
    update.completion_percentage = req.body.completion_percentage;

    update.save()
    .then(function(update) {
        res.status(201).json({
            success: true,
            update: update
        });
    })
    .catch(next);
};