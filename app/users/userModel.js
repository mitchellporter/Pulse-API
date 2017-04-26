'use strict';

const Model = require('objection').Model;
const Team = require('../teams/team');

class User extends Model {
	// Table name is the only required property
	static get tableName() {
		return 'User';
	}

	// This object defines the relations to other models
	static get  relationMappings() {
		return {
			team: {
				relation: Model.BelongsToOneRelation,
				modelClass: Team,
				join: {
					from: 'user.team',
					to: 'team.id'
				}
			}
		}
	}
}

module.exports = user;