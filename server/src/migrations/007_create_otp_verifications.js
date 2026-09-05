/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('otp_verifications', (table) => {
    table.increments('id').primary();
    table.string('phone', 15).notNullable();
    table.string('otp_code', 6).notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('verified').defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('otp_verifications');
};
