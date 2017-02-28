var router = require('express').Router();
var updateResponseController = require('./updateResponseController');
var auth = require('../auth/auth');

router.route('/')
.post(auth.getUser, updateResponseController.post)

module.exports = router;