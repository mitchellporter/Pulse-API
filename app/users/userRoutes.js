const router = require('express').Router();
const userController = require('./userController');
const auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', userController.params);

router.route('/')
.get(checkUser, userController.get)
.post(userController.post)

module.exports = router;