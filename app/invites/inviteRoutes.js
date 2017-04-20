const router = require('express').Router();
const auth = require('../auth//auth');
const inviteController = require('./inviteController');

const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', inviteController.params);

router.route('/:id')
.get(inviteController.getOne)
.put(inviteController.put);

router.route('/')
.post(checkUser, inviteController.post);

module.exports = router;