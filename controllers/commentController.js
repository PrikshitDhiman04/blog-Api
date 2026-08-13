const {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
} = require("../models/commentModel");
const { getPostById } = require("../models/postModel");
const { findUserById } = require("../models/userModel");

// Create a comment on a post
async function create(req, res) {
  try {
    const { postId } = req.params;
    const { content, user_id } = req.body;

    if (!content || !user_id) {
      return res.status(400).json({
        error: {
          code: "MISSING_FIELDS",
          message: "Content and user_id are required.",
        },
      });
    }

    const post = await getPostById(postId);
    if (!post) {
      return res
        .status(404)
        .json({
          error: {
            code: "POST_NOT_FOUND",
            message: "No post exists with this id.",
          },
        });
    }

    const user = await findUserById(user_id);
    if (!user) {
      return res
        .status(404)
        .json({
          error: {
            code: "USER_NOT_FOUND",
            message: "No user exists with the given user_id.",
          },
        });
    }

    const newComment = await createComment(content, postId, user_id);
    return res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Something went wrong." },
      });
  }
}


async function getAllForPost(req, res) {
  try {
    const { postId } = req.params;

    const post = await getPostById(postId);
    if (!post) {
      return res
        .status(404)
        .json({
          error: {
            code: "POST_NOT_FOUND",
            message: "No post exists with this id.",
          },
        });
    }

    const comments = await getCommentsByPost(postId);
    return res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Something went wrong." },
      });
  }
}


async function update(req, res) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res
        .status(400)
        .json({
          error: { code: "MISSING_FIELDS", message: "Content is required." },
        });
    }

    const changes = await updateComment(commentId, content);

    if (changes === 0) {
      return res
        .status(404)
        .json({
          error: {
            code: "COMMENT_NOT_FOUND",
            message: "No comment exists with this id.",
          },
        });
    }

    const updated = await getCommentById(commentId);
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Something went wrong." },
      });
  }
}

// DELETE a comment
async function remove(req, res) {
  try {
    const { commentId } = req.params;
    const changes = await deleteComment(commentId);

    if (changes === 0) {
      return res
        .status(404)
        .json({
          error: {
            code: "COMMENT_NOT_FOUND",
            message: "No comment exists with this id.",
          },
        });
    }

    return res.status(200).json({ message: "Comment deleted successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Something went wrong." },
      });
  }
}

module.exports = { create, getAllForPost, update, remove };
