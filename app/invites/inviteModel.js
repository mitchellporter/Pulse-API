var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

InviteSchema.methods = {
    toJSON: toJSON
}

function toJSON() {
    var obj = this.toObject();
	delete obj.__v;
	return obj;
}

function send() {
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


module.exports = mongoose.model('Invite', InviteSchema);