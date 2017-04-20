const router = require('express').Router();
const itemController = require('./itemController');
const auth = require('../auth/auth');

const checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', itemController.params);

router.route('/:id')
.put(checkUser, itemController.put)

module.exports = router;