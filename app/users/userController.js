const logger = require('../../lib/logger');
const User = require('./userModel');
const Team = require('../teams/teamModel');
const signToken = require('../auth/auth').signToken;

exports.params = function(req, res, next, id) {
	User.findById(id)
	.then((user) => {
		if(!user) return next(new Error('no user exists with that id'));
		req.user = user;
		next();
	})
	.catch((err) => {
		next(err);
	})
};

// TODO: Make sure email address is not already taken on the team
exports.joinTeam = function(req, res, next) {
	var team = req.team;
	var user = new User(req.body);
	user.team = team;

	user.save()
	.then((user) => {
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
// 1. Find team
// 2. Create user
	var team_name = req.body.team_name;
	var user = new User(req.body);

	findTeam()
	.then(createUser)
	.then((user) => {
		var token = signToken(user._id);

		// TODO: Needs final params
		res.cookie('token', token, {
			httpOnly: false,
			expires: expiry
		});

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
	.then((users) => {
		res.status(200).json({
			success: true,
			team_members: users
		});
	})
	.catch(next);
};