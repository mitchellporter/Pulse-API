var router = require('express').Router();
var itemController = require('./itemController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', itemController.params);

router.route('/:id')
.put(checkUser, itemController.put)

module.exports = router;