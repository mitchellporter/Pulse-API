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

// Use this for status changes - in_progress and completed
exports.update = function(req, res, next) {
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

exports.delete = function(req, res, next) {
    var task = req.task;
    var item = req.item;

    Item.remove({ _id: item._id })
    .then(function(item) {
        res.status(200).json({
            success: true
        });
    })
    .catch(next);
};