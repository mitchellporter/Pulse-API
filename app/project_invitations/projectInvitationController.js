const logger = require('../../lib/logger');
const ProjectInvitation = require('./projectInvitation');

exports.params = function(req, res, next, id) {
    ProjectInvitation.findById(id)
    .then(project_invitation => {
        if (!project_invitation) return next(new Error('no project invitation exists with that id'));
        req.project_invitation = project_invitation;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    ProjectInvitation.find()
    .then(project_invitations => {
        res.status(200).json({
            success: true,
            project_invitations: project_invitations
        });
    })
    .catch(next);
};

exports.post = function(req, res, next) {
    var project_invitation = new ProjectInvitation({
        project: req.body.project,
        sender: req.user,
        receiver: req.body.receiver
    });

    project_invitation.save()
    .then(project_invitation => {
        res.status(201).json({
            success: true,
            project_invitation: project_invitation
        });
    })
    .catch(next);
};