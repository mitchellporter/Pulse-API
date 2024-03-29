const logger = require('../../lib/logger');
const Task = require('./task');
const Subtask = require('../subtasks/subtask');
const TaskInvitation = require('../task_invitations/taskInvitation');
const async = require('async');
const _ = require('lodash');
const objection = require('objection');
const messenger = require('../messenger/messenger');

const findQuery = require('objection-find');

exports.params = function(req, res, next, id) {

	req.query.id = id;

	findQuery(Task)
	.allowEager('[project, assigner, assignee, subtasks]')
	.build(req.query)
	.first()
	.then(task => {
		if (!task) return next(new Error('no task exists with that id'));
		req.task = task;
		next();
	})
	.catch(next);
};

exports.get = function(req, res, next) {

	if (req.query.project) {
		req.query.project_id = req.query.project;
		delete req.query.project;
	}

	if (req.query.assigner) {
		req.query.assigner_id = req.query.assigner;
		delete req.query.assigner;
	}

	if (req.query.assignee) {
		req.query.assignee_id = req.query.assignee;
		delete req.query.assignee;
	}

	findQuery(Task)
	.allowEager('[project, assigner, assignee, subtasks]')
	.build(req.query)
	.then(tasks => {
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
	if (req.body.status) task.status = req.body.status;

	task.isNew = false;
	task.save()
	.then((task) => {

		logger.silly('updated task');
		
		task.populate([{ path: 'assigner' }, { path: 'assignee' }, { path: 'subtasks' }]).execPopulate()
		.then((task) => {
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
			.then((response) => {
				logger.silly('response: ' + response);
			})
			.catch((err) => {
				logger.silly('error: ' + err);
			});
	}
};

exports.post = function(req, res, next) {

// 	- title
// - array of subtasks
// - optional due_date
// - assignee


// TRY DOING THIS WITH an insertGraph or insertWithRelated instead...
// Is that the same as a transaction? Because we need that safety

	var response = {};

	req.body.assigner = req.user.id;
	const task = Task.fromJson(req.body);

	objection.transaction(Task, Subtask, (Task, Subtask) => {
		return Task.query().insert(task);
	}).then(task => {
		response.task = task;

		const subtasks = _.map(req.body.subtasks, subtask => {
			return Subtask.fromJson({ text: subtask, created_by: req.user.id, task: task.id });
		});
		return Subtask.query().insert(subtasks);
	}).then(subtasks => {
		response.success = true;
		response.task.subtasks = subtasks;
		response.subtasks = subtasks;
		res.status(201).json(response);
	});
};

// exports.post = function(req, res, next) {
// 	var assigner = req.user;
// 	var subtasks_json = req.body.subtasks;

// 	// NOTE: If you don't delete this, and req.body is used for Task's init,
// 	// then mongoose always throws an exception. Not sure why yet.
// 	delete req.body.subtasks;

// 	var task = new Task(req.body);
// 	task.assigner = assigner;

// 	// TODO: Set real due_date
// 	var due_date_interval = req.body.due_date;
// 	var due_date = new Date(1970, 0, 1);
// 	due_date.setSeconds(due_date_interval);
// 	task.due_date = due_date;

// 	// Loop through subtasks and create subtasks
// 	var subtasks = [];
// 	async.forEachOf(subtasks_json, (value, key, callback1) => {
// 		var subtask_json = value;

// 		var subtask = new Subtask();
// 		subtask.text = subtask_json;
// 		subtasks.push(subtask);

// 		callback1();
// 	}, (err) => {
// 		if (err) logger.error(err);

// 		// TODO: Handle this later. We should always have subtasks
// 		if (subtasks.count == 0) throw Error('NO SUBTASKS :('); 	

// 		createSubtasks()
// 		.then(createTask)
// 		.then(populateAssignee)
// 		.then(createTaskInvitation)
// 		.then((task_invitation) => {


// 			res.status(201).json({
// 				success: true,
// 				task: task
// 			});

// 			if (!task_invitation) return;

// 			async.forEachOf(task_invitations, (value, key, callback2) => {
// 				var task_invitation = value;
// 				logger.silly('current task invitation: ' + task_invitation);

// 				sendMessage(task_invitation)
// 					.then((response) => {
// 						logger.silly('response: ' + response);
// 						callback2();
// 					})
// 					.catch((err) => {
// 						logger.silly('error: ' + err);
// 						callback2(err);
// 					})

// 			}, (err) => {
// 				if (err) return logger.error(err);
// 				logger.silly('successfully sent task assigned notification to all assignees!!!');
// 			});
// 		})
// 		.catch(next);
// 	});

// 	function createSubtasks() {
// 		return Subtask.create(subtasks);
// 	}

// 	function createTask(subtasks) {
// 		task.subtasks = subtasks;
// 		return task.save();
// 	}

// 	function populateAssignee(task) {
// 		logger.silly('populate assignee');
// 		return task.populate('assignee').execPopulate();
// 	}

// 	function createTaskInvitation(task) {
// 		return new Promise((resolve, reject) => {
// 			var task_invitation = new TaskInvitation({
// 				sender: task.assigner,
// 				receiver: task.assignee,
// 				task: task,
// 			});
// 			task_invitation.save()
// 				.then(resolve)
// 				.catch(reject);
// 		});
// 	}

// 	// function createTaskInvitations(task) {
// 	// 	return new Promise((resolve, reject) => {
// 	// 		var task_invitations = [];
// 	// 		async.eachOf(task.assignees, (value, key, callback) => {
// 	// 			var assignee = value;
// 	// 			var task_invitation = new TaskInvitation({
// 	// 				sender: task.assigner,
// 	// 				receiver: assignee,
// 	// 				task: task,
// 	// 			});
// 	// 			task_invitations.push(task_invitation);
// 	// 			callback();
// 	// 		}, (err) => {
// 	// 			if (err) return reject(err);
// 	// 			TaskInvitation.create(task_invitations)
// 	// 				.then(resolve)
// 	// 				.catch(reject);
// 	// 		});
// 	// 	});
// 	// }

// 	function sendMessage(task_invitation) {
// 		var channel = task_invitation.receiver._id;
// 		var message = {
// 			type: 'task_assigned',
// 			task_invitation: task_invitation
// 		}

// 		return messenger.sendMessage(channel, message);
// 	}
// };

exports.acceptTask = function(req, res, next) {
	var user = req.user;
	var task = req.task;	

	task.status = 'in_progress';
	task.save()
	.then((task) => {
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
	.then(() => {

		task.populate('assignee', '_id').execPopulate()
		.then((task) => {
			// TODO: Send assigner real-time update w/ task object that has updated completion_percentage
			res.status(201).json({
				success: true
			});
		})
		.catch(next);
	})
	.catch(next);
};

// TODO: Check for duplicate and prevent re-adding existing assignees
// Also, only send task invitations to new assignees
exports.addAssignees = function(req, res, next) {
	logger.silly('adding assignees to task');

	var task = req.task;
	var assignee = req.body.assignee;
	var task_with_assignee;

	task.addAssignee(assignee)
	.then((task) => {
		return task.populate('assignee', '_id name position email avatar_url').execPopulate();
	})
	.then((populated_task) => {
		task_with_assignee = populated_task;
		return TaskInvitation.createTaskInvitationsForAssignees(populated_task, assignees);
	})
	.then((task_invitations) => {
		res.status(201).json({
			success: true,
			task: task_with_assignee
		});
	})
	.catch(next);
};

exports.delete = function(req, res, next) {
	var task_id = req.task._id;
	Task.remove({ _id: task_id })
	.then((removed) => {
		logger.silly('removed: ' + removed);
		res.status(200).json({
			success: true
		});
	})
	.catch(next);
};