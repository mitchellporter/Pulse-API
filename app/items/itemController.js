var logger = require('../../lib/logger');
var Item = require('./itemModel');

exports.params = function(req, res, next, id) {
    Item.findById(id)
	.then(function(item) {
		if(!item) return next(new Error('no item exists with that id'));
		req.item = item;
		next();
	})
	.catch(function(err) {
		next(err);
	})
};


// exports.markInProgress = function(req, res, next) {
//     var assignee = req.user;
//     var task = req.task;
//     var item = req.item;

//     item.status = req.status = 'in_progress';
//     Item.update(item)
//     .then(function() {
//         res.status(200).json({
//             success: true,
//             item: item
//         });

//         // TODO: Broadcast changes to assigner and assignees
//     })
//     .catch(next);
// };

// exports.markCompleted = function(req, res, next) {
    
// };

exports.updateItem = function(req, res, next) {
    var assignee = req.user;
    var task = req.task;
    var item = req.item;

    item.status = req.status;
    Item.update(item)
    .then(function() {
        res.status(200).json({
            success: true,
            item: item
        });

        // TODO: Broadcast changes to assigner and assignees
    })
    .catch(next);
};