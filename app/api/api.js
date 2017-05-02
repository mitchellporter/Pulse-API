const router = require('express').Router();

router.use('/auth', require('../auth/routes'));
router.use('/members', require('../users/userRoutes'));
router.use('/projects', require('../projects/projectRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/task_chats', require('../task_chats/taskChatRoutes'));
router.use('/subtasks', require('../subtasks/subtaskRoutes'));
router.use('/project_invitations', require('../project_invitations/projectInvitationRoutes'));
router.use('/task_invitations', require('../task_invitations/taskInvitationRoutes'));
router.use('/update_requests', require('../update_requests/updateRequestRoutes'));
router.use('/updates', require('../updates/updateRoutes'));
router.use('/teams', require('../teams/teamRoutes'));
router.use('/feeds', require('../feeds/feedRoutes'));
router.use('/availability', require('../availability/availabilityRoutes'));
router.use('/standups', require('../standups/standupRoutes'));

module.exports = router;