const { run, get } = require("../config/database");

// Insert a new user into the database.
// Uses ? placeholders instead of building the SQL string directly —
// this prevents SQL injection (never insert raw user input into a query string).
async function createUser(name, email, hashedPassword) {
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  const result = await run(sql, [name, email, hashedPassword]);
  return { id: result.id, name, email };
}

// Look up a user by email — used to check for duplicates before registering.
async function findUserByEmail(email) {
  const sql = "SELECT * FROM users WHERE email = ?";
  return await get(sql, [email]);
}

async function findUserById(id) {
  const sql = "SELECT * FROM users WHERE id = ?";
  return await get(sql, [id]);
}

module.exports = { createUser, findUserByEmail, findUserById };
