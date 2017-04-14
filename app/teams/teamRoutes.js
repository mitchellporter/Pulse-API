const router = require('express').Router();
const teamController = require('./teamController');
const userController = require('../users/userController');
const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

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