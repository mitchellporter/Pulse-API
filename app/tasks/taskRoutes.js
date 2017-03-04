var router = require('express').Router();
var taskController = require('./taskController');
var itemController = require('../items/itemController');
var updateRequestController = require('../update_requests/updateRequestController');
var auth = require('../auth/auth');

router.param('id', taskController.params);

router.route('/')
.get(taskController.get)
.post(auth.getUser, taskController.post)

router.route('/:id')
.get(taskController.getOne)

router.route('/:id/accept')
.post(auth.getUser, taskController.acceptTask);

router.route('/:id/decline')
.post(auth.getUser, taskController.declineTask);

router.route('/:id/update_requests')
.get(auth.getUser, updateRequestController.get)
.post(auth.getUser, updateRequestController.requestUpdate)

// router.route('/:id/request_updates')
// .post(auth.getUser, updateController.requestUpdate)

// router.route('/:id/send_update')
// .post(auth.getUser, updateController.sendUpdate)

router.use('/:id/items', require('../items/itemRoutes'));

module.exports = router;