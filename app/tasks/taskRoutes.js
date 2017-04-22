const router = require('express').Router();
const taskController = require('./taskController');
const subtaskController = require('../subtasks/subtaskController');
const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', taskController.params);

router.route('/')
.get(checkUser, taskController.get)
.post(checkUser, taskController.post)

router.route('/:id')
.get(checkUser, taskController.getOne)
.put(checkUser, taskController.put)
.delete(checkUser, taskController.delete)

router.use('/:id/updates', require('../updates/updateRoutes'));

// router.route('/:id/request_updates')
// .post(auth.getUser, updateController.requestUpdate)

// router.route('/:id/send_update')
// .post(auth.getUser, updateController.sendUpdate)

router.use('/:id/invitations', require('../task_invitations/taskInvitationRoutes'));

router.use('/:id/subtasks', require('../subtasks/subtaskRoutes'));

router.use('/:id/invites', require('../invites/inviteRoutes'));

module.exports = router;