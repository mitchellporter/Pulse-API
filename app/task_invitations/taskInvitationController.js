const logger = require('../../lib/logger');
const TaskInvitation = require('./taskInvitationModel');
const async = require('async');

exports.params = function(req, res, next, id) {
    TaskInvitation.findById(id)
    .populate([{ path: 'task', populate: [{ path: 'assigner' }, { path: 'assignees' }, { path: 'items' }] }])
	.then((task_invitation) => {
		if(!task_invitation) return next(new Error('no task invitation exists with that id'));
		req.task_invitation = task_invitation;
		next();
	})
	.catch((err) => {
		next(err);
	})
};

exports.getOne = function(req, res, next) {
    var task_invitation = req.task_invitation;
    res.status(200).json({
        success: true,
        task_invitation: task_invitation
    });
};

// TODO: Populate
exports.put = function(req, res, next) {
    var status = req.body.status;
    var task_invitation = req.task_invitation;
    task_invitation.status = status;
    
    task_invitation.isNew = false;
    task_invitation.save()
    .then((task_invitation) => {

        var task = task_invitation.task;
        task.status = 'in_progress';
        task.isNew = false;
        task.save()
            .then((task) => {
                logger.silly('saved task status: ' + task.status);
                task_invitation.populate([{ path: 'sender', select: '_id name email position avatar_url' }, { path: 'receiver', select: '_id name email position avatar_url' }]).execPopulate()
                    .then((task_invitation) => {
                        res.status(201).json({
                            success: true,
                            task_invitation: task_invitation
                        });
                    })
                    .catch(next);
        })
    })
    .catch(next);
};