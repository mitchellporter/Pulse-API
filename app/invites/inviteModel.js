var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');
var logger = require('../../lib/logger');

var types = ['team', 'task'];
var statuses = ['pending', 'accepted'];

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
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
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
    return new Promise(function (resolve, reject) {
        var options = {
            service: 'Gmail',
            auth: {
                user: 'ellroiapp@gmail.com',
                pass: 'kirkland1234'
            }
        };

        var callback = function (err, success) {
            if (err) console.log(err);
            if (success) console.log(success);
            ready();
        }

        var Emailer = require('./emailer');
        var emailer = new Emailer(options, callback);

        function ready() {
            logger.silly('about to send email to invitee email address: ' + this.email);
            var message = {
                from: 'ellroiapp@gmail.com',
                to: this.email,
                subject: 'You have been invited to a task!',
                text: 'You have been invited to a task!',
                html: '<p>You have been invited to a task!</p>'
            };

            emailer.send(message)
            .then(resolve)
            .catch(reject);
        }
    }.bind(this));
}

function sendInvites(invites) {
    var callback = function (err, success) {
        if (err) console.log(err);
        if (success) console.log(success);
        ready();
    }

    var options = {
        service: 'Gmail',
        auth: {
            user: 'ellroiapp@gmail.com',
            pass: 'kirkland1234'
        }
    };

    var Emailer = require('../../lib/emailer');
    var emailer = new Emailer(options, callback);

    function ready() {
        return new Promise(function (resolve, reject) {

            async.forEachOf(invites, function (value, key, callback) {
                var invite = value;
                logger.silly('about to send email to invitee email address: ' + invite.email);

                var message = {
                    from: 'ellroiapp@gmail.com',
                    to: invite.email,
                    subject: 'You have been invited to a task by ' + invite.sender.name,
                    text: 'You have been invited to a task by ' + invite.sender.name,
                    html: '<p>You have been invited to a task!</p>'
                };
                
                emailer.send(message)
                .then(function(info) {
                    callback();
                })
                .catch(callback);

            }, function (err) {
                if (err) return reject(err);
                resolve();
            }.bind(this));
        }.bind(this));
    }
}

module.exports = mongoose.model('Invite', InviteSchema);