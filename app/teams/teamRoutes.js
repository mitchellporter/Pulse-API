var router = require('express').Router();
var teamController = require('./teamController');
var userController = require('../users/userController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', teamController.params);

router.route('/')
.get(teamController.search)
.post(teamController.post)

router.route('/:id')
.get(teamController.getOne)

router.route('/:id/members')
.get(checkUser, teamController.getMembers)
.post(userController.joinTeam)

module.exports = router;