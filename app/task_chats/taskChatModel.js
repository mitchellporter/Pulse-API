const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskChatSchema = new Schema({
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        required: true
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
    }
});

TaskChatSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

TaskChatSchema.pre('save', function(next) {
	if (!this.isNew) return next();
	next();
});

TaskChatSchema.methods = {	
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('TaskChat', TaskChatSchema);