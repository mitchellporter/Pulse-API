const logger = require('../../lib/logger');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var TeamSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
    admins: [{ // TODO: Validate array: http://stackoverflow.com/a/25966143/3344977
        type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
        required: true
    }],
	name: {
		type: String,
		unique: true,
		required: true
	}
});

TeamSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

// TODO: Replace callbacks with Promises
TeamSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		delete obj.password;
		return obj;
	}
}

module.exports = mongoose.model('Team', TeamSchema);