const logger = require('../../lib/logger');
const async = require('async');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statuses = ['pending', 'accepted', 'denied'];
const update_days = ['monday', 'wednesday', 'friday'];

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

	return new Promise((resolve, reject) => {
			var task_invitations = [];
			async.eachOf(assignees, (value, key, callback) => {
				var assignee = value;
				var task_invitation = new this({
					sender: task.assigner,
					receiver: assignee,
					task: task,
				});
				task_invitations.push(task_invitation);
				callback();
			}, (err) => {
				if (err) return reject(err);
				
				this.create(task_invitations)
				.then(resolve)
				.catch(reject);

			});
		});
}

module.exports = mongoose.model('TaskInvitation', TaskInvitationSchema);