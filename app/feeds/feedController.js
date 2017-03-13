var logger = require('../../lib/logger');
var Task = require('../tasks/taskModel');
var TaskInvitation = require('../tasks/taskInvitationModel');
var UpdateRequest = require('../update_requests/updateRequestModel');
var Item = require('../items/itemModel');
var async = require('async');
var messenger = require('../messenger/messenger');

exports.myTasks = function (req, res, next) {
	var user = req.user;

	var populate = [{ path: 'assigner' }, { path: 'assignees' }, { path: 'items' }];

	// 1. Fetch task invitations sent to user
	// 2. Fetch task's where user is an assignee

	var response = {};
	async.parallel([findTaskInvitationsForUser, findTasks], function(err) {
		if (err) logger.error(err);
		if (err) return next(err);

		response.success = true;
		res.status(200).json(response);
	});

	function findTaskInvitationsForUser(callback) {
		TaskInvitation.find({ receiver: user, status: 'pending' })
			.populate([{ path: 'sender' }, { path: 'receiver' }, { path: 'task', populate: [{ path: 'items' }, { path: 'assignees', select: '_id name email position avatar_url' }, { path: 'assigner', select: '_id name email position avatar_url' }] }])
			.then(function (task_invitations) {
				logger.silly('found this many task invitations: ' + task_invitations.length);
				response.task_invitations = task_invitations;
				callback(null, task_invitations);
			})
			.catch(function(err) {
				callback(err, null);
			});
	}

	function findTasks(callback) {
		Task.find({ $or: [{'status': 'in_progress'}, {'status': 'completed'}], assignees: user })
			.populate(populate)
			.then(function (tasks) {
				logger.silly('found this many tasks: ' + tasks.length);
				response.tasks = tasks;
				callback(null, tasks);
			})
			.catch(function(err) {
				callback(err, null);
			});
	}
};

exports.getUpdates = function(req, res, next) {
	var user = req.user;

	var response = {};
	async.parallel([findUpdateRequests, findTasksWithUpdates], function(err) {
		if (err) logger.error(err);
		if (err) return next(err);

		response.success = true;
		res.status(200).json(response);
	});

	function findUpdateRequests(callback) {
		UpdateRequest.find({ receiver: user, status: 'sent' })
		.populate([{ path: 'sender' }, { path: 'receiver' }, { path: 'task', populate: [{ path: 'assigner', select: '_id name position email avatar_url' }, { path: 'assignees', select: '_id name position email avatar_url' }] }]) // task.assigner
		.then(function(update_requests) {
			response.update_requests = update_requests;
			callback(null, update_requests);
		})
		.catch(function(err) {
			callback(err, null);
		});
	}

	function findTasksWithUpdates(callback) {
		Task.find({ assigner: user, status: 'in_progress' })
		.populate([{ path: 'updates'}, { path: 'assigner', select: '_id name email position avatar_url' }, { path: 'assignees', select: '_id name email position avatar_url' }])
		.then(function(tasks) {
			response.tasks = tasks;
			callback(null, tasks);
		})
		.catch(function(err) {
			callback(err, null);
		});
	}

};

exports.tasksCreated = function (req, res, next) {
	var user = req.user;
	logger.silly('user id: ' + user._id);
	logger.silly('user name: ' + user.name);

	var populate = [{ path: 'assigner' }, { path: 'assignees' }, { path: 'items' }];

	// 1. Fetch task invitations sent to user
	// 2. Fetch task's where user is an assignee

	var response = {};
	async.parallel([findTaskInvitationsSentByUser, findTasks], function(err) {
		if (err) logger.error(err);
		if (err) return next(err);

		response.success = true;
		res.status(200).json(response);
	});

	function findTaskInvitationsSentByUser(callback) {
		TaskInvitation.find({ sender: user })
			.populate([{ path: 'sender' }, { path: 'receiver' }, { path: 'task', populate: [{ path: 'items' }, { path: 'assignees', select: '_id name email position avatar_url' }, { path: 'assigner', select: '_id name email position avatar_url' }] }])
			.then(function (task_invitations) {
				logger.silly('found this many task invitations: ' + task_invitations.length);
				response.task_invitations = task_invitations;
				callback(null, task_invitations);
			})
			.catch(function(err) {
				callback(err, null);
			});
	}

	function findTasks(callback) {
		Task.find({ $or: [{'status': 'in_progress'}, {'status': 'completed'}], assigner: user })
			.populate(populate)
			.then(function (tasks) {
				logger.silly('found this many tasks: ' + tasks.length);
				response.tasks = tasks;
				callback(null, tasks);
			})
			.catch(function(err) {
				callback(err, null);
			});
	}
};