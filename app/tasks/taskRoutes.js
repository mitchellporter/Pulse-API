const router = require('express').Router();
const taskController = require('./taskController');
const subtaskController = require('../subtasks/subtaskController');
const auth = require('../auth/auth');
const checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', taskController.params);

router.route('/')
.get(checkUser, taskController.get)
.post(checkUser, taskController.post)

router.route('/:id')
.get(checkUser, taskController.getOne)
.put(checkUser, taskController.put)
.delete(checkUser, taskController.delete)

module.exports = router;