const router = require('express').Router();
const subtaskController = require('./subtaskController');
const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', subtaskController.params);

router.route('/')
.get(checkUser, subtaskController.get)
.post(checkUser, subtaskController.post);

module.exports = router;