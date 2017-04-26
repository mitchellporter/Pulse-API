
exports.up = function(knex, Promise) {
    knex.schema
    .createTable('User', table => {
        table.increments('id').primary().notNullable();
        table.timestamps(true, true);
        table.string('email').notNullable();
        table.string('password').notNullable();
        table.string('name').notNullable();
        table.string('avatar_url').notNullable();
        table.string('position').notNullable();
        table.integer('team').unsigned().references('id').inTable('Team').notNullable();
    })
    .createTable('Project', table => {
        table.increments('id').primary().notNullable();
        table.timestamps(true, true);
        table.date('due_date');        
        table.integer('completion_percentage').defaultTo(0).notNullable();
        table.integer('standups_count').defaultTo(0).notNullable();
        table.integer('tasks_in_progress_count').defaultTo(0).notNullable();
        table.integer('completed_tasks_count').defaultTo(0).notNullable();
    })
    .createTable('Project_Member', table => {
        table.increments('id').primary(['project', 'member']);
        table.integer('project').references('id').inTable('Project').notNullable();
        table.integer('member').references('id').inTable('User').notNullable();
    })
    .createTable('Task', table => {
        table.increments('id').primary().notNullable();
        table.timestamps(true, true);
        table.string('title').notNullable();
        table.enu('status', ['pending', 'in_progress', 'completed']).defaultTo('pending').notNullable();
        table.date('due_date');
        table.integer('completion_percentage').defaultTo(0).notNullable();
        table.integer('project').unsigned().references('id').inTable('Project').notNullable();
        table.integer('assigner').unsigned().references('id').inTable('User').notNullable();
        table.integer('assignee').unsigned().references('id').inTable('User').notNullable();
    })
    .createTable('Subtask', table => {
        table.increments('id').primary().notNullable();
        table.timestamps(true, true);
        table.text('text').notNullable();
        table.integer('created_by').references('id').inTable('User').notNullable();
        table.integer('completed_by').references('id').inTable('User').notNullable();
        table.integer('task').references('id').inTable('Task').notNullable();
        table.enu('status', ['pending', 'in_progress', 'completed']).defaultTo('pending').notNullable();
    })
    .createTable('Standup', table  => {
        table.increments('id').primary().notNullable();
        table.timestamps(true, true);
        table.text('text').notNullable();
        table.integer('author').references('id').inTable('User').notNullable();
    })
    .createTable('UpdateRequest', table => {
        table.increments('id').primary();
        table.timestamps(true, true);
        table.integer('sender').references('id').inTable('User').notNullable();
        table.integer('receiver').references('id').inTable('User').notNullable();
        table.integer('task').references('id').inTable('Task').notNullable();
        table.enu('status', ['sent', 'responded']).defaultTo('sent').notNullable();
    })
    .createTable('Update', table => {
        table.increments('id').primary();
        table.timestamps(true, true);
        table.text('comment').notNullable();
        table.integer('sender').references('id').inTable('User').notNullable();
        table.integer('receiver').references('id').inTable('User').notNullable();
        table.integer('task').references('id').inTable('Task').notNullable();
        table.integer('update_request').references('id').inTable('UpdateRequest');
    })
    .createTable('ProjectInvitation', table => {
        table.increments('id').primary();
        table.timestamps(true, true);
        table.integer('project').references('id').inTable('Project');
        table.integer('sender').references('id').inTable('User');
        table.integer('receiver').references('id').inTable('User');
        table.enu('status', ['sent', 'accepted', 'denied']).defaultTo('sent').notNullable();
    })
    .createTable('TaskChat', table => {
        table.increments('id').primary();
        table.timestamps(true, true);
        table.text('message').notNullable();
        table.integer('task').references('id').inTable('Task').notNullable();
        table.integer('sender').references('id').inTable('User').notNullable();
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
