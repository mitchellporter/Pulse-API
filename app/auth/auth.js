var Promise = require('bluebird');
var User = require('../users/userModel');
var logger = require('../../lib/logger');

exports.getUser = function(req, res, next) {
	var userId = req.headers.authorization;
	logger.silly('about to fetch user and attach to req with user id: ' + userId);
	
	User.findById(userId)
		.then(function(user) {
		logger.silly('user? ' + user);
		req.user = user;
		next();
	})
	.catch(next);
};