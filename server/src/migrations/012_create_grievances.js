exports.up = function (knex) {
  return knex.schema.createTable('grievances', (table) => {
    table.increments('id').primary();
    table.string('ticket_number', 50).notNullable().unique();
    table
      .integer('farmer_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('farmers')
      .onDelete('CASCADE');
    table
      .integer('booking_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('bookings')
      .onDelete('SET NULL');
    table
      .integer('centre_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('procurement_centres')
      .onDelete('SET NULL');
    table
      .string('category', 50)
      .notNullable(); // e.g. payment_delay, weight_dispute, quality_dispute, slot_queue_issue, officer_conduct, other
    table.string('subject', 200).notNullable();
    table.text('description').notNullable();
    table.string('priority', 20).defaultTo('medium'); // low, medium, high, urgent
    table.string('status', 20).defaultTo('open'); // open, in_progress, resolved, closed
    table.text('admin_remarks').nullable();
    table.string('resolved_by').nullable();
    table.timestamp('resolved_at').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('grievances');
};
