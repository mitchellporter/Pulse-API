const async = require('async');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Response = require('../responses/responseModel');
const logger = require('../../lib/logger');
const Task = require('../tasks/taskModel');

const types = ['automated', 'requested', 'random'];

var UpdateSchema = new Schema({
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date,
        required: true
    },
	comment: {
		type: String
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
		required: true
	},
	update_request: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'UpdateRequest'
	}
});

UpdateSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

UpdateSchema.pre('save', function(next) {
	if (!this.isNew) return next();
	next();
});

UpdateSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
};

module.exports = mongoose.model('Update', UpdateSchema);