import bcrypt from "bcryptjs";

export async function seed(knex) {
  await knex("users").del();

  await knex("users").insert([
    {
      username: "admin",
      password: bcrypt.hashSync("admin123"),
      likes: 10,
    },
    {
      username: "user1",
      password: bcrypt.hashSync("password123"),
      likes: 5,
    },
  ]);
}
