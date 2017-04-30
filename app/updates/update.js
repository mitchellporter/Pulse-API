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
			task: {
				relation: Model.BelongsToOneRelation,
				modelClass: Task,
				join: {
					from: 'Update.task_id',
					to: 'Task.id'
				}
			},
			sender: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'Update.sender_id',
					to: 'User.id'
				}
			},
			receiver: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'Update.receiver_id',
					to: 'User.id'
				}
			},
			update_request: {
				relation: Model.BelongsToOneRelation,
				modelClass: UpdateRequest,
				join: {
					from: 'Update.update_request_id',
					to: 'UpdateRequest.id'
				}
			}
		};
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['task_id', 'sender_id', 'receiver_id'],
			properties: {
				task_id: { type: 'integer' },
				sender_id: { type: 'integer' },
				receiver_id: { type: 'integer' },
				update_request_id: { type: 'integer' },
				comment: { type: 'string' }
			}
		};
	}

	$parseJson(json, opt) {
		if (json.task) {
			json.task_id = json.task;
			delete json.task;
		}

		if (json.sender) {
			json.sender_id = json.sender;
			delete json.sender;
		}

		if (json.receiver) {
			json.receiver_id = json.receiver;
			delete json.receiver;
		}

		if (json.update_request) {
			json.update_request_id = json.update_request;
			delete json.update_request;
		}
		return super.$parseJson(json, opt);
	}
}

module.exports = Update;