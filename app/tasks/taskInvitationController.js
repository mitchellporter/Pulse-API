var logger = require('../../lib/logger');
var TaskInvitation = require('./taskInvitationModel');
var async = require('async');

exports.params = function(req, res, next, id) {
    logger.silly('TASK INVITATION PARAMS HANDLER: ' + id);
    TaskInvitation.findById(id)
	.then(function(task_invitation) {
		if(!task_invitation) return next(new Error('no task invitation exists with that id'));
		req.task_invitation = task_invitation;
		next();
	})
	.catch(function(err) {
		next(err);
	})
};

// TODO: Populate
exports.put = function(req, res, next) {
    var status = req.body.status;
    var task_invitation = req.task_invitation;
    task_invitation.status = status;
    
    task_invitation.isNew = false;
    task_invitation.save()
    .then(function(task_invitation) {

        task_invitation.populate([{ path: 'sender', select: '_id name email position avatar_url' }, { path: 'receiver', select: '_id name email position avatar_url' }]).execPopulate()
        .then(function(task_invitation) {
            res.status(201).json({
                success: true,
                task_invitation: task_invitation
            });
        })
        .catch(next);
    })
    .catch(next);
};