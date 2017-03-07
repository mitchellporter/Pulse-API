var logger = require('../../lib/logger');
var Task = require('./taskModel');
var TaskInvitation = require('./taskInvitationModel');
var UpdateRequest = require('../update_requests/updateRequestModel');
var Item = require('../items/itemModel');
var async = require('async');

exports.params = function(req, res, next, taskId) {
	Task.findById(taskId)
	.populate('items')
	.then(function(task) {
		if(!task) return next(new Error('no task exists with that id'));
		req.task = task;
		next();
	})
	.catch(function(err) {
		next(err);
	})
};

exports.get = function(req, res, next) {

	var query = {};
	if (req.query.assigner) { 
		logger.silly('assigner id found in query string!')
		query.assigner = req.query.assigner
	};
	if (req.query.assignee) {
		logger.silly('assignee id found in query string!')
		query.assignees = req.query.assignee;
	};

	var populate = [{ path: 'assigner' }, { path: 'assignees' }, { path: 'items' }];
	
	Task.find(query)
	.populate(populate)
	.then(function(tasks) {
		logger.silly('found this many tasks: ' + tasks.length);
		res.status(200).json({
			success: true,
			tasks: tasks
		});
	})
	.catch(next);
};

exports.getOne = function(req, res, next) {
	var task = req.task;
	res.status(200).json({
		success: true,
		task: task
	});
};

exports.post = function(req, res, next) {
	var assigner = req.user;
	var items_json = req.body.items;

	logger.silly('items: ' + items_json);

	var task = new Task(req.body);
	task.assigner = assigner;

	// Loop through items and create items
	var items = [];
	async.forEachOf(items_json, function(value, key, callback) {
		var item_json = value;

		var item = new Item();
		item.text = item_json;
		logger.silly('item text: ' + item.text);
		items.push(item);

		callback();
	}, function(err) {
		if (err) logger.error(err);

		// TODO: Handle this later. We should always have items
		if (items.count == 0) throw Error('NO ITEMS :('); 	

		createItems()
		.then(createTask)
		.then(function(task) {
			res.status(201).json({
				success: true,
				task: task
			});
		})
		.catch(next);

		function createItems() {
			return Item.create(items);	
		}

		function createTask(items) {
			task.items = items;
			return task.save();
		}
	});
};

exports.acceptTask = function(req, res, next) {
	var user = req.user;
	var task = req.task;	

	task.status = 'in_progress';
	task.save()
	.then(function(task) {
		res.status(201).json({
			success: true,
			task: task
		});
	})
	.catch(next);
};

exports.declineTask = function(req, res, next) {

};

// TODO: This breaks with multiple assignees
exports.requestUpdate = function(req, res, next) {
	logger.silly('About to request task update');

	var sender = req.user;
	var task = req.task;
	task.status = 'requires_update';

	// 1. Update task status to requires_update
	// 2. Populate updated task model's assignees array with id's
	// 3. Loop through assignee id's and send real-time updates to them

	Task.update(task)
	.then(function() {

		task.populate('assignees', '_id').execPopulate()
		.then(function(task) {
			// TODO: Loop through assignees and send real-time update w/ task + new "requires_update" status
			res.status(201).json({
				success: true
			});
		})
		.catch(next);
	})
	.catch(next);
};

exports.sendUpdate = function(req, res, next) {
	var sender = req.user;
	var task = req.task;
	var completion_percentage = req.body.completion_percentage;

	task.status = 'has_update';
	task.completion_percentage = completion_percentage;
	
	Task.update(task)
	.then(function() {

		task.populate('assignees', '_id').execPopulate()
		.then(function(task) {
			// TODO: Send assigner real-time update w/ task object that has updated completion_percentage
			res.status(201).json({
				success: true
			});
		})
		.catch(next);
	})
	.catch(next);
};

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
			.populate([{ path: 'sender' }, { path: 'receiver' }])
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
		TaskInvitation.find({ sender: user, status: 'pending' })
			.populate([{ path: 'sender' }, { path: 'receiver' }])
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
		.then(function(update_requests) {
			response.update_requests = update_requests;
			callback(null, update_requests);
		})
		.catch(function(err) {
			callback(err, null);
		});
	}

	function findTasksWithUpdates() {
		Task.find({ assigner: user, status: 'in_progress' })
		.populate('updates')
		.then(function(tasks) {
			response.tasks = tasks;
			callback(null, tasks);
		})
		.catch(function(err) {
			callback(err, null);
		});
	}

};