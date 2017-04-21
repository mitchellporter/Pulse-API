const logger = require('../../lib/logger');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statuses = ['sent', 'responded_to']; // TODO: Need better status names :)

var UpdateRequestSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
		required: true
	},
     status: {
		type: String,
		required: true,
		default: 'sent',
		enum: statuses
	}
});

UpdateRequestSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

UpdateRequestSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('UpdateRequest', UpdateRequestSchema);