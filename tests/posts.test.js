const request = require("supertest");
const app = require("../app");

describe("Posts", () => {
  let userId;
  let postId;

  // Create a user before all post tests — posts require a valid user
  beforeAll(async () => {
    const userResponse = await request(app)
      .post("/users/register")
      .send({
        name: "Post Tester",
        email: `posts_${Date.now()}@example.com`,
        password: "secret123",
      });
    userId = userResponse.body.id;
  });

  // CREATE
  test("should create a new post successfully", async () => {
    const response = await request(app)
      .post("/posts")
      .send({ title: "Test Post", content: "Test content", user_id: userId });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.user_id).toBe(userId);
    postId = response.body.id;
  });

  test("should reject post creation with missing title", async () => {
    const response = await request(app)
      .post("/posts")
      .send({ content: "No title here", user_id: userId });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("MISSING_FIELDS");
  });

  test("should reject post creation with missing content", async () => {
    const response = await request(app)
      .post("/posts")
      .send({ title: "No content here", user_id: userId });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("MISSING_FIELDS");
  });

  test("should reject post creation with non-existent user_id", async () => {
    const response = await request(app)
      .post("/posts")
      .send({ title: "Ghost Post", content: "Some content", user_id: 99999 });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("USER_NOT_FOUND");
  });

  // READ
  test("should retrieve all posts", async () => {
    const response = await request(app).get("/posts");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("should retrieve a single post by id", async () => {
    const response = await request(app).get(`/posts/${postId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(postId);
    expect(response.body.title).toBe("Test Post");
  });

  test("should return 404 for a non-existent post", async () => {
    const response = await request(app).get("/posts/99999");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("POST_NOT_FOUND");
  });

  test("should support pagination with limit and page params", async () => {
    const response = await request(app).get("/posts?limit=5&page=1");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(5);
  });

  // UPDATE
  test("should update a post successfully", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .send({ title: "Updated Title", content: "Updated content" });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Title");
    expect(response.body.content).toBe("Updated content");
  });

  test("should reject update with missing fields", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .send({ title: "Only title, no content" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("MISSING_FIELDS");
  });

  test("should return 404 when updating a non-existent post", async () => {
    const response = await request(app)
      .put("/posts/99999")
      .send({ title: "Ghost", content: "Ghost content" });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("POST_NOT_FOUND");
  });

  // DELETE
  test("should delete a post successfully", async () => {
    const response = await request(app).delete(`/posts/${postId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Post deleted successfully.");
  });

  test("should return 404 after deleting a post", async () => {
    const response = await request(app).get(`/posts/${postId}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("POST_NOT_FOUND");
  });

  test("should return 404 when deleting a non-existent post", async () => {
    const response = await request(app).delete("/posts/99999");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("POST_NOT_FOUND");
  });
});
