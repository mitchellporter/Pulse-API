var router = require('express').Router();

router.use('/auth', require('../auth/routes'));
router.use('/users', require('../users/userRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/task_invitations', require('../task_invitations/taskInvitationRoutes'));
router.use('/updates', require('../updates/updateRoutes'));
router.use('/teams', require('../teams/teamRoutes'));
router.use('/feeds', require('../feeds/feedRoutes'));
router.use('/availability', require('../availability/availabilityRoutes'));

module.exports = router;