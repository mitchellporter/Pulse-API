const logger = require('../../lib/logger');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Item = require('../items/itemModel').schema;

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
	items: [Item],
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
		required: true,
		enum: update_days
	}],
    completion_percentage: {
		type: Number,
		required: true,
		default: 0
	},
	updates: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Update',
        required: true
	}]
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
	},
	updateCompletionPercentageFromNewUpdateResponse,
	addAssignee
}

function updateCompletionPercentageFromNewUpdateResponse(response) {
	return new Promise((resolve, reject) => {
		this.isNew = false;
		this.completion_percentage = response.completion_percentage;
		
		this.save()
		.then(resolve)
		.catch(reject);
	});
}

function addAssignee(assignee) {
	return new Promise((resolve, reject) => {
		this.assignee = assignee;
		this.isNew = false;
		
		this.save()
		.then(resolve)
		.catch(reject);
	});
}

module.exports = mongoose.model('Task', TaskSchema);