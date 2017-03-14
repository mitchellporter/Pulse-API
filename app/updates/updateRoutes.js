var router = require('express').Router();
var updateController = require('./updateController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];


router.route('/')
.post(checkUser, updateController.post)

module.exports = router;