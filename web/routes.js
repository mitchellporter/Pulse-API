var express = require('express')
var router = express.Router();

router.use('/', express.static('views'));
router.use('/tasks/:taskId/invites/:inviteId', function(res, req, next) {

});

module.exports = router;