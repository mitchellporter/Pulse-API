const Model = require('objection').Model;
const User = require('../users/user');
const Task = require('../tasks/task');
const UpdateRequest = require('../update_requests/updateRequest');

class Update extends Model {
	static get tableName() {
		return 'Update';
	}

	static get relationMappings() {
		return {
			sender: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'update.sender',
					to: 'user.id'
				}
			},
			receiver: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'update.receiver',
					to: 'user.id'
				}
			},
			task: {
				relation: Model.BelongsToOneRelation,
				modelClass: Task,
				join: {
					from: 'update.task',
					to: 'task.id'
				}
			},
			update_request: {
				relation: Model.BelongsToOneRelation,
				modelClass: UpdateRequest,
				join: {
					from: 'update.update_request',
					to: 'updaterequest.id'
				}
			}
		}
	}
}

module.exports = Update;