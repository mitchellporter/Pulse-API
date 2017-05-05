const Model = require('objection').Model;

class TaskInvitation extends Model {
	static get tableName() {
		return 'TaskInvitation';
	}

	static get relationMappings() {
		return {
			task: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('task_invitations', 'tasks')}/task`,
				join: {
					from: 'TaskInvitation.task_id',
					to: 'Task.id'
				}
			},
			sender: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('task_invitations', 'users')}/user`,
				join: {
					from: 'TaskInvitation.sender_id',
					to: 'User.id'
				}
			},
			receiver: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('task_invitations', 'users')}/user`,
				join: {
					from: 'TaskInvitation.receiver_id',
					to: 'User.id'
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
				status: { type: 'string' }
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
};

module.exports = TaskInvitation;