/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.table('payments', (table) => {
    // Quality grading
    table.enum('quality_grade', ['A', 'B', 'C', 'Rejected']).defaultTo('A');

    // Moisture testing
    table.decimal('actual_moisture_percentage', 5, 2);
    table.decimal('max_allowed_moisture_percentage', 5, 2);
    table.decimal('moisture_deduction_kg', 10, 2).defaultTo(0);

    // Deductions and final calculation
    table.decimal('quality_deduction_percentage', 5, 2).defaultTo(0);
    table.decimal('net_quantity_kg', 10, 2); // After moisture deduction
    table.decimal('gross_amount', 12, 2); // Before quality deduction
    table.decimal('deduction_amount', 12, 2).defaultTo(0);
    // 'amount' field already exists — will be final net amount after all deductions

    // Quality report notes
    table.text('quality_notes');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.table('payments', (table) => {
    table.dropColumn('quality_grade');
    table.dropColumn('actual_moisture_percentage');
    table.dropColumn('max_allowed_moisture_percentage');
    table.dropColumn('moisture_deduction_kg');
    table.dropColumn('quality_deduction_percentage');
    table.dropColumn('net_quantity_kg');
    table.dropColumn('gross_amount');
    table.dropColumn('deduction_amount');
    table.dropColumn('quality_notes');
  });
};
