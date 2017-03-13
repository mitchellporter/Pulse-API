var router = require('express').Router();
var auth = require('../auth/auth');
var feedController = require('../feeds/feedController');

router.route('/my_tasks')
.get(auth.getUser, feedController.myTasks)

router.route('/tasks_created')
.get(auth.getUser, feedController.tasksCreated);

router.route('/updates')
.get(auth.getUser, feedController.getUpdates)

module.exports = router;
