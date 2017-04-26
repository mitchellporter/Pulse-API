const router = require('express').Router();
const updateController = require('./updateController');

const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', updateController.params);

router.route('/')
.post(checkUser, updateController.post)


module.exports = router;