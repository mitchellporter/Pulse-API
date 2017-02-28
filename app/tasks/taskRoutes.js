var router = require('express').Router();
var taskController = require('./taskController');
var itemController = require('../items/itemController');
var updateController = require('../updates/updateController');
var auth = require('../auth/auth');

router.param('id', taskController.params);

router.route('/')
.get(taskController.get)
.post(auth.getUser, taskController.post)

router.route('/:id/updates')
.post(auth.getUser, updateController.post)

router.route('/:id/request_update')
.post(auth.getUser, updateController.requestUpdate)

router.use('/:id/items', require('../items/itemRoutes'));

module.exports = router;