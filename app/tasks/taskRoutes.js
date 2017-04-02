var router = require('express').Router();
var taskController = require('./taskController');
var itemController = require('../items/itemController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];


router.param('id', taskController.params);

router.route('/')
.get(checkUser, taskController.get)
.post(checkUser, taskController.post)

router.route('/:id')
.get(checkUser, taskController.getOne)
.put(checkUser, taskController.put)

router.use('/:id/updates', require('../updates/updateRoutes'));

router.route('/:id/assignees')
.post(checkUser, taskController.addAssignees)

// router.route('/:id/request_updates')
// .post(auth.getUser, updateController.requestUpdate)

// router.route('/:id/send_update')
// .post(auth.getUser, updateController.sendUpdate)

router.use('/:id/invitations', require('../task_invitations/taskInvitationRoutes'));

router.use('/:id/items', require('../items/itemRoutes'));

router.use('/:id/invites', require('../invites/inviteRoutes'));

module.exports = router;