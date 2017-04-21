const router = require('express').Router();
const updateRequestController = require('./updateRequestController');

const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', updateRequestController.params);

router.route('/')
.get(checkUser, updateRequestController.get)
.post(checkUser, updateRequestController.post)

module.exports = router;