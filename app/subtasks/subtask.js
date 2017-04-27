const Model = require('objection').Model;
const Task = require('../tasks/task');
const User = require('../users/user');

class Subtask extends Model {
	static get tableName() {
		return 'Subtask';
	}

	static get relationMappings() {
		return {
			task: {
				relation: Model.BelongsToOneRelation,
				modelClass: Task,
				join: {
					from: 'subtask.task',
					to: 'task.id'
				}
			},
			created_by: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'subtask.created_by',
					to: 'user.id'
				}
			},
			completed_by: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'subtask.completed_by',
					to: 'user.id'
				}
			}
		}
	}
}

module.exports = Subtask;