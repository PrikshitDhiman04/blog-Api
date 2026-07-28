const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db", "blog.db");
const SCHEMA_PATH = path.join(__dirname, "..", "db", "schema.sql");

const db = new sqlite3.Database(DB_PATH);


db.run("PRAGMA foreign_keys = ON");


const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
db.exec(schema, (err) => {
  if (err) {
    console.error("Failed to initialize database schema:", err.message);
    process.exit(1);
  } else {
    console.log("Database schema ready.");
  }
});


function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { run, get, all };
