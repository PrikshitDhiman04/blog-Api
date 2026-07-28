const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// Nested under posts — a comment always belongs to a specific post
router.post("/posts/:postId/comments", commentController.create);
router.get("/posts/:postId/comments", commentController.getAllForPost);

// Flat routes — once you have a comment's own id, you act on it directly
router.put("/comments/:commentId", commentController.update);
router.delete("/comments/:commentId", commentController.remove);

module.exports = router;
