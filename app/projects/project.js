'use strict';

const Model = require('objection').Model;

class Project extends Model {
    static get tableName() {
        return 'Project';
    }

    static get relationMappings() {
        return {
            members: {
                relation: Model.ManyToManyRelation,
                modelClass: `${__dirname.replace('projects', 'users')}/user`,
                join: {
                    from: 'Project.id',
                    through: {
                        // Project_Member is the join table
                        from: 'Project_Member.project',
                        to: 'Project_Member.member'
                    },
                    to: 'User.id'
                }
            }
        };
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['creator_id'],
            properties: {
                id: { type: 'integer' },
                creator_id: { type: 'integer' },
				due_date: { type: 'string' },
                completion_percentage: { type: 'integer' },
                standups_count: { type: 'integer' },
                tasks_in_progress_count: { type: 'integer' },
                completed_tasks_count: { type: 'integer' }
            }
        };
    }

    $parseJson(json, opt) {
        if (json.creator) {
            json.creator_id = json.creator;
            delete json.creator;
        }
        return super.$parseJson(json, opt);
    }
}

module.exports = Project;