var router = require('express').Router();
var userController = require('./userController');

router.param('id', userController.params);

router.route('/')
.get(userController.get)

module.exports = router;