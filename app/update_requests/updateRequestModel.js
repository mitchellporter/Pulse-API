var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var types = ['request', 'response'];

var UpdateRequestSchema = new Schema({
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date,
        required: true
    },
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	receivers: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}],
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
		required: true
	}
});

UpdateRequestSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

UpdateRequestSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('UpdateRequest', UpdateRequestSchema);