/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.table('farmers', (table) => {
    table.string('bank_name', 100);
    table.string('bank_account_number', 20);
    table.string('bank_ifsc', 11);
    table.string('bank_branch', 100);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.table('farmers', (table) => {
    table.dropColumn('bank_name');
    table.dropColumn('bank_account_number');
    table.dropColumn('bank_ifsc');
    table.dropColumn('bank_branch');
  });
};
