var router = require('express').Router();
var auth = require('../auth/auth');
var taskController = require('../tasks/taskController');

router.route('/my_tasks')
.get(auth.getUser, taskController.myTasks)

router.route('/tasks_created')
.get(auth.getUser, taskController.tasksCreated);

router.route('/updates')
.get(auth.getUser, taskController.getUpdates)

module.exports = router;