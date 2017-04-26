const Model = require('objection').Model;
const Project = require('../projects/project');
const User = require('../users/user');

class ProjectInvitation extends Model {
	static get tableName() {
		return 'ProjectInvitation';
	}

	static get relationMappings() {
		return {
			project: {
				relation: Model.BelongsToOneRelation,
				modelClass: Project,
				join: {
					from: 'projectinvitation.project',
					to: 'project.id'
				}
			},
			sender: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'projectinvitation.sender',
					to: 'user.id'
				}
			},
			receiver: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'projectinvitation.receiver',
					to: 'user.id'
				}
			}
		}
	}
}