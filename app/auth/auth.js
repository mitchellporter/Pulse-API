const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const User = require('../users/user');
const Team = require('../teams/team');
const logger = require('../../lib/logger');
const config = require('../../config/config');
const checkToken = expressJwt({ secret: config.secrets.jwt });

exports.getUser = function(req, res, next) {
  logger.silly('fetching user with decoded tokens _id field');
	// user is the decoded token payload
	// we store the _id for identification :P
	var userId = req.user._id;
	User.findById(userId)
		.then((user) => {
		if(!user) return next(new Error('no user exists with that id'));
		req.user = user;
		next();
	})
	.catch(next);
};

exports.decodeToken = function() {
  return function(req, res, next) {
    logger.silly('decoding JWT: ' + req.headers.authorization);
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

    if (req.cookies.token) req.headers.authorization = 'Bearer ' + req.cookies.token;

    checkToken(req, res, next);
  };
};

// 1. Checks if user even exists
// 2. Checks if req.body.password matches the pw for user in the DB
exports.verifyUser = function () {
  return function (req, res, next) {

    logger.silly('about to verify user');

    const { team_id, team_name, email, password } = req.body;

    if (team_name) {
      Team.findOne({ name: team_name })
        .then((team) => {
          if (!team) return next(new Error('No team found with that team name'));
          return User.findOne({ team: team, email: email });
        })
        .then((user) => {
          if (!user) return next(new Error('No user found'));
          user.authenticate(password)
            .then((result) => {
              if (!result) return res.status(401).json({
                error: {
                  message: 'The password you entered was incorrect.'
                }
              });

              // Password was correct
              logger.silly('password was correct');
              req.user = user;
              next();
            })
            .catch(next);
        })
        .catch(next);
    } else {

      if (!email || !password || !team_id) {
        res.status(400).json({
          error: {
            message: 'You need a team, email address, and password to signin'
          }
        });
        return;
      }

      logger.silly('about to find user');
      User.findOne({ team: team_id, email: email })
        .then((user) => {
          if (!user) return res.status(401).json({
            error: {
              message: 'No user with email address of ' + email
            }
          });

          user.authenticate(password)
            .then((result) => {
              if (!result) return res.status(401).json({
                error: {
                  message: 'The password you entered was incorrect.'
                }
              });

              // Password was correct
              logger.silly('password was correct');
              req.user = user;
              next();
            })
            .catch(next);
        })
        .catch(next);

    }
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


