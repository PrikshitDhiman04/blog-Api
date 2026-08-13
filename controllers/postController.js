const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../models/postModel");
const { findUserById } = require("../models/userModel");

let postsCache = { data: null, timestamp: null };
const CACHE_TTL = 30000; // 30 seconds

// CREATE a new post
async function create(req, res) {
  try {
    const { title, content, user_id } = req.body;

    if (!title || !content || !user_id) {
      return res.status(400).json({
        error: {
          code: "MISSING_FIELDS",
          message: "Title, content, and user_id are all required.",
        },
      });
    }

    // Confirm the referenced user actually exists before inserting.
    const user = await findUserById(user_id);
    if (!user) {
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "No user exists with the given user_id.",
        },
      });
    }

    const newPost = await createPost(title, content, user_id);
    // Invalidate cache when a new post is created
    postsCache = { data: null, timestamp: null };
    return res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Something went wrong." },
      });
  }
}


async function getAll(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const cacheKey = `${limit}-${page}`;
    const now = Date.now();

    if (
      postsCache.data &&
      postsCache.key === cacheKey &&
      now - postsCache.timestamp < CACHE_TTL
    ) {
      return res.status(200).json(postsCache.data);
    }

    const posts = await getAllPosts(limit, offset);
    postsCache = { data: posts, timestamp: now, key: cacheKey };
    return res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Something went wrong." },
      });
  }
}


// READ a single post by id
async function getOne(req, res) {
  try {
    const { id } = req.params;
    const post = await getPostById(id);

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

    return res.status(200).json(post);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Something went wrong." },
      });
  }
}

// UPDATE a post
async function update(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: {
          code: "MISSING_FIELDS",
          message: "Title and content are required.",
        },
      });
    }

    const changes = await updatePost(id, title, content);

    if (changes === 0) {
      return res
        .status(404)
        .json({
          error: {
            code: "POST_NOT_FOUND",
            message: "No post exists with this id.",
          },
        });
    }

    const updated = await getPostById(id);
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

// DELETE a post
async function remove(req, res) {
  try {
    const { id } = req.params;
    const changes = await deletePost(id);

    if (changes === 0) {
      return res
        .status(404)
        .json({
          error: {
            code: "POST_NOT_FOUND",
            message: "No post exists with this id.",
          },
        });
    }

    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: { code: "SERVER_ERROR", message: "Something went wrong." },
      });
  }
}

module.exports = { create, getAll, getOne, update, remove };
