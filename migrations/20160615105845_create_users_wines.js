
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users_wines', function(table) {
    table.increments();
    table.integer('user_id');
    table.integer('wine_id');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users_wines');
};
