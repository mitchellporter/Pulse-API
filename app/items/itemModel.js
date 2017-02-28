var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statuses = ['in_progress', 'completed'];

var ItemSchema = new Schema({
	created_at: {
		type: Date,
		required: true
	},
	updated_at: {
		type: Date,
		required: true
	},
	text: {
		type: String,
		required: true
	},
    status: {
		type: String,
		required: true,
		default: 'in_progress',
		enum: statuses
	}
});

ItemSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

ItemSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('Item', ItemSchema);