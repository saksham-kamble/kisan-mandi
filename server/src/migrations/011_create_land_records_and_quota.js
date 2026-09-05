/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('farmer_land_records', (table) => {
      table.increments('id').primary();
      table.integer('farmer_id').unsigned().notNullable()
        .references('id').inTable('farmers').onDelete('CASCADE');
      table.string('survey_number', 50).notNullable(); // गट क्र. / सर्व्हे क्र.
      table.string('village', 100).notNullable();
      table.string('taluka', 100).notNullable();
      table.string('district', 100).notNullable();
      table.decimal('total_land_acres', 8, 2).notNullable();
      table.decimal('cultivated_area_acres', 8, 2).notNullable();
      table.string('crop_sown', 100).notNullable(); // Sown crop
      table.string('season', 50).defaultTo('Rabi 2024-25');
      table.enum('verification_status', ['verified', 'pending', 'rejected']).defaultTo('verified');
      table.string('verified_by').defaultTo('MahaBhumi Digital 7/12 API');
      table.timestamps(true, true);
    })
    .table('bookings', (table) => {
      table.integer('land_record_id').unsigned()
        .references('id').inTable('farmer_land_records').onDelete('SET NULL');
    });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema
    .table('bookings', (table) => {
      table.dropColumn('land_record_id');
    })
    .dropTable('farmer_land_records');
};
