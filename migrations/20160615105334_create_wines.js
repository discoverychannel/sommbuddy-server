
exports.up = function(knex, Promise) {
  return knex.schema.createTable('wines', function(table) {
    table.increments();
    table.string('name');
    table.float('price');
    table.string('imageUrl');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('wines');
};
