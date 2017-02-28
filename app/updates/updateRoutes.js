var router = require('express').Router();
var updateController = require('./updateController');

router.param('id', updateController.params);

router.route('/')
.get(updateController.get)
.post(updateController.post)

router.route('/:id')
.get(updateController.getOne)

module.exports = router;