const router = require('express').Router();
const responseController = require('./responseController');
const auth = require('../auth/auth');

const checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', responseController.params);

router.route('/:id')
.put(checkUser, responseController.put);

router.route('/:id/resend')
.post(checkUser, responseController.resend);

module.exports = router;