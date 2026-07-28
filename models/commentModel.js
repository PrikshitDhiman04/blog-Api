const { run, get, all } = require("../config/database");

async function createComment(content, postId, userId) {
  const sql =
    "INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)";
  const result = await run(sql, [content, postId, userId]);
  return { id: result.id, content, post_id: postId, user_id: userId };
}

async function getCommentsByPost(postId) {
  const sql =
    "SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC";
  return await all(sql, [postId]);
}

async function getCommentById(id) {
  const sql = "SELECT * FROM comments WHERE id = ?";
  return await get(sql, [id]);
}

async function updateComment(id, content) {
  const sql = "UPDATE comments SET content = ? WHERE id = ?";
  const result = await run(sql, [content, id]);
  return result.changes;
}

async function deleteComment(id) {
  const sql = "DELETE FROM comments WHERE id = ?";
  const result = await run(sql, [id]);
  return result.changes;
}

module.exports = {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
};
