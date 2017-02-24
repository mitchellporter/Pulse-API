var logger = require('../../lib/logger');
var Task = require('./taskModel');
var Item = require('../items/itemModel');
var async = require('async');

exports.params = function(req, res, next, taskId) {
	Task.findById(taskId)
	.populate(populate)
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