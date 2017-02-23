var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statuses = ['pending', 'in_progress', 'completed'];

var Task = new Schema({
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
    due_date: {
        type: Date
    },
    status: {
		type: String,
		required: true,
		default: 'pending',
		enum: statuses
	},
    completion_percentage: {
		type: Number,
		required: true,
		default: 0
	}
});

Task.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

Task.methods = {
	toJSON: function() {
		var obj = this.toObject();
		obj.created_at = this.created_at.getTime();
		obj.updated_at = this.updated_at.getTime();
		if (obj.due_date) obj.due_date = obj.due_date.getTime();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('Task', Task);