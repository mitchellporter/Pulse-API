const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('../../lib/logger');
const statuses = ['requested', 'sent'];

var ResponseSchema = new Schema({
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date,
        required: true
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'requested',
        enum: statuses
    },
    completion_percentage: {
		type: Number,
		required: true
	},
    message: {
        type: String
    }
});

// TODO: Needs investigating: This doesn't get called right now due to nesting in Update model
ResponseSchema.pre('validate', function(next) {
    if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

ResponseSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

ResponseSchema.methods = {
    toJSON: function() {
        var obj = this.toObject();
		delete obj.__v;
		return obj;
    }
};

module.exports = mongoose.model('Response', ResponseSchema);