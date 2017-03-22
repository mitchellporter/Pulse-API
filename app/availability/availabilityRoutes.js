var router = require('express').Router();
var teamController = require('../teams/teamController');
var availabilityController = require('./availabilityController');

router.param('id', teamController.params);

router.route('/teams')
.get(availabilityController.teams) // GET or POST ?

router.route('/teams/:id/usernames')
.get(availabilityController.usernames)

router.route('/teams/:id/emails')
.get(availabilityController.emails)

module.exports = router;