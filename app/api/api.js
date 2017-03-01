var router = require('express').Router();

router.use('/users', require('../users/userRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/update_requests', require('../update_requests/updateRequestRoutes'));
router.use('/teams', require('../teams/teamRoutes'));

module.exports = router;