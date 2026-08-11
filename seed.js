const { run } = require("./config/database");

async function seed() {
  console.log("Creating test user...");
  await run(
    "INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)",
    ["Seed User", "seed@example.com", "hashedpassword123"],
  );

  console.log("Seeding 500 posts...");
  for (let i = 1; i <= 500; i++) {
    await run("INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)", [
      `Post number ${i}`,
      `This is the content for post number ${i}. It contains some realistic text to simulate real data.`,
      1,
    ]);
    if (i % 100 === 0) console.log(`${i} posts inserted...`);
  }

  console.log("Seeding complete — 500 posts added.");
  process.exit(0);
}

seed().catch(console.error);
