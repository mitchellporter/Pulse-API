const router = require('express').Router();
const standupController = require('./standupController');
const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', standupController.params);

router.route('/')
.get(checkUser, standupController.get)
.post(checkUser, standupController.post)

router.route('/:id')
.get(checkUser, standupController.getOne)

module.exports = router;