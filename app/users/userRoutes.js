var router = require('express').Router();
var userController = require('./userController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', userController.params);

router.route('/')
.get(checkUser, userController.get)
.post(userController.post)

module.exports = router;