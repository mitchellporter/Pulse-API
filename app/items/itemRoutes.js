var router = require('express').Router();
var itemController = require('./itemController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', itemController.params);

router.route(checkUser, '/:id')
.put(itemController.put)

module.exports = router;