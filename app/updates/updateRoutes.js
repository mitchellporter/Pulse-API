var router = require('express').Router();
var updateController = require('./updateController');
var auth = require('../auth/auth');

router.route('/')
.post(auth.getUser, updateController.post)

module.exports = router;