const Model = require('objection').Model;

class Task extends Model {
	static get tableName() {
		return 'Task';
	}

	static get relationMappings() {
		return {
			project: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('tasks', 'projects')}/project`,
				join: {
					from: 'Task.project_id',
					to: 'Project.id'
				}
			},
			assigner: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('tasks', 'users')}/user`,
				join: {
					from: 'Task.assigner_id',
					to: 'User.id'
				}
			},
			assignee: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('tasks', 'users')}/user`,
				join: {
					from: 'Task.assignee_id',
					to: 'User.id'
				}
			},
			subtasks: {
				relation: Model.HasManyRelation,
				modelClass: `${__dirname.replace('tasks', 'subtasks')}/subtask`,
				join: {
					from: 'Task.id',
					to: 'Subtask.task_id'
				}
			}
		};
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['title', 'project_id', 'assigner_id', 'assignee_id'],
			properties: {
				title: { type: 'string' },
				due_date: { type: 'string' },
				project_id: { type: 'integer' },
				assigner_id: { type: 'integer' },
				assignee_id: { type: 'integer' }
			}
		}
	}

	$parseJson(json, opt) {
		if (json.project) {
			json.project_id = parseInt(json.project);
			delete json.project;
		}

		if (json.assigner) {
			json.assigner_id = parseInt(json.assigner);
			delete json.assigner;
		}

		if (json.assignee) {
			json.assignee_id = parseInt(json.assignee);
			delete json.assignee;
		}
		return super.$parseJson(json, opt);
	}
}

module.exports = Task;