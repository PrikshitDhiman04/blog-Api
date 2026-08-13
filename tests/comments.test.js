const request = require("supertest");
const app = require("../app");

describe("Comments", () => {
  let userId;
  let postId;
  let commentId;

  // Set up a user and a post before all comment tests
  beforeAll(async () => {
    const userResponse = await request(app)
      .post("/users/register")
      .send({
        name: "Comment Tester",
        email: `comments_${Date.now()}@example.com`,
        password: "secret123",
      });
    userId = userResponse.body.id;

    const postResponse = await request(app)
      .post("/posts")
      .send({
        title: "Post for comments",
        content: "Comment test post",
        user_id: userId,
      });
    postId = postResponse.body.id;
  });

  // CREATE
  test("should create a comment on a post successfully", async () => {
    const response = await request(app)
      .post(`/posts/${postId}/comments`)
      .send({ content: "Great post!", user_id: userId });

    expect(response.status).toBe(201);
    expect(response.body.content).toBe("Great post!");
    expect(response.body.post_id).toBeTruthy();
    commentId = response.body.id;
  });

  test("should reject comment creation with missing content", async () => {
    const response = await request(app)
      .post(`/posts/${postId}/comments`)
      .send({ user_id: userId });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("MISSING_FIELDS");
  });

  test("should reject comment on a non-existent post", async () => {
    const response = await request(app)
      .post("/posts/99999/comments")
      .send({ content: "Ghost comment", user_id: userId });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("POST_NOT_FOUND");
  });

  test("should reject comment with non-existent user_id", async () => {
    const response = await request(app)
      .post(`/posts/${postId}/comments`)
      .send({ content: "Ghost user comment", user_id: 99999 });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("USER_NOT_FOUND");
  });

  // READ
  test("should retrieve all comments for a post", async () => {
    const response = await request(app).get(`/posts/${postId}/comments`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("should return empty array for a post with no comments", async () => {
    const newPost = await request(app)
      .post("/posts")
      .send({
        title: "Empty post",
        content: "No comments here",
        user_id: userId,
      });

    const response = await request(app).get(
      `/posts/${newPost.body.id}/comments`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("should return 404 when getting comments for non-existent post", async () => {
    const response = await request(app).get("/posts/99999/comments");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("POST_NOT_FOUND");
  });

  // UPDATE
  test("should update a comment successfully", async () => {
    const response = await request(app)
      .put(`/comments/${commentId}`)
      .send({ content: "Updated comment text" });

    expect(response.status).toBe(200);
    expect(response.body.content).toBe("Updated comment text");
  });

  test("should reject comment update with missing content", async () => {
    const response = await request(app).put(`/comments/${commentId}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("MISSING_FIELDS");
  });

  test("should return 404 when updating non-existent comment", async () => {
    const response = await request(app)
      .put("/comments/99999")
      .send({ content: "Ghost update" });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("COMMENT_NOT_FOUND");
  });

  // DELETE
  test("should delete a comment successfully", async () => {
    const response = await request(app).delete(`/comments/${commentId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Comment deleted successfully.");
  });

  test("should return 404 when deleting non-existent comment", async () => {
    const response = await request(app).delete("/comments/99999");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("COMMENT_NOT_FOUND");
  });

  
});
