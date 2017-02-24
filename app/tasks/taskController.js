var logger = require('../../lib/logger');
var Task = require('./taskModel');

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

	var populate = [{ path:'assigner' }, { path:'assignees' }];
	
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