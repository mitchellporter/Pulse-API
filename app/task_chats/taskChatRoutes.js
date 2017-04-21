const router = require('express').Router();
const taskChatController = require('./taskChatController');

const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', taskChatController.params);

router.route('/')
.get(checkUser, taskChatController.get)
.post(checkUser, taskChatController.post);

module.exports = router;