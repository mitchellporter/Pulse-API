var router = require('express').Router();

router.use('/users', require('../users/userRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/updates', require('../updates/updateRoutes'));
router.use('/update_responses', require('..//update_responses/updateResponseRoutes'));
router.use('/teams', require('../teams/teamRoutes'));

module.exports = router;