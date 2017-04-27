const Model = require('objection').Model;
const User = require('../users/user');
const Task = require('../tasks/task');

class TaskInvitation extends Model {
	static get tableName() {
		return 'TaskInvitation';
	}

	static get relationMappings() {
		return {
			sender: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'taskinvitation.sender',
					to: 'user.id'
				}
			},
			receiver: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'taskinvitation.receiver',
					to: 'user.id'
				}
			},
			task: {
				relation: Model.BelongsToOneRelation,
				modelClass: Task,
				join: {
					from: 'taskinvitation.task',
					to: 'task.id'
				}
			}
		}
	}
};

module.exports = TaskInvitation;