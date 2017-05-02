const logger = require('../../lib/logger');
const Project = require('./project');
const User = require('../users/user');

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

exports.post = function(req, res, next) {
    var project = new Project(req.body);
    project.creator = req.user;
    project.members = req.user;

    project.save()
    .then(project => {
        res.status(201).json({
            success: true,
            project: project
        });
    })
    .catch(next);
};