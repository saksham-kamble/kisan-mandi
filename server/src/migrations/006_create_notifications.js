/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('farmer_id').unsigned().notNullable()
      .references('id').inTable('farmers').onDelete('CASCADE');
    table.integer('booking_id').unsigned()
      .references('id').inTable('bookings').onDelete('SET NULL');
    table.enum('type', ['sms', 'push', 'in_app']).defaultTo('in_app');
    table.text('message').notNullable();
    table.enum('status', ['pending', 'sent', 'failed']).defaultTo('pending');
    table.timestamp('sent_at');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('notifications');
};
