export async function up(knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("username", 20).notNullable().unique();
    table.string("password").notNullable();
    table.integer("likes").defaultTo(0);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable("users");
}
