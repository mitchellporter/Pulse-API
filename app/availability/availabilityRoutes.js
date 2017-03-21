var router = require('express').Router();
var availabilityController = require('./availabilityController');

router.route('/teams')
.post(availabilityController.teams) // GET or POST ?

module.exports = router;