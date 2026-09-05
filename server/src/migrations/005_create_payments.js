/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.integer('booking_id').unsigned().notNullable().unique()
      .references('id').inTable('bookings').onDelete('CASCADE');
    table.decimal('amount', 12, 2);
    table.decimal('msp_rate', 10, 2); // MSP per quintal
    table.decimal('actual_quantity_kg', 10, 2);
    table.enum('status', ['pending', 'processing', 'paid', 'failed']).defaultTo('pending');
    table.string('payment_reference');
    table.timestamp('paid_at');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('payments');
};
