var router = require('express').Router();
var updateController = require('./updateController');
var auth = require('../auth/auth');

router.param('id', updateController.params);

router.route('/')
.get(auth.getUser, updateController.get)

router.route('/:id')
.get(auth.getUser, updateController.getOne)

module.exports = router;