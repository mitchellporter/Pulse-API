var logger = require('../../lib/logger');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statuses = ['pending', 'accepted', 'denied'];
var update_days = ['monday', 'wednesday', 'friday'];

var TaskInvitationSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
    receiver: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
		// required: true
	},
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
		required: true
	},
	status: {
		type: String,
		required: true,
		default: 'pending',
		enum: statuses
	}
});

TaskInvitationSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

TaskInvitationSchema.statics = {
	createTaskInvitationsForAssignees: createTaskInvitationsForAssignees
}

TaskInvitationSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

function createTaskInvitationsForAssignees(task, assignees) {

	logger.silly('creating task invitiations for assignees');

	return new Promise(function (resolve, reject) {
			var task_invitations = [];
			async.eachOf(assignees, function (value, key, callback) {
				var assignee = value;
				var task_invitation = new this({
					sender: task.assigner,
					receiver: assignee,
					task: task,
				});
				task_invitations.push(task_invitation);
				callback();
			}.bind(this), function (err) {
				if (err) return reject(err);
				
				this.create(task_invitations)
				.then(resolve)
				.catch(reject);

			}.bind(this));
		}.bind(this));
}

module.exports = mongoose.model('TaskInvitation', TaskInvitationSchema);