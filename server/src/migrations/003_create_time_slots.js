/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('time_slots', (table) => {
    table.increments('id').primary();
    table.integer('centre_id').unsigned().notNullable()
      .references('id').inTable('procurement_centres').onDelete('CASCADE');
    table.date('date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.integer('max_farmers').defaultTo(20);
    table.integer('booked_count').defaultTo(0);
    table.enum('status', ['available', 'full', 'closed']).defaultTo('available');
    table.timestamps(true, true);

    table.unique(['centre_id', 'date', 'start_time']);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('time_slots');
};
