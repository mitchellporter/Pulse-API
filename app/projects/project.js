'use strict';

const Model = require('objection').Model;
const User = require('../users/user');

class Project extends Model {
    static get tableName() {
        return 'Project';
    }

    static get relationMappings() {
        return {
            members: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
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
        }
    }
}

module.exports = Project;