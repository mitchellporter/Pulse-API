var logger = require('../../lib/logger');
var Team = require('../teams/teamModel');
var User = require('../users/userModel');

exports.teams = function(req, res, next) {
    var team_name = req.query.name;
    Team.findOne({ name: team_name })
    .then(function(team) {
        logger.silly('found team: ' + team);
        if (!team) return teamNameIsAvailable();
        teamNameAlreadyTaken();
    })
    .catch(next);

    // TODO: Always a successful query regardless of name availability?
    function teamNameIsAvailable() {
        res.status(200).json({
            success: true,
            team_name: team_name
        });
    }

    function teamNameAlreadyTaken() {
        res.status(200).json({
            success: false,
            error: 'team name not available'
        });
    }
};

exports.usernames = function(req, res, next) {
    var username = req.query.username;

    User.findOne({ username: username })
    .then(function(user) {
        logger.silly('found user: ' + user);
        if (!user) return usernameIsAvailable();
        usernameAlreadyTaken();
    })
    .catch(next);

    // TODO: Always a successful query regardless of username availability?
    function usernameIsAvailable() {
        res.status(200).json({
            success: true,
            username: username
        });
    }

    function usernameAlreadyTaken() {
        res.status(200).json({
            success: false,
            error: 'someone on this team already has that username'
        });
    }
};

exports.emails = function(req, res, next) {
    var email_address = req.query.email_address;

    User.findOne({ email_address: email_address })
    .then(function(user) {
        logger.silly('found user: ' + user);
        if (!user) return emailAddressIsAvailable();
        emailAddressAlreadyTaken();
    })
    .catch(next);

    // TODO: Always a successful query regardless of username availability?
    function emailAddressIsAvailable() {
        res.status(200).json({
            success: true,
            email_address: email_address
        });
    }

    function emailAddressAlreadyTaken() {
        res.status(200).json({
            success: false,
            error: 'someone on this team already has that email address'
        });
    }
};

