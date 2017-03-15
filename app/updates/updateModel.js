var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResponseSchema = require('./responseModel').schema;

var types = ['automated', 'requested', 'random'];

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
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
		required: true
	},
	completion_percentage: {
		type: Number,
		required: true
	},
	responses: [ResponseSchema]
});

UpdateSchema.pre('validate', function(next) {
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