var router = require('express').Router();
var auth = require('../auth//auth');
var inviteController = require('./inviteController');

var checkUser = [auth.decodeToken(), auth.getUser];

router.route('/')
.post(checkUser, inviteController.post);

module.exports = router;