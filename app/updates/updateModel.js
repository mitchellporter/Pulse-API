var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Response = require('../responses/responseModel');
var logger = require('../../lib/logger');
var Task = require('../tasks/taskModel');

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

UpdateSchema.statics.findByTaskAssigner = function (assigner, callback) {
  var query = this.find();
  var task_id = this.task;
// B. Give me Updates where the task's assigner id is equal to mine

  Task.findOne({ _id: task_id })
  .then(function(task) {
		query.where({ assigner: assigner });
  })
  return query
}

module.exports = mongoose.model('Update', UpdateSchema);