const logger = require('../../lib/logger');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var StandupSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
    text: {
        type: String,
        required: true
    },
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
});

StandupSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

StandupSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('Standup', StandupSchema);