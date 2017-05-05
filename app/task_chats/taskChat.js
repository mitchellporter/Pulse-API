const Model = require('objection').Model;

class TaskChat extends Model {
    static get tableName() {
        return 'TaskChat';
    }

    static get relationMappings() {
        return {
            sender: {
                relation: Model.BelongsToOneRelation,
                modelClass: `${__dirname.replace('task_chats', 'users')}/user`,
                join: {
                    from: 'taskchat.sender',
                    to: 'user.id'
                }
            },
            receiver: {
                relation: Model.BelongsToOneRelation,
                modelClass: `${__dirname.replace('task_chats', 'users')}/user`,
                join: {
                    from: 'taskchat.receiver',
                    to: 'user.id'
                }
            },
            task: {
                relation: Model.BelongsToOneRelation,
                modelClass: `${__dirname.replace('task_chats', 'tasks')}/task`,
                join: {
                    from: 'taskchat.task',
                    to: 'task.id'
                }
            }
        }
    }
}

module.exports = TaskChat;