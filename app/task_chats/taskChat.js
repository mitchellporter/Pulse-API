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

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['sender_id', 'receiver_id', 'task_id'],
            properties: {
                sender_id: { type: 'integer' },
                receiver_id: { type: 'integer' },
                task_id: { type: 'integer' }
            }
        };
    }
}

module.exports = TaskChat;