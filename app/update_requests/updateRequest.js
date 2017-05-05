const Model = require('objection').Model;

class UpdateRequest extends Model {
	static get tableName() {
		return 'UpdateRequest';
	}

	static get relationMappings() {
		return {
			task: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('update_requests', 'tasks')}/task`,
				join: {
					from: 'UpdateRequest.task_id',
					to: 'Task.id'
				}
			},
			sender: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('update_requests', 'users')}/user`,
				join: {
					to: 'UpdateRequest.sender_id',
					from: 'User.id'
				}
			},
			receiver: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('update_requests', 'users')}/user`,
				join: {
					to: 'UpdateRequest.receiver_id',
					from: 'User.id'
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
				receiver_id: { type: 'integer' }
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
		return super.$parseJson(json, opt);
	}
}

module.exports = UpdateRequest;