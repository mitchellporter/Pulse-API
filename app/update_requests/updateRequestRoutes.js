var router = require('express').Router();
var updateRequestController = require('./updateRequestController');
var updateController = require('../updates/updateController');
var auth = require('../auth/auth');

router.param('id', updateRequestController.params);

router.route('/')
.get(auth.getUser, updateRequestController.get)
.post(auth.getUser, updateRequestController.post)

router.route('/:id')
.get(auth.getUser, updateRequestController.getOne)

router.route('/:id/updates')
.get(auth.getUser, updateController.get)
.post(auth.getUser, updateController.post)

module.exports = router;