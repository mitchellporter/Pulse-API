var logger = require('../../lib/logger');
var Team = require('./teamModel');
var User = require('../users/userModel');

exports.params = function(req, res, next, id) {
    Team.findById(id)
    .then(function(team) {
		if(!team) return next(new Error('no team exists with that id'));
        req.team = team;
        next();
    })
    .catch(next);
};

exports.getMembers = function(req, res, next) {
    var team = req.team;
    
    User.find({ team: team })
    .then(function(users) {
        res.status(200).json({
            success: true,
            team_members: users
        });
    })
    .catch(next);
};