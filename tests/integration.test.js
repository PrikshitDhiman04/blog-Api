const request = require("supertest");
const app = require("../app");

describe("Cross-resource integration flows", () => {
  describe("Full blog workflow", () => {
    let userId;
    let postId;
    let commentId;

    test("Step 1: Register a new user", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({
          name: "Integration User",
          email: `integration_${Date.now()}@example.com`,
          password: "secret123",
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      userId = response.body.id;
    });

    test("Step 2: Create a post as that user", async () => {
      const response = await request(app).post("/posts").send({
        title: "Integration Post",
        content: "Integration content",
        user_id: userId,
      });

      expect(response.status).toBe(201);
      expect(response.body.user_id).toBe(userId);
      postId = response.body.id;
    });

    test("Step 3: Comment on that post", async () => {
      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .send({ content: "Integration comment", user_id: userId });

      expect(response.status).toBe(201);
      expect(response.body.post_id).toBeTruthy();
      commentId = response.body.id;
    });

    test("Step 4: Verify comment appears in post comments list", async () => {
      const response = await request(app).get(`/posts/${postId}/comments`);

      expect(response.status).toBe(200);
      expect(response.body.some((c) => c.id === commentId)).toBe(true);
    });

    test("Step 5: Update the post", async () => {
      const response = await request(app).put(`/posts/${postId}`).send({
        title: "Updated Integration Post",
        content: "Updated content",
      });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated Integration Post");
    });

    test("Step 6: Delete the post — comments should cascade delete", async () => {
      const deleteResponse = await request(app).delete(`/posts/${postId}`);
      expect(deleteResponse.status).toBe(200);

      const getPost = await request(app).get(`/posts/${postId}`);
      expect(getPost.status).toBe(404);

      const getComments = await request(app).get(`/posts/${postId}/comments`);
      expect(getComments.status).toBe(404);
    });
  });

  describe("API consistency checks", () => {
    test("Root endpoint should confirm server is running", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Blog API is running.");
    });

    test("Unknown endpoint should return 404 with consistent error format", async () => {
      const response = await request(app).get("/nonexistent-endpoint");
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    test("All error responses should follow consistent JSON structure", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "missing@example.com" });

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBeDefined();
      expect(response.body.error.message).toBeDefined();
    });

    test("POST /posts with invalid body should still be handled gracefully", async () => {
      const response = await request(app)
        .post("/posts")
        .send("not json at all");

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
