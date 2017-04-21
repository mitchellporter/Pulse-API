const logger = require('../../lib/logger');
const Subtask = require('./subtaskModel');

exports.params = function(req, res, next, id) {
    Subtask.findById(id)
    .then(subtask => {
        if (!subtask) return next(new Error('no subtask exists with that id'));
        req.subtask = subtask;
        next();
    })  
    .catch(next);
};

exports.get = function(req, res, next) {
    Subtask.find()
    .then(subtasks => {
        res.status(200).json({
            success: true,
            subtasks: subtasks
        });
    })
    .catch(next);
};

exports.post = function(req, res, next) {
    var subtask = new Subtask(req.body);

    subtask.save()
    .then(subtask => {
        res.status(201).json({
            success: true,
            subtask: subtask
        });
    })
    .catch(next);
};