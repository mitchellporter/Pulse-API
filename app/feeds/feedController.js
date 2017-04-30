const logger = require('../../lib/logger');
const Task = require('../tasks/task');
const TaskInvitation = require('../task_invitations/taskInvitation');
const Update = require('../updates/update');
const UpdateRequest = require('../update_requests/updateRequest');
const Subtask = require('../subtasks/subtask');
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

		TaskInvitation
		.query()
		.where('receiver_id', user.id)
		.eager('[sender, receiver]')
		.then(task_invitations => {
			response.task_invitations = task_invitations;
			callback(null, task_invitations);
		})
		.catch(callback);
	}

	function findTasks(callback) {

		// TODO: This query is not correct
		// Needs filters for statuses

		Task
		.query()
		.where('assignee_id', user.id)
		.eager('[assigner, assignee]')
		// .andWhere('status', 'in_progress')
		// .orWhere('status', 'completed')
		.then(tasks => {
			response.tasks = tasks;
			callback(null, tasks);
		})
		.catch(callback);
	}
};

exports.tasksCreated = function (req, res, next) {
	var user = req.user;

	var response = {};
	async.parallel([findTasks], (err) => {
		if (err) logger.error(err);
		if (err) return next(err);

		response.success = true;
		res.status(200).json(response);
	});

	function findTasks(callback) {

		Task
		.query()
		.where('assigner_id', user.id)
		.eager('[assigner, assignee]')
		.then(tasks => {
			response.tasks = tasks;
			callback(null, tasks);
		})
		.catch(callback);
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