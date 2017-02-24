var router = require('express').Router();
var teamController = require('./teamController');
var auth = require('../auth/auth');

router.param('id', teamController.params);

router.route('/:id/members')
.get(teamController.getMembers)

module.exports = router;