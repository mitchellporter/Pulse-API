var logger = require('../../lib/logger');
var Task = require('./taskModel');
var TaskInvitation = require('../task_invitations/taskInvitationModel');
var Item = require('../items/itemModel');
var async = require('async');
var messenger = require('../messenger/messenger');

exports.params = function(req, res, next, taskId) {
	Task.findById(taskId)
	.populate('items assigner assignees')
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

	if (req.query.status) {
		query.status = req.query.status;
	}

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

exports.put = function(req, res, next) {
	logger.silly('task put');

	var task = req.task;
	var status = req.body.status;

	task.status = status;
	task.isNew = false;
	task.save()
	.then(function(task) {

		logger.silly('updated task');
		
		task.populate([{ path: 'assigner' }, { path: 'assignees' }, { path: 'items' }]).execPopulate()
		.then(function(task) {
			res.status(201).json({
				success: true,
				task: task
			});

			logger.silly('task completed? ' + task.status);
			if (task.status === 'completed') {
				logger.silly('send message');

				// TODO: Handle success / failure
				sendMessage();
			}
		})
		.catch(next);
	})
	.catch(next);


	function sendMessage() {
		logger.silly('About to send task completed notification!!!');
		var channel = task.assigner._id;
		var message = {
			type: 'task_completed',
			task: task
		}

		messenger.sendMessage(channel, message)
			.then(function (response) {
				logger.silly('response: ' + response);
			})
			.catch(function (err) {
				logger.silly('error: ' + err);
			})
	}
};

exports.post = function(req, res, next) {
	var assigner = req.user;
	var items_json = req.body.items;

	// NOTE: If you don't delete this, and req.body is used for Task's init,
	// then mongoose always throws an exception. Not sure why yet.
	delete req.body.items;

	var task = new Task(req.body);
	task.assigner = assigner;
	// TODO: Set real due_date
	var due_date_interval = req.body.due_date;
	var due_date = new Date(1970, 0, 1);
	due_date.setSeconds(due_date_interval);
	task.due_date = due_date;

	// Loop through items and create items
	var items = [];
	async.forEachOf(items_json, function(value, key, callback1) {
		var item_json = value;

		var item = new Item();
		item.text = item_json;
		items.push(item);

		callback1();
	}, function(err) {
		if (err) logger.error(err);

		// TODO: Handle this later. We should always have items
		if (items.count == 0) throw Error('NO ITEMS :('); 	

		createItems()
		.then(createTask)
		.then(populateAssignees)
		.then(createTaskInvitations)
		.then(function(task_invitations) {
			var task = task_invitations[0].task;
			res.status(201).json({
				success: true,
				task: task,
				task_invitations: task_invitations
			});

			logger.silly('task invitations count: ' + task_invitations.length);
			logger.silly('About to send new task assigned notification!');

			async.forEachOf(task_invitations, function(value, key, callback2) {
				var task_invitation = value;
				logger.silly('current task invitation: ' + task_invitation);

				sendMessage(task_invitation)
					.then(function (response) {
						logger.silly('response: ' + response);
						callback2();
					})
					.catch(function (err) {
						logger.silly('error: ' + err);
						callback2(err);
					})

			}, function(err) {
				if (err) return logger.error(err);
				logger.silly('successfully sent task assigned notification to all assignees!!!');
			});
		})
		.catch(next);
	});

	function createItems() {
		return Item.create(items);
	}

	function createTask(items) {
		task.items = items;
		return task.save();
	}

	function populateAssignees(task) {
		logger.silly('populate assignees');
		return task.populate('assignees').execPopulate();
	}

	function createTaskInvitations(task) {
		return new Promise(function (resolve, reject) {
			var task_invitations = [];
			async.eachOf(task.assignees, function (value, key, callback) {
				var assignee = value;
				var task_invitation = new TaskInvitation({
					sender: task.assigner,
					receiver: assignee,
					task: task,
				});
				task_invitations.push(task_invitation);
				callback();
			}, function (err) {
				if (err) return reject(err);
				TaskInvitation.create(task_invitations)
					.then(resolve)
					.catch(reject);
			});
		});
	}

	function sendMessage(task_invitation) {
		var channel = task_invitation.receiver._id;
		var message = {
			type: 'task_assigned',
			task_invitation: task_invitation
		}

		return messenger.sendMessage(channel, message);
	}
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