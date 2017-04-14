const router = require('express').Router();
const auth = require('../auth/auth');
const feedController = require('../feeds/feedController');

var checkUser = [auth.decodeToken(), auth.getUser];

router.route('/my_tasks')
.get(checkUser, feedController.myTasks)

router.route('/tasks_created')
.get(checkUser, feedController.tasksCreated);

router.route('/updates')
.get(checkUser, feedController.getUpdates)

module.exports = router;
