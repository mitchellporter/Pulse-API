const logger = require('../../lib/logger');
const Team = require('./team');
const User = require('../users/user');
const signToken = require('../auth/auth').signToken;

exports.params = function(req, res, next, id) {
    Team.findById(id)
    .then((team) => {
		if(!team) return next(new Error('no team exists with that id'));
        req.team = team;
        next();
    })
    .catch(next);
};

exports.search = function(req, res, next) {
    var name = req.query.search;
    Team.findOne({ name: name })
    .then((team) => {
        if (!team) return next(new Error('no team exists with that name'));
        res.status(200).json({
            success: true,
            team: team
        });
    })
    .catch(next);
};

exports.getOne = function(req, res, next) {
    var team = req.team;
    res.status(200).json({
        success: true,
        team: team
    });
};

exports.post = function(req, res, next) {

// Create team, then create user
var team_name = req.body.team_name;
var team = new Team({
    name: team_name
});

createTeam()
.then(createUser)
.then((user) => {

    var token = signToken(user._id);
    res.status(201).json({
        success: true,
        team: user.team,
        user: user,
        token: token
    });
})
.catch(next);

function createTeam() {
    return team.save();
}

function createUser(team) {
    var user = new User(req.body);
    user.team = team;
    return user.save();
}
};

exports.getMembers = function(req, res, next) {
    var team = req.team;
    
    User.find({ team: team })
    .then((users) => {
        res.status(200).json({
            success: true,
            team_members: users
        });
    })
    .catch(next);
};