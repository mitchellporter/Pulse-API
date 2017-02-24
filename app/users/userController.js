var logger = require('../../lib/logger');
var User = require('./userModel');

exports.params = function(req, res, next, id) {
	User.findById(id)
	.then(function(user) {
		if(!user) return next(new Error('no user exists with that id'));
		req.user = user;
		next();
	})
	.catch(function(err) {
		next(err);
	})
};

exports.get = function(req, res, next) {
	User.find({})
	.then(function(users) {
		res.status(200).json({
			success: true,
			team_members: users
		});
	})
	.catch(next);
};