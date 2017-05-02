const Model = require('objection').Model;
const Project = require('../projects/project');
const User = require('../users/user');

class Task extends Model {
	static get tableName() {
		return 'Task';
	}

	static get relationMappings() {
		return {
			project: {
				relation: Model.BelongsToOneRelation,
				modelClass: Project,
				join: {
					from: 'Task.project_id',
					to: 'Project.id'
				}
			},
			assigner: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'Task.assigner_id',
					to: 'User.id'
				}
			},
			assignee: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'Task.assignee_id',
					to: 'User.id'
				}
			}
		}
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['title', 'project_id', 'assigner_id', 'assignee_id'],
			properties: {
				title: { type: 'string' },
				// due_date: { type: 'date' },
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