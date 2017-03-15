var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResponseSchema = new Schema({
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
    }
});

ResponseSchema.pre('validate', function(next) {
    if(!this.created_at) this.created_at = new Date();
	this.updated_at = new Date();
	next();
});

ResponseSchema.methods = {
    toJSON: function() {
        var obj = this.toObject();
		delete obj.__v;
		return obj;
    }
};

module.exports = mongoose.model('Response', ResponseSchema);