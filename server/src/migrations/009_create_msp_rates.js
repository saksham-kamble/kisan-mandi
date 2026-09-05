/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('msp_rates', (table) => {
    table.increments('id').primary();
    table.string('commodity', 100).notNullable().unique();
    table.string('commodity_marathi', 100).notNullable();
    table.decimal('msp_rate_per_quintal', 10, 2).notNullable();
    table.decimal('max_moisture_percentage', 5, 2).defaultTo(12.0);
    table.string('season', 50).defaultTo('Rabi 2024-25');
    table.string('category', 50).defaultTo('Cereal');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('msp_rates');
};
