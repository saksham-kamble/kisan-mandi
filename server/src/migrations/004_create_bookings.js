/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('bookings', (table) => {
    table.increments('id').primary();
    table.integer('farmer_id').unsigned().notNullable()
      .references('id').inTable('farmers').onDelete('CASCADE');
    table.integer('slot_id').unsigned().notNullable()
      .references('id').inTable('time_slots').onDelete('CASCADE');
    table.string('token_number', 10).notNullable();
    table.string('commodity').notNullable();
    table.decimal('estimated_quantity_kg', 10, 2);
    table.enum('status', [
      'booked',
      'checked_in',
      'in_progress',
      'completed',
      'cancelled',
    ]).defaultTo('booked');
    table.integer('queue_position');
    table.timestamp('checked_in_at');
    table.timestamp('completed_at');
    table.timestamps(true, true);

    table.unique(['slot_id', 'token_number']);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('bookings');
};
