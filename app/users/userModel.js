const logger = require('../../lib/logger');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Response = require('../responses/responseModel');

var UserSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
    email: {
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
    },
	most_recent_update_response: Response.schema,
});

UserSchema.pre('validate', function(next){
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();

	next();
});

// TODO: Try using hard bind and making this work
UserSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) return next();

	if(user.isNew && !user.avatar_url) user.setRandomAvatarURL(); 

	// Encrypt password
	user.encryptPassword(user.password, (err, hash) => {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});

var cdn_url = 'https://d33833kh9ui3rd.cloudfront.net/';
var asset_file_format = '@2x.png';
var avatar_asset_names = ['ellroi1', 'ellroi2', 'ellroi3', 'ellroi4', 'ellroi5', 'ellroi6'];

function randomAvatarURL() {
    return cdn_url + avatar_asset_names[Math.floor(Math.random() * avatar_asset_names.length)] + asset_file_format;
}

// TODO: Replace callbacks with Promises
UserSchema.methods = {
	authenticate: function(password) {
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, this.password, (err, result) => {
				if (err) return reject(err);
				return resolve(result);
			});
		});
	},
	encryptPassword: function(password, callback) {
		if (!password) {
			callback(new Error('password param is undefined'));
		} else {
			bcrypt.hash(password, 10, (err, hash) => {
				callback(err, hash);
			});
		}
	},
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		delete obj.password;
		return obj;
	},
	storeMostRecentUpdateResponse,
	storeMostRecentResponseFromUpdate,
	setRandomAvatarURL
}

function setRandomAvatarURL() {
	this.avatar_url = randomAvatarURL();
}

function storeMostRecentUpdateResponse(response) {
	return new Promise((resolve, reject) => {
		this.isNew = false;
		this.most_recent_update_response = response;

		this.save()
		.then(resolve)
		.catch(reject);
	});
}

function storeMostRecentResponseFromUpdate(update) {
	return new Promise((resolve, reject) => {
		update.responseForAssigneeId(this._id)
		.then((response) => {
			if (!response) return reject(new Error('no response on update belongs to user'));

			this.isNew = false;
			this.most_recent_update_response = response;
			return this.save();
		})
		.then(resolve)
		.catch(reject);
	});
}

module.exports = mongoose.model('User', UserSchema);