var logger = require('../../lib/logger');
var Team = require('../teams/teamModel');
var User = require('../users/userModel');

exports.teams = function(req, res, next) {
    var team_name = req.query.name;
    Team.findOne({ name: team_name })
    .then((team) => {
        logger.silly('found team: ' + team);
        if (!team) return teamNameIsAvailable();
        teamNameAlreadyTaken(team);
    })
    .catch(next);

    // TODO: Always a successful query regardless of name availability?
    function teamNameIsAvailable() {
        res.status(200).json({
            success: true,
            team_name: team_name
        });
    }

    // NOTE: Not sure if this should be an error or success but then with a message saying team name not available?
    // Otherwise I have to make an extra search endpoint
    function teamNameAlreadyTaken(team) {
        res.status(200).json({
            success: false,
            team_name: team_name,
            team: team._id,
            error: 'team name not available'
        });
    }
};

exports.emails = function(req, res, next) {
    var email = req.query.email;

    User.findOne({ email: email })
    .then((user) => {
        logger.silly('found user: ' + user);
        if (!user) return emailAddressIsAvailable();
        emailAddressAlreadyTaken();
    })
    .catch(next);

    // TODO: Always a successful query regardless of email availability?
    function emailAddressIsAvailable() {
        res.status(200).json({
            success: true,
            email: email
        });
    }

    function emailAddressAlreadyTaken() {
        res.status(200).json({
            success: false,
            email: email,
            error: 'someone on this team already has that email address'
        });
    }
};

