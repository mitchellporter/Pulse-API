const logger = require('../../lib/logger');
const TaskChat = require('./taskChat');

exports.params = function(req, res, next, id) {
    TaskChat.findById(id)
    .then(task_chat => {
        if (!task_chat) return next(new Error('no task chat exists with that id'));
        req.task_chat = task_chat;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {
    TaskChat.find()
    .then(task_chats => {
        res.status(200).json({
            success: true,
            task_chats: task_chats
        });
    })
    .catch(next);
};

exports.post = function(req, res, next) {
    var task_chat = new TaskChat({
        message: req.body.message,
        task: req.body.task,
        sender: req.user
    });
    
    task_chat.save()
    .then(task_chat => {
        res.status(201).json({
            success: true,
            task_chat
        });
    }) 
    .catch(next);
};