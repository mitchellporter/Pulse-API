var express = require('express')
var router = express.Router();

router.use('/', express.static('views'));
router.use('/tasks', require('../app/tasks/taskRoutes'));
// 

module.exports = router;