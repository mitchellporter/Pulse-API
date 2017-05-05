const Model = require('objection').Model;

class ProjectInvitation extends Model {
	static get tableName() {
		return 'ProjectInvitation';
	}

	static get relationMappings() {
		return {
			project: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('project_invitations', 'projects')}/project`,
				join: {
					from: 'ProjectInvitation.project_id',
					to: 'Project.id'
				}
			},
			sender: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('project_invitations', 'users')}/user`,
				join: {
					from: 'ProjectInvitation.sender_id',
					to: 'User.id'
				}
			},
			receiver: {
				relation: Model.BelongsToOneRelation,
				modelClass: `${__dirname.replace('project_invitations', 'users')}/user`,
				join: {
					from: 'ProjectInvitation.receiver_id',
					to: 'User.id'
				}
			}
		}
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['project_id', 'sender_id', 'receiver_id'],
			properties: {
				project_id: { type: 'integer' },
				sender_id: { type: 'integer' },
				receiver_id: { type: 'integer' },
				status: { type: 'string' }
			}
		}
	}

	$parseJson(json, opt) {
		if (json.project) {
			json.project_id = json.project;
			delete json.project;
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

module.exports = ProjectInvitation;