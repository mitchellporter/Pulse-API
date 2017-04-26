const logger = require('../../lib/logger');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statuses = ['pending', 'in_progress', 'completed'];
const update_days = ['monday', 'wednesday', 'friday'];

var TaskSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
	project: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Project',
		required: true 
	},
	assigner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	assignee: { 
        type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    due_date: {
        type: Date
    },
    status: {
		type: String,
		required: true,
		default: 'pending',
		enum: statuses
	},
	update_days: [{
		type: String,
		enum: update_days
	}],
    completion_percentage: {
		type: Number,
		required: true,
		default: 0
	},
	attachment_count: {
		type: Number,
		required: true,
		default: 0
	},
	chat_count: {
		type: Number,
		required: true,
		default: 0
	}
});

TaskSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

TaskSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
};

module.exports = mongoose.model('Task', TaskSchema);