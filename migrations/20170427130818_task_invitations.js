
exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('TaskInvitation', table => {
                table.increments('id').primary();
                table.timestamps(true, true);
                table.integer('task_id').unsigned().references('id').inTable('Task').notNullable();
                table.integer('sender_id').unsigned().references('id').inTable('User').notNullable();
                table.integer('receiver_id').unsigned().references('id').inTable('User').notNullable();
                table.enu('status', ['sent', 'accepted', 'denied']).defaultTo('sent').notNullable();
            });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTableIfExists('TaskInvitation');
};
