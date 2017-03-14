var router = require('express').Router();
var updateRequestController = require('./updateRequestController');
var updateController = require('../updates/updateController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', updateRequestController.params);

router.route('/')
.get(checkUser, updateRequestController.get)
.post(checkUser, updateRequestController.post)

router.route('/:id')
.get(checkUser, updateRequestController.getOne)

router.route('/:id/updates')
.get(checkUser, updateController.get)
.post(checkUser, updateController.respondToUpdateRequest)

module.exports = router;