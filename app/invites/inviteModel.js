const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');
const logger = require('../../lib/logger');
const config = require('../../config/config');

const types = ['team', 'task'];
const statuses = ['pending', 'accepted'];

var InviteSchema = new Schema({
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: types
    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: statuses
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    task_invitation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskInvitation'
    }
});

InviteSchema.pre('validate', function(next) {
    if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

InviteSchema.statics = {
    send: sendInvites
}

InviteSchema.methods = {
    toJSON: toJSON,
    send: sendInvite
}

function toJSON() {
    var obj = this.toObject();
	delete obj.__v;
	return obj;
}

// TODO: Remove ready func from both of these
// TODO: Replace hardcoded email options with config values
// TODO: Replace hardcoded message obj
function sendInvite() {
    return new Promise((resolve, reject) => {
        var options = {
            service: 'Gmail',
            auth: {
                user: config.from_email,
                pass: config.gmail_password
            }
        };

        var callback = (err, success) => {
            if (err) console.log(err);
            if (success) console.log(success);
            ready();
        }

        var Emailer = require('./emailer');
        var emailer = new Emailer(options, callback);

        function ready() {
            logger.silly('about to send email to invitee email address: ' + this.email);
            var message = {
                from: config.formatted_from_email,
                to: this.email,
                subject: 'You have been invited to a task!',
                text: 'You have been invited to a task!',
                html: '<p>You have been invited to a task!</p>'
            };

            emailer.send(message)
            .then(resolve)
            .catch(reject);
        }
    });
}

function sendInvites(invites) {
    return new Promise((resolve, reject) => {
        
        var callback = (err, success) => {
            if (err) console.log(err);
            if (success) console.log(success);
            ready();
        }

        var options = {
            service: 'Gmail',
            auth: {
                user: config.from_email,
                pass: config.gmail_password
            }
        };

        var Emailer = require('../../lib/emailer');
        var emailer = new Emailer(options, callback);

        function ready() {
            async.forEachOf(invites, function (value, key, callback) {
                var invite = value;
                logger.silly('about to send email to invitee email address: ' + invite.email);

                var message = {
                    from: config.formatted_from_email,
                    to: invite.email,
                    subject: 'You have been invited to a task by ' + invite.sender.name,
                    text: 'You have been invited to a task by ' + invite.sender.name + ' link: ' + config.base_url + '?invite=' + invite._id
                    // html: '<p>You have been invited to a task!</p>'
                };

                emailer.send(message)
                    .then((info) => {
                        callback();
                    })
                    .catch(callback);

            }, (err) => {
                if (err) return reject(err);
                resolve();
            });
        }
    });
}

module.exports = mongoose.model('Invite', InviteSchema);