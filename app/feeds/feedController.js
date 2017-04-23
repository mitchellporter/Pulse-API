const logger = require('../../lib/logger');
const Task = require('../tasks/taskModel');
const TaskInvitation = require('../task_invitations/taskInvitationModel');
const Update = require('../updates/updateModel');
const UpdateRequest = require('../update_requests/updateRequestModel');
const Subtask = require('../subtasks/subtaskModel');
const async = require('async');
const messenger = require('../messenger/messenger');

exports.myTasks = function (req, res, next) {
	var user = req.user;

	var populate = [{ path: 'assigner' }, { path: 'assignee' }, { path: 'subtasks' }];

	// 1. Fetch task invitations sent to user
	// 2. Fetch task's where user is an assignee

	var response = {};
	async.parallel([findTaskInvitationsForUser, findTasks], (err) => {
		if (err) logger.error(err);
		if (err) return next(err);

		response.success = true;
		res.status(200).json(response);
	});

	function findTaskInvitationsForUser(callback) {
		TaskInvitation.find({ receiver: user })
			.populate([{ path: 'sender' }, { path: 'receiver' }, { path: 'task', populate: [{ path: 'subtasks' }, { path: 'assignee', select: '_id name email position avatar_url' }, { path: 'assigner', select: '_id name email position avatar_url' }] }])
			.then((task_invitations) => {
				logger.silly('found this many task invitations: ' + task_invitations.length);
				response.task_invitations = task_invitations;
				callback(null, task_invitations);
			})
			.catch((err) => {
				callback(err, null);
			});
	}

	function findTasks(callback) {
		Task.find({ $or: [{'status': 'in_progress'}, {'status': 'completed'}], assignee: user })
			.populate(populate)
			.then((tasks) => {
				logger.silly('found this many tasks: ' + tasks.length);
				response.tasks = tasks;
				callback(null, tasks);
			})
			.catch((err) => {
				callback(err, null);
			});
	}
};

exports.tasksCreated = function (req, res, next) {
	var user = req.user;
	logger.silly('user id: ' + user._id);
	logger.silly('user name: ' + user.name);

	var populate = [{ path: 'assigner' }, { path: 'assignee' }, { path: 'subtasks' }];

	var response = {};
	async.parallel([findTasks], (err) => {
		if (err) logger.error(err);
		if (err) return next(err);

		response.success = true;
		res.status(200).json(response);
	});

	function findTaskInvitationsSentByUser(callback) {
		TaskInvitation.find({ sender: user })
			.populate([{ path: 'sender' }, { path: 'receiver' }, { path: 'task', populate: [{ path: 'subtasks' }, { path: 'assignee', select: '_id name email position avatar_url' }, { path: 'assigner', select: '_id name email position avatar_url' }] }])
			.then((task_invitations) => {
				logger.silly('found this many task invitations: ' + task_invitations.length);
				response.task_invitations = task_invitations;
				callback(null, task_invitations);
			})
			.catch((err) => {
				callback(err, null);
			});
	}

	function findTasks(callback) {
		Task.find({ assigner: user })
			.populate(populate)
			.then((tasks) => {
				logger.silly('found this many tasks: ' + tasks.length);
				response.tasks = tasks;
				callback(null, tasks);
			})
			.catch((err) => {
				callback(err, null);
			});
	}
};

exports.getUpdates = function(req, res, next) {
	var user = req.user;
	
	var response = {};
	async.parallel([findUpdateRequestsSentToMe, findUpdatesSentToMe], (err) => {
		if (err) logger.error(err);
		if (err) return next(err);

		response.success = true;
		res.status(200).json(response);
	});

	function findUpdateRequestsSentToMe(callback) {
		UpdateRequest.find({ receiver: user , status: 'sent' })
		.populate('task sender receiver') // task.assigner
		.then(update_requests => {
			response.update_requests = update_requests;
			callback(null, update_requests);
		})
		.catch(callback);
	}

	function findUpdatesSentToMe(callback) {
		Update.find({ receiver: user })
		.populate('task sender receiver')
		.then((updates) => {
			response.updates = updates;
			callback(null, updates);
		})
		.catch(callback);
	}
};