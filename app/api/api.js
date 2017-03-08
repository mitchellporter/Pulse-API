var router = require('express').Router();

router.use('/users', require('../users/userRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/task_invitations', require('../tasks/taskInvitationRoutes'));
router.use('/update_requests', require('../update_requests/updateRequestRoutes'));
router.use('/teams', require('../teams/teamRoutes'));
router.use('/feeds', require('../Feed/myTaskRoutes'));

module.exports = router;