var logger = require('../../lib/logger');
var Team = require('../teams/teamModel');

exports.teams = function(req, res, next) {
    var team_name = req.body.team_name;
    Team.findOne({ name: team_name })
    .then(function(team) {
        if (!team) teamNameIsAvailable();
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

