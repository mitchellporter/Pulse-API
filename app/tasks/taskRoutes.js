var router = require('express').Router();
var taskController = require('./taskController');
var itemController = require('../items/itemController');
var updateRequestController = require('../update_requests/updateRequestController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', taskController.params);

router.route('/')
.get(checkUser, taskController.get)
.post(checkUser, taskController.post)

router.route('/:id')
.get(checkUser, taskController.getOne)
.put(checkUser, taskController.put)

router.use('/:id/update_requests', require('../update_requests/updateRequestRoutes'));
router.use('/:id/updates', require('../updates/updateRoutes'));

// router.route('/:id/request_updates')
// .post(auth.getUser, updateController.requestUpdate)

// router.route('/:id/send_update')
// .post(auth.getUser, updateController.sendUpdate)

router.use('/:id/invitations', require('./taskInvitationRoutes'));

router.use('/:id/items', require('../items/itemRoutes'));

module.exports = router;