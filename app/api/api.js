const router = require('express').Router();

router.use('/auth', require('../auth/routes'));
router.use('/members', require('../users/userRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/task_invitations', require('../task_invitations/taskInvitationRoutes'));
router.use('/updates', require('../updates/updateRoutes'));
router.use('/teams', require('../teams/teamRoutes'));
router.use('/feeds', require('../feeds/feedRoutes'));
router.use('/availability', require('../availability/availabilityRoutes'));
router.use('/invites', require('../invites/inviteRoutes'));
router.use('/standups', require('../standups/standupRoutes'));

module.exports = router;