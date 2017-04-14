const router = require('express').Router();
const availabilityController = require('./availabilityController');

router.route('/teams')
.get(availabilityController.teams) // GET or POST ?

router.route('/emails')
.get(availabilityController.emails)

module.exports = router;