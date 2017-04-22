const logger = require('../../lib/logger');
const Task = require('../tasks/taskModel');
const TaskInvitation = require('../task_invitations/taskInvitationModel');
const Update = require('../updates/updateModel');
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

exports.getUpdates = function(req, res, next) {
	var user = req.user;
	
	var response = {
		updates: []
	};

	// Can turn this into one request
	async.parallel([findUpdatesThatNeedResponses, findUpdatesForAssigner], (err) => {
		if (err) logger.error(err);
		if (err) return next(err);

		response.success = true;
		res.status(200).json(response);
	});

	function findUpdatesThatNeedResponses(callback) {
		// Filter by responses.response.assignee == user._id AND status == requested

		// Updates we want:
		// A. Give me Updates that contain a response with an assignee id equal to mine AND a status of requested aka “updates I haven’t responded to”. This is the first table view section.
		// B. Give me Updates where the task's assigner id is equal to mine

		Update.find({ $and: [{ 'responses.assignee': user }] })
		.populate([{ path: 'task', populate: [{ path: 'assigner', select: '_id name position email avatar_url' }, { path: 'assignee', select: '_id name position email avatar_url' }] }, { path: 'responses.assignee', select: '_id name position email avatar_url' } ]) // task.assigner
		.then((updates) => {
			Array.prototype.push.apply(response.updates, updates);
			callback(null, updates);
		})
		.catch((err) => {
			callback(err, null);
		});
	}

	// TODO: Clean this up
	function findUpdatesForAssigner(callback) {
		logger.silly('finding updates for assigner: ' + user._id);
		Update.findByTaskAssigner(user)
		.then((updates) => {
			Array.prototype.push.apply(response.updates, updates);
			callback(null, updates);
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

	// 1. Fetch task invitations sent to user
	// 2. Fetch task's where user is an assignee

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