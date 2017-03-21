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

exports.post = function(req, res, next) {
    // Signup for new team:
// team
// username
// email address
// password

// Create team, then create user
var team_name = req.body.team_name;
var team = new Team({
    name: team_name
});

createTeam()
.then(createUser)
.then(function(user) {
    res.status(201).json({
        success: true,
        user: user
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


// Signup for existing team:
// team
// username
// email address
// password

// Just create user
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