var router = require('express').Router();
var taskController = require('./taskController');
var itemController = require('../items/itemController');
var auth = require('../auth/auth');

router.param('id', taskController.params);

router.route('/')
.get(taskController.get)
.post(auth.getUser, taskController.post)

router.route('/:id/request_update')
.post(auth.getUser, taskController.requestUpdate)

router.route('/:id/send_update')
.post(auth.getUser, taskController.sendUpdate)

router.use('/:id/items', require('../items/itemRoutes'));

module.exports = router;