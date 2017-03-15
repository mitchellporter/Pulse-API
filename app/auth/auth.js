var Promise = require('bluebird');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var User = require('../users/userModel');
var logger = require('../../lib/logger');
var config = require('../../config/config');
var checkToken = expressJwt({ secret: config.secrets.jwt });

exports.getUser = function(req, res, next) {
  logger.silly('fetching user with decoded tokens _id field');
	// user is the decoded token payload
	// we store the _id for identification :P
	var userId = req.user._id;
	User.findById(userId)
		.then(function(user) {
		if(!user) return next(new Error('no user exists with that id'));
		req.user = user;
		next();
	})
	.catch(next);
};

exports.decodeToken = function() {
  return function(req, res, next) {
    logger.silly('decoding JWT');
    // make it optional to place token on query string
    // if it is, place it on the headers where it should be
    // so checkToken can see it. See follow the 'Bearer 034930493' format
    // so checkToken can see it and decode it
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }

    // this will call next if token is valid
    // and send error if its not. It will attached
    // the decoded token to req.user
    checkToken(req, res, next);
  };
};

// 1. Checks if user even exists
// 2. Checks if req.body.password matches the pw for user in the DB
exports.verifyUser = function() {
return function(req, res, next) {

  var email_address = req.body.email_address;
  var password = req.body.password;

  if (!email_address || !password) {
    res.status(400).json({ 
      error: {
        message: 'You need an email address and password.'
    }});
    return;
  }

  // Find the user
  User.findOne({ email_address: email_address })
  .then(function(user) {
    if (!user) {
      res.status(401).json({
        error: {
          message: 'No user with email address of ' + email_address
        }
      });
    } else {
      // We found a user, so let's check the password now
      user.authenticate(password, function(err, result) {
        if (err) return next(err);
        if (!result) return res.status(401).json({
              error: {
                  message: 'The password you entered was incorrect.'
              }
          });
          
          // Password was correct
          req.user = user;
          next();
      });
    }
  }), function(err) {
    next(err);
  };
};
};

// util method to sign tokens on signup
exports.signToken = function(id) {
  return jwt.sign(
    { _id: id },
    config.secrets.jwt,
    { expiresIn: '100d' }
  );
};

exports.isOwner = function() {
    return function(req, res, next) {
        
    var tokenUserId = req.user._id.toString();
    var paramUserId = req.params.id;
    logger.silly('About to run isOwner middleware');
    logger.silly('token user id: ' + tokenUserId);
    logger.silly('param user id: ' + paramUserId);
    if (tokenUserId !== paramUserId) {
        return res.status(402).json({
            success: false,
            error: {
                message: 'You cant look at another users feed.'
            }
        });
    }
    // User is owner of feed
    next();
    }
};


