const request = require("supertest");
const app = require("../app");

describe("User Registration", () => {
  const testEmail = `user_${Date.now()}@example.com`;

  test("should register a new user successfully", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({ name: "Test User", email: testEmail, password: "secret123" });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(testEmail);
    expect(response.body.name).toBe("Test User");
  });

  test("should not return password in registration response", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({
        name: "Test User",
        email: `nopwd_${Date.now()}@example.com`,
        password: "secret123",
      });

    expect(response.body.password).toBeUndefined();
  });

  test("should reject registration with missing name", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({ email: "missing@example.com", password: "secret123" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("MISSING_FIELDS");
  });

  test("should reject registration with missing password", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "nopwd@example.com" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("MISSING_FIELDS");
  });

  test("should reject registration with invalid email format", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "notanemail", password: "secret123" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_EMAIL");
  });

  test("should reject registration with password shorter than 6 characters", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "short@example.com", password: "123" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("WEAK_PASSWORD");
  });

  test("should reject duplicate email with 409", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({ name: "Test User", email: testEmail, password: "secret123" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_EXISTS");
  });
});
