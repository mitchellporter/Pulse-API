var Promise = require('bluebird');
var User = require('../users/userModel');
var logger = require('../../lib/logger');

exports.getUser = function(req, res, next) {
	var userId = req.headers.authorization;
	logger.silly('about to fetch user and attach to req with user id: ' + userId);
	
	User.findById(userId)
		.then(function(user) {
		if(!user) return next(new Error('no user exists with that id'));
		req.user = user;
		next();
	})
	.catch(next);
};