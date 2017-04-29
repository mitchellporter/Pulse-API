'use strict';

const Model = require('objection').Model;
const Team = require('../teams/team');
const util = require('util');

class User extends Model {

	static get tableName() {
		return 'User';
	}

	static get relationMappings() {
		return {
			team: {
				relation: Model.BelongsToOneRelation,
				modelClass: Team,
				join: {
					from: 'User.team_id',
					to: 'Team.id'
				}
			}
		};
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['email', 'password', 'name', 'avatar_url', 'position', 'team_id'],
			properties: {
				id: { type: 'integer' },
				email: { type: 'string', minLength: 1, maxLength: 255 },
				password: { type: 'string', minLength: 1, maxLength: 255 },
				name: { type: 'string', minLength: 1, maxLength: 255 },
				avatar_url: { type: 'string', minLength: 1, maxLength: 255 },
				position: { type: 'string', minLength: 1, maxLength: 255 },
				team_id: { type: 'integer' }
			}
		};
	}


	$parseJson(json, opt) {
		if (json.team) {
			json.team_id = json.team;
			delete json.team;
		}

		return super.$parseJson(json, opt);
	};

	$formatJson(json) {
		json = super.$formatJson(json);

		if (json.team_id) {
			json.team = json.team_id;
			delete json.team_id;
		}
		
		return json;
	};
}

module.exports = User;

	