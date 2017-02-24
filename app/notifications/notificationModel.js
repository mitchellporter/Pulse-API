var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var types = ['request', 'response'];

var NotificationSchema = new Schema({
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
    type: {
		type: String,
		required: true,
		enum: types
	}
});

NotificationSchema.pre('validate', function(next) {
	if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

NotificationSchema.methods = {
	toJSON: function() {
		var obj = this.toObject();
		obj.created_at = this.created_at.getTime();
		obj.updated_at = this.updated_at.getTime();
		delete obj.__v;
		return obj;
	}
}

module.exports = mongoose.model('Notification', NotificationSchema);