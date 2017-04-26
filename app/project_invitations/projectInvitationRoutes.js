const router = require('express').Router();
const projectInvitationController = require('./projectInvitationController');
const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', projectInvitationController.params);

router.route('/')
.get(checkUser, projectInvitationController.get)
.post(checkUser, projectInvitationController.post)

module.exports = router;

