
exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('Team', table => {
            table.increments('id').primary().notNullable();
            table.timestamps(true, true);
            table.string('name').notNullable();
        })
        .createTable('User', table => {
            table.increments('id').primary().notNullable();
            table.timestamps(true, true);
            table.string('email').notNullable();
            table.string('password').notNullable();
            table.string('name').notNullable();
            table.string('avatar_url').notNullable();
            table.string('position').notNullable();
            table.integer('team_id').unsigned().references('id').inTable('Team').notNullable();
        })
        .createTable('Project', table => {
            table.increments('id').primary().notNullable();
            table.timestamps(true, true);
            table.integer('creator_id').unsigned().references('id').inTable('User').notNullable();
            table.timestamp('due_date');
            table.integer('completion_percentage').defaultTo(0).notNullable();
            table.integer('standups_count').defaultTo(0).notNullable();
            table.integer('tasks_in_progress_count').defaultTo(0).notNullable();
            table.integer('completed_tasks_count').defaultTo(0).notNullable();
        })
        .createTable('Project_Member', table => {
            table.increments('id').primary(['project', 'member']);
            table.timestamps(true, true);
            table.integer('project_id').unsigned().references('id').inTable('Project').notNullable();
            table.integer('member_id').unsigned().references('id').inTable('User').notNullable();
        })
        .createTable('Task', table => {
            table.increments('id').primary().notNullable();
            table.timestamps(true, true);
            table.string('title').notNullable();
            table.enu('status', ['pending', 'in_progress', 'completed']).defaultTo('pending').notNullable();
            table.timestamp('due_date');
            table.integer('completion_percentage').defaultTo(0).notNullable();
            table.integer('project_id').unsigned().references('id').inTable('Project').notNullable();
            table.integer('assigner_id').unsigned().references('id').inTable('User').notNullable();
            table.integer('assignee_id').unsigned().references('id').inTable('User').notNullable();
        })
        .createTable('Subtask', table => {
            table.increments('id').primary().notNullable();
            table.timestamps(true, true);
            table.text('text').notNullable();
            table.integer('task_id').unsigned().references('id').inTable('Task').notNullable();
            table.integer('created_by_id').unsigned().references('id').inTable('User').notNullable();
            table.integer('completed_by_id').unsigned().references('id').inTable('User');
            table.enu('status', ['pending', 'in_progress', 'completed']).defaultTo('pending').notNullable();
        })
        .createTable('Standup', table  => {
            table.increments('id').primary().notNullable();
            table.timestamps(true, true);
            table.text('text').notNullable();
            table.integer('author_id').unsigned().references('id').inTable('User').notNullable();
        })
        .createTable('UpdateRequest', table => {
            table.increments('id').primary();
            table.timestamps(true, true);
            table.integer('task_id').unsigned().references('id').inTable('Task').notNullable();
            table.integer('sender_id').unsigned().references('id').inTable('User').notNullable();
            table.integer('receiver_id').unsigned().references('id').inTable('User').notNullable();
            table.enu('status', ['sent', 'responded']).defaultTo('sent').notNullable();
        })
        .createTable('Update', table => {
            table.increments('id').primary();
            table.timestamps(true, true);
            table.text('comment').notNullable();
            table.integer('sender_id').unsigned().references('id').inTable('User').notNullable();
            table.integer('receiver_id').unsigned().references('id').inTable('User').notNullable();
            table.integer('task_id').unsigned().references('id').inTable('Task').notNullable();
            table.integer('update_request_id').unsigned().references('id').inTable('UpdateRequest');
        })
        .createTable('ProjectInvitation', table => {
            table.increments('id').primary();
            table.timestamps(true, true);
            table.integer('project_id').unsigned().references('id').inTable('Project');
            table.integer('sender_id').unsigned().references('id').inTable('User');
            table.integer('receiver_id').unsigned().references('id').inTable('User');
            table.enu('status', ['sent', 'accepted', 'denied']).defaultTo('sent').notNullable();
        })
        .createTable('TaskChat', table => {
            table.increments('id').primary();
            table.timestamps(true, true);
            table.text('message').notNullable();
            table.integer('task_id').unsigned().references('id').inTable('Task').notNullable();
            table.integer('sender_id').unsigned().references('id').inTable('User').notNullable();
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTableIfExists('User')
        .dropTableIfExists('Project')
        .dropTableIfExists('Project_Member')
        .dropTableIfExists('Task')
        .dropTableIfExists('Subtask')
        .dropTableIfExists('Standup')
        .dropTableIfExists('UpdateRequest')
        .dropTableIfExists('Update')
        .dropTableIfExists('ProjectInvitation')
        .dropTableIfExists('TaskChat');
};
