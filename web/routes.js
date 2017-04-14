const express = require('express')
const router = express.Router();

router.use('/', express.static('client/webapp'));
router.use('/tasks/:taskId/invites/:inviteId', express.static('views'));

module.exports = router;