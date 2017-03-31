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

TaskInvitationSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('TaskInvitation', TaskInvitationSchema);