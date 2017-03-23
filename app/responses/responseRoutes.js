var router = require('express').Router();
var responseController = require('./responseController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', responseController.params);

router.route('/:id')
.put(checkUser, responseController.put);

router.route('/:id/resend')
.post(checkUser, responseController.resend);

module.exports = router;