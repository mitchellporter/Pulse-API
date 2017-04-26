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
					from: 'task.project',
					to: 'project.id'
				}
			},
			assigner: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'task.assigner',
					to: 'user.id'
				}
			},
			assignee: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'task.assignee',
					to: 'user.id'
				}
			}
		}
	}
}