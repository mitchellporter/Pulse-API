var router = require('express').Router();
var teamController = require('./teamController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', teamController.params);

router.route('/')
.post(teamController.post)

router.route('/:id/members')
.get(checkUser, teamController.getMembers)

module.exports = router;