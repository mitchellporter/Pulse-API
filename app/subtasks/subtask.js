const Model = require('objection').Model;

class Subtask extends Model {
	static get tableName() {
		return 'Subtask';
	}

	static get relationMappings() {
		return {
			task: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('subtasks', 'tasks')}/task`,
				join: {
					from: 'Subtask.task_id',
					to: 'Task.id'
				}
			},
			created_by: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('subtasks', 'users')}/user`,
				join: {
					from: 'Subtask.created_by_id',
					to: 'User.id'
				}
			},
			completed_by: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('subtasks', 'users')}/user`,
				join: {
					from: 'Subtask.completed_by_id',
					to: 'User.id'
				}
			}
		};
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['task_id', 'created_by_id'],
			properties: {
				text: { type: 'string' },
				task_id: { type: 'integer' },
				created_by_id: { type: 'integer' },
				completed_by_id: { type: 'integer' },
				status: { type: 'string' }
			}
		};
	}

	$parseJson(json, opt) {

		if (json.task) {
			json.task_id = parseInt(json.task);
			delete json.task;
		}

		if (json.created_by) {
			json.created_by_id = parseInt(json.created_by);
			delete json.created_by;
		}

		if (json.completed_by) {
			json.completed_by_id = parseInt(json.completed_by);
			delete json.completed_by;
		}

		return super.$parseJson(json, opt);
	}
}

module.exports = Subtask;