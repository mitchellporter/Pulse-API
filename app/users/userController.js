var logger = require('../../lib/logger');
var User = require('./userModel');
var Team = require('../teams/teamModel');
var signToken = require('../auth/auth').signToken;

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

// TODO: Make sure email address + username are not already taken on the team
exports.joinTeam = function(req, res, next) {
	var team = req.team;
	var user = new User(req.body);
	user.team = team;

	user.save()
	.then(function(user) {
		var token = signToken(user._id);
		res.status(201).json({
			success: true,
			token: token,
			user: user
		});
	})
	.catch(next);
};

// TODO: This may end up being moved to /teams/:teamId/members
exports.post = function(req, res, next) {
	// Signup for existing team:
// team
// username
// email address
// password

// Just create user

// 1. Find team
// 2. Create user
	var team_name = req.body.team_name;
	var user = new User(req.body);

	findTeam()
	.then(createUser)
	.then(function(user) {
		var token = signToken(user._id);
		res.status(201).json({
			success: true,
			team: user.team,
			user: user,
			token: token
		});
	})
	.catch(next);

	function findTeam() {
		return Team.findOne({ name: team_name });
	}

	function createUser(team) {
		if (!team) return Promise.reject(new Error('team does not exist'));
		user.team = team;
		return user.save();
	}
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