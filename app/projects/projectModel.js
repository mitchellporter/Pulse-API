const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ProjectSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
    name: {
        type: String,
        required: true
    },
    due_date: {
        type: Date
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
    }],
    completion_percentage: {
        type: Number,
        required: true,
        default: 0
    },
    standups_count: {
        type: Number,
        required: true,
        default: 0
    },
    tasks_in_progress_count: {
        type: Number,
        required: true,
        default: 0
    },
    completed_tasks_count: {
        type: Number,
        required: true,
        default: 0
    }    
});

ProjectSchema.pre('validate', function(next){
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();

	next();
});

// TODO: Try using hard bind and making this work
ProjectSchema.pre('save', function(next) {

});

module.exports = mongoose.model('Project', ProjectSchema);