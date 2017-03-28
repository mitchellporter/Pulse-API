var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var types = ['team', 'task'];

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


module.exports = mongoose.model('Invite', InviteSchema);