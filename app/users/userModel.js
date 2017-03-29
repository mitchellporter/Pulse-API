var logger = require('../../lib/logger');
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
    email_address: {
        type: String,
        required: true
    },
    name: {
        type: String,
		required: true
    },
	password: {
		type: String,
		required: true
	},
    avatar_url: {
        type: String
    },
    position: {
        type: String,
		required: true
    },
    team: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
		required: true
	},
    apns_token: {
        type: String
    }
});

UserSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

// TODO: Try using hard bind and making this work
UserSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) return next(); 

	// Encrypt password
	user.encryptPassword(user.password, function(err, hash) {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});

// TODO: Replace callbacks with Promises
UserSchema.methods = {
	authenticate: function(password, callback) {
		bcrypt.compare(password, this.password, function(err, res) {
			callback(err, res);
		});
	},
	encryptPassword: function(password, callback) {
		if (!password) {
			callback(new Error('password param is undefined'));
		} else {
			bcrypt.hash(password, 10, function(err, hash) {
				callback(err, hash);
			});
		}
	},
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		delete obj.password;
		return obj;
	}
}

module.exports = mongoose.model('User', UserSchema);