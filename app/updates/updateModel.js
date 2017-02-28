var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var types = ['request', 'reesponse'];

var UpdateSchema = new Schema({
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
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	receiver: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
		required: true
	},
	completion_percentage: {
		type: Number
	}
});

UpdateRquestSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

UpdateSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('Update', UpdateSchema);