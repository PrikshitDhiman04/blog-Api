const { run } = require("./config/database");

async function addIndex() {
  await run(
    "CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)",
  );
  console.log("Index created successfully.");
  process.exit(0);
}

addIndex().catch(console.error);
