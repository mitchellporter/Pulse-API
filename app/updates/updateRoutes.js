var router = require('express').Router();
var updateController = require('./updateController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', updateController.params);

router.route('/')
.post(checkUser, updateController.post)

router.route('/:id')
.put(checkUser, updateController.put);

router.use('/:id/responses', require('../responses/responseRoutes'));

module.exports = router;