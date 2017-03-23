var router = require('express').Router();
var updateController = require('./updateController');
var auth = require('../auth/auth');

var checkUser = [auth.decodeToken(), auth.getUser];

router.param('id', updateController.params);

router.route('/')
.post(checkUser, updateController.post)

router.route('/:id')
.put(checkUser, updateController.put);

router.use('/:id/responses', require('../responses/responseRoutes'));

module.exports = router;



// 1. Request update on task: POST /tasks/:id/updates/
// 2. Respond to update request: PUT /updates/:id
// 3. Send random update as assignee: POST /tasks/:id/updates

// Conversation w/ members and messages (chat)
// Update w/ assignees and responses