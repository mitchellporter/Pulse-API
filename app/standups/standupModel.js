const Model = require('objection').Model;
const User = require('../users/user');

class Standup extends Model {
	static get tableName() {
		return 'Standup';
	}

	static get relationMapping() {
		return {
			author: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'standup.author',
					to: 'user.id'
				}
			}
		}
	}
}