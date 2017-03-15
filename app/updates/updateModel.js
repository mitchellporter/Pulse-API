var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Response = require('./responseModel');
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

UpdateSchema.pre('save', function(next) {
	if (!this.isNew) return next();

	// TODO: task should never be an id here, we need the real task object
	var task = this.task;
	async.forEachOf(task.assignees, function(value, key, callback) {
		var assignee = value;
		var response = new Response({
			assignee: assignee
		});
		this.responses.push(response);
		callback();
	}.bind(this), function(err) {
		if (err) return next(err);
		next();
	});
});

UpdateSchema.methods = {
	// TODO: Remove all responses except for the user's in toJSON - they shouldn't be able to see everyone else's updates
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

function getResponseForAssignee(id) {
	var response = this.responses.find(function(response) {
		return response.assignee == id;
	});
	return response;
}

module.exports = mongoose.model('Update', UpdateSchema);