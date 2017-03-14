var router = require('express').Router();
var auth = require('../auth/auth');
var feedController = require('../feeds/feedController');

var checkUser = [auth.decodeToken(), auth.getUser];

router.route('/my_tasks')
.get(checkUser, feedController.myTasks)

router.route('/tasks_created')
.get(checkUser, feedController.tasksCreated);

router.route('/updates')
.get(checkUser, feedController.getUpdates)

module.exports = router;
