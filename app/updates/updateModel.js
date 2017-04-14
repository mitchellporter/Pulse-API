var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Response = require('../responses/responseModel');
var logger = require('../../lib/logger');
var Task = require('../tasks/taskModel');
var logger = require('../../lib/logger');

var types = ['automated', 'requested', 'random'];

var UpdateSchema = new Schema({
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date,
        required: true
    },
	type: {
		type: String,
		required: true,
		enum: types
	},
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
		required: true
	},
	responses: [Response.schema]
});

UpdateSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

// The handlers for Response model wont get called unless they are in the
// update's responses array BEFORE save is called
UpdateSchema.pre('save', function(next) {
	if (!this.isNew) return next();
	next();
	// TODO: task should never be an id here, we need the real task object
	// var task = this.task;
	// async.forEachOf(task.assignees, function(value, key, callback) {
	// 	var assignee = value;
	// 	var response = new Response({
	// 		assignee: assignee,
	// 		completion_percentage: 0
	// 	});
	// 	this.responses.push(response);
	// 	callback();
	// }.bind(this), function(err) {
	// 	if (err) return next(err);
	// 	next();
	// });
});

UpdateSchema.methods = {
	// TODO: Remove all responses except for the user's in toJSON - they shouldn't be able to see everyone else's updates
	generateResponses: generateResponses,
	responseForAssigneeId: responseForAssigneeId,
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

function generateResponses(assignee_id, completion_percentage, message) {
	logger.silly('responses 1');

	return new Promise((resolve, reject) => {
		var task = this.task;
		async.forEachOf(task.assignees, (value, key, callback) => {
			var assignee = value;
			var response = new Response({
				assignee: assignee,
				completion_percentage: 0
			});
			
			if (assignee._id.toString() == assignee_id || response.assignee._id == assignee_id) {
				logger.silly('assignee hit!');
				response.completion_percentage = completion_percentage;
				response.message = message;
				response.status = 'sent';
			}
			this.responses.push(response);
			callback();
		}, (err) => {
			if (err) return reject(err);
			resolve(this);
		});
	});
}

function generateResponsesForRandom(assignee_id, completion_percentage) {
		logger.silly('responses 2');

	return new Promise((resolve, reject) => {
		var task = this.task;
		async.forEachOf(task.assignees, (value, key, callback) => {
			var assignee = value;
			var response = new Response({
				assignee: assignee,
				completion_percentage: 0
			});
			if (assignee._id == assignee_id) response.completion_percentage = completion_percentage;
			this.responses.push(response);
			callback();
		}, (err) => {
			if (err) return reject(err);
			resolve(this);
		});
	});
}

function responseForAssigneeId(assigneeId) {
	return new Promise((resolve, reject) => {
		var response = this.responses.find((response) => {		
			if (mongoose.Types.ObjectId.isValid(response.assignee._id)) return response.assignee._id.toString() == assigneeId;;
			return response.assignee._id == assigneeId;
		})
		resolve(response);
	});
}

UpdateSchema.statics.findByTaskAssigner = function (assigner) {
	return new Promise((resolve, reject) => {
		Task.find({ assigner: assigner })
			.then((tasks) => {
				this.find({ task: tasks })
				.populate([ { path: 'task', populate: [{ path: 'assigner', select: '_id name position email avatar_url' }, { path: 'assignees', select: '_id name position email avatar_url' }] }, { path: 'responses.assignee', select: '_id name position email avatar_url' } ])
				.then(resolve)
				.catch(reject);
			})
			.catch(reject);
	});
}

module.exports = mongoose.model('Update', UpdateSchema);