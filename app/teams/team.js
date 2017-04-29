const Model = require('objection').Model;

class Team extends Model {
	static get tableName() {
		return 'Team';
	}
}

module.exports = Team;