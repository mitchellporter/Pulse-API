const logger = require('../../lib/logger');
const Project = require('./projectModel');

exports.params = function(req, res, next, id) {
    Project.findById(id)
    .then(project => {
        if (!project) return next(new Error('no project exists with that id'));
        req.project = project;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    Project.find()
    .then(projects => {
        res.status(200).json({
            success: true,
            projects: projects
        });
    })
    .catch(next);
};