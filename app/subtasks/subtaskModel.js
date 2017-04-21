const logger = require('../../lib/logger');
const Schema = require('mongoose').Schema;

const statuses = ['in_progress', 'completed'];

var SubtaskSchema = new Schema({
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
	completed_by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
    text: {
        type: String,
        required: true
    },
    status: {
		type: String,
		required: true,
		default: 'in_progress',
		enum: statuses
	}
});

SubtaskSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

SubtaskSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
};

module.exports = mongoose.model('SubTask', SubtaskSchema);