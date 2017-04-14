const router = require('express').Router();
const taskInvitationController = require('./taskInvitationController');
const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', taskInvitationController.params);

router.route('/:id')
.get(taskInvitationController.getOne)
.put(checkUser, taskInvitationController.put)

module.exports = router;