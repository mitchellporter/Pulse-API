const router = require('express').Router();
const projectController = require('./projectController');
const auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', projectController.params);

router.route('/')
.get(checkUser, projectController.get)
.post(projectController.post)

module.exports = router;