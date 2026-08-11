const { run } = require("./config/database");

async function more() {
  console.log("Adding more posts...");
  for (let i = 501; i <= 2000; i++) {
    await run("INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)", [
      `Post number ${i}`,
      `Content for post ${i} with some longer text to increase response size and make the bottleneck more visible under load testing conditions.`,
      1,
    ]);
    if (i % 500 === 0) console.log(`${i} posts inserted...`);
  }
  console.log("Done — 2000 posts total.");
  process.exit(0);
}

more().catch(console.error);
