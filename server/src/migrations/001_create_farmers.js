/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('farmers', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('phone', 15).notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('aadhaar_last4', 4); // last 4 digits only
    table.string('village');
    table.string('district');
    table.string('state');
    table.enum('role', ['farmer', 'admin']).defaultTo('farmer');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('farmers');
};
