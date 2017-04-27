const Model = require('objection').Model;
const Task = require('../tasks/task');

class UpdateRequest extends Model {
	static get tableName() {
		return 'UpdateRequest';
	}

	static get relationMappings() {
		return {
			task: {
				relation: Model.BelongsToOneRelation,
				modelClass: Task,
				join: {
					from: 'updaterequest.task',
					to: 'task.id'
				}
			}
		}
	}
}

module.exports = UpdateRequest;