var router = require('express').Router();
var auth = require('../auth//auth');
var inviteController = require('./inviteController');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', inviteController.params);

router.route('/:id')
.get(inviteController.getOne)
.put(inviteController.put);

router.route('/')
.post(checkUser, inviteController.post);

module.exports = router;