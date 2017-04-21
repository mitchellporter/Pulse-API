const logger = require('../../lib/logger');
const Schema = require('mongoose').Schema;

const statuses = ['pending', 'accepted', 'denied'];

var ProjectInvitationSchema = new Schema({
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
	project: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'project',
		required: true
	},
	status: {
		type: String,
		required: true,
		default: 'pending',
		enum: statuses
	}
});

ProjectInvitationSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

ProjectInvitationSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('ProjectInvitation', ProjectInvitationSchema);