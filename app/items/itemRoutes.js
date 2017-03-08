var router = require('express').Router();
var itemController = require('./itemController');
var auth = require('../auth/auth');

router.param('id', itemController.params);

router.route('/:id')
.put(itemController.put)

module.exports = router;