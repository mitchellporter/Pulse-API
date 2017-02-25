var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var types = ['completion_percentage'];

var UpdateRequestSchema = new Schema({
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
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
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
	}]
});

UpdateRquestSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

UpdateRequestSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		obj.created_at = this.created_at.getTime();
		obj.updated_at = this.updated_at.getTime();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('UpdateRequest', UpdateRequestSchema);