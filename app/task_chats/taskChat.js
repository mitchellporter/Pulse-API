const Model = require('objection').Model;
const User = require('../users/user');
const Task = require('../tasks/task');

class TaskChat extends Model {
    static get tableName() {
        return 'TaskChat';
    }

    static get relationMappings() {
        return {
            sender: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'taskchat.sender',
                    to: 'user.id'
                }
            },
            receiver: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'taskchat.receiver',
                    to: 'user.id'
                }
            },
            task: {
                relation: Model.BelongsToOneRelation,
                modelClass: Task,
                join: {
                    from: 'taskchat.task',
                    to: 'task.id'
                }
            }
        }
    }
}

module.exports = TaskChat;