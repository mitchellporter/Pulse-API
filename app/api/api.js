var router = require('express').Router();

router.use('/users', require('../users/userRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
// router.use('/items', require('../items/itemRoutes'));

module.exports = router;