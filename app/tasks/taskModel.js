var logger = require('../../lib/logger');
var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('../items/itemModel').schema;

var statuses = ['pending', 'in_progress', 'completed'];
var update_days = ['monday', 'wednesday', 'friday'];

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
	assignees: [{ // TODO: Validate array: http://stackoverflow.com/a/25966143/3344977
        type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
        required: true
    }],
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
	updateCompletionPercentageFromNewUpdateResponse: updateCompletionPercentageFromNewUpdateResponse,
	editAssignees: editAssignees
}

function updateCompletionPercentageFromNewUpdateResponse(response) {
	return new Promise(function(resolve, reject) {
		this.isNew = false;
		this.completion_percentage = response.completion_percentage;
		
		this.save()
		.then(resolve)
		.catch(reject);
	}.bind(this));
}

function editAssignees(assignees) {
	return new Promise(function(resolve, reject) {
		_.union(this.assignees, assignees);

		this.isNew = false;
		this.save()
		.then(resolve)
		.catch(reject);
	}.bind(this));
}

module.exports = mongoose.model('Task', TaskSchema);