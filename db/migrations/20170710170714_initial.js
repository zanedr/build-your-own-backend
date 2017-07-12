
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('artists', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();

      table.timestamps(true, true);
    }),

    knex.schema.createTable('songs', function(table) {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('artist_name')
      
      table.integer('artist_id').unsigned();
      table.foreign('artist_id')
        .references('artists.id');

      table.timestamps(true, true);
    })
  ])
};


exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('songs'),
    knex.schema.dropTable('artists')
  ]);
};
