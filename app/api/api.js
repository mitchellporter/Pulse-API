var router = require('express').Router();

router.use('/users', require('../users/userRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/updates', require('../updates/updateRoutes'));
router.use('/teams', require('../teams/teamRoutes'));

module.exports = router;