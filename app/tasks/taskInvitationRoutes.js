var router = require('express').Router();
var taskInvitationController = require('./taskInvitationController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', taskInvitationController.params);

router.route('/:id')
.put(checkUser, taskInvitationController.put)

module.exports = router;