const { run, get, all } = require("../config/database");

async function createPost(title, content, userId) {
  const sql = "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)";
  const result = await run(sql, [title, content, userId]);
  return { id: result.id, title, content, user_id: userId };
}

// async function getAllPosts() {
//   const sql = "SELECT * FROM posts ORDER BY created_at DESC";
//   return await all(sql);
// }
async function getAllPosts(limit = 20, offset = 0) {
  const sql = "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?";
  return await all(sql, [limit, offset]);
}  //bottleneck fixed


async function getPostById(id) {
  const sql = "SELECT * FROM posts WHERE id = ?";
  return await get(sql, [id]);
}

async function updatePost(id, title, content) {
  const sql =
    "UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
  const result = await run(sql, [title, content, id]);
  return result.changes; // number of rows updated (0 means no post with that id)
}

async function deletePost(id) {
  const sql = "DELETE FROM posts WHERE id = ?";
  const result = await run(sql, [id]);
  return result.changes; // number of rows deleted (0 means no post with that id)
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
