var router = require('express').Router();
var taskController = require('./taskController');
var auth = require('../auth/auth');


router.param('id', taskController.params);

router.route('/')
.get(taskController.get)
.post(auth.getUser, taskController.post)

module.exports = router;