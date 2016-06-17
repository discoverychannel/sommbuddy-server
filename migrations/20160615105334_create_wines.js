
exports.up = function(knex, Promise) {
  return knex.schema.createTable('wines', function(table) {
    table.increments();
    table.string('name');
    table.string('grape');
    table.string('vineyard');
    table.string('vintage');
    table.string('region');
    table.float('price');
    table.string('picture');
    table.string('storeurl');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('wines');
};
