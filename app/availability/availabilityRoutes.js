var router = require('express').Router();
var availabilityController = require('./availabilityController');

router.route('/teams')
.get(availabilityController.teams) // GET or POST ?

router.route('/usernames')
.get(availabilityController.usernames)

router.route('/emails')
.get(availabilityController.emails)

module.exports = router;