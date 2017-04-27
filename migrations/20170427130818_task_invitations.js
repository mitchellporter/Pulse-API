
exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('TaskInvitation', table => {
                table.increments('id').primary();
                table.timestamps(true, true);
                table.integer('sender').unsigned().references('id').inTable('User');
                table.integer('receiver').unsigned().references('id').inTable('User');
                table.integer('task').unsigned().references('id').inTable('Task');
                table.enu('status', ['sent', 'accepted', 'denied']).defaultTo('sent').notNullable();
            });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTableIfExists('TaskInvitation');
};
