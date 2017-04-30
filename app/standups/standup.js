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
					from: 'Standup.author_id',
					to: 'User.id'
				}
			}
		};
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['author_id', 'text'],
			properties: {
				author_id: { type: 'integer' },
				text: { type: 'string' }
			}
		};
	}

	$parseJson(json, opt) {
		if (json.author) {
			json.author_id = json.author;
			delete json.author;
		}
		return super.$parseJson(json, opt);
	}
}

module.exports = Standup;