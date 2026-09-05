/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('procurement_centres', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('location').notNullable();
    table.string('district').notNullable();
    table.string('state').notNullable();
    table.string('operating_hours').defaultTo('08:00-17:00');
    table.integer('max_daily_capacity').defaultTo(100);
    table.enum('status', ['active', 'closed', 'maintenance']).defaultTo('active');
    table.text('commodities_accepted'); // JSON string: ["wheat","rice","mustard"]
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('procurement_centres');
};
