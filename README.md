# Blog Platform API

A simple RESTful API for a blog platform, supporting user registration, blog posts, and comments. Built as part of a Week 2 backend development internship task, focused on practical coding, database integration, and API development.

## Tech Stack

- **Node.js** — runtime environment
- **Express.js** — web framework for routing and request handling
- **SQLite** (via the `sqlite3` npm package) — lightweight, file-based relational database
- **bcrypt** — password hashing
- **dotenv** — environment variable management
- **nodemon** — auto-restarts the server during development

## Project Structure

```
blog-api/
├── config/
│   └── database.js        # Database connection, schema initialization, query helpers
├── models/
│   ├── userModel.js        # User-related database queries
│   ├── postModel.js        # Post-related database queries
│   └── commentModel.js     # Comment-related database queries
├── controllers/
│   ├── userController.js   # User request handling logic
│   ├── postController.js   # Post request handling logic
│   └── commentController.js # Comment request handling logic
├── routes/
│   ├── userRoutes.js       # /users endpoints
│   ├── postRoutes.js       # /posts endpoints
│   └── commentRoutes.js    # /posts/:postId/comments and /comments endpoints
├── middleware/
│   └── errorHandler.js     # Global error-handling middleware (safety net)
├── db/
│   ├── schema.sql          # Table definitions (users, posts, comments)
│   └── blog.db             # SQLite database file (auto-created on first run)
├── .env                    # Environment variables (PORT)
├── .gitignore
├── package.json
└── server.js               # Application entry point
```

## Setup Instructions

**Prerequisites:** Node.js (v18 or higher recommended) installed on your machine.

1. Extract the ZIP / clone the project, then navigate into it:

   ```bash
   cd blog-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following content:

   ```
   PORT=3000
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

   (Uses `nodemon` to auto-restart on file changes. Alternatively, `npm start` runs it once without auto-restart.)

5. You should see:
   ```
   Database schema ready.
   Server running on http://localhost:3000
   ```

The SQLite database file (`db/blog.db`) and all tables are created **automatically** on first run — no manual database setup is required.

6. Confirm the server is running by visiting `http://localhost:3000` in a browser or via:
   ```bash
   curl http://localhost:3000
   ```
   Expected response: `{ "message": "Blog API is running." }`

## Database Schema

Three tables, with foreign key relationships enforced at the database level:

- **users** — `id`, `name`, `email` (unique), `password` (hashed), `created_at`
- **posts** — `id`, `title`, `content`, `user_id` (→ users), `created_at`, `updated_at`
- **comments** — `id`, `content`, `post_id` (→ posts), `user_id` (→ users), `created_at`

Deleting a user or post automatically deletes their related posts/comments (`ON DELETE CASCADE`).

## API Endpoints

All request/response bodies are JSON. Set the `Content-Type: application/json` header when sending a body.

### Users

**Register a new user**

```
POST /users/register
Body: { "name": "Riya Sharma", "email": "riya@example.com", "password": "secret123" }
Response (201): { "id": 1, "name": "Riya Sharma", "email": "riya@example.com" }
```

Errors: `400` missing fields / invalid email / weak password, `409` email already exists

### Posts

**Create a post**

```
POST /posts
Body: { "title": "My First Post", "content": "Hello world!", "user_id": 1 }
Response (201): { "id": 1, "title": "My First Post", "content": "Hello world!", "user_id": 1 }
```

Errors: `400` missing fields, `404` user_id does not exist

**Get all posts**

```
GET /posts
Response (200): [ { "id": 1, "title": "...", ... }, ... ]
```

**Get a single post**

```
GET /posts/:id
Response (200): { "id": 1, "title": "...", "content": "...", "user_id": 1, ... }
```

Errors: `404` post not found

**Update a post**

```
PUT /posts/:id
Body: { "title": "Updated Title", "content": "Updated content." }
Response (200): { "id": 1, "title": "Updated Title", ... }
```

Errors: `400` missing fields, `404` post not found

**Delete a post**

```
DELETE /posts/:id
Response (200): { "message": "Post deleted successfully." }
```

Errors: `404` post not found

### Comments

**Create a comment on a post**

```
POST /posts/:postId/comments
Body: { "content": "Great post!", "user_id": 1 }
Response (201): { "id": 1, "content": "Great post!", "post_id": 1, "user_id": 1 }
```

Errors: `400` missing fields, `404` post not found or user_id does not exist

**Get all comments for a post**

```
GET /posts/:postId/comments
Response (200): [ { "id": 1, "content": "...", ... }, ... ]
```

Errors: `404` post not found

**Update a comment**

```
PUT /comments/:commentId
Body: { "content": "Updated comment text." }
Response (200): { "id": 1, "content": "Updated comment text.", ... }
```

Errors: `400` missing content, `404` comment not found

**Delete a comment**

```
DELETE /comments/:commentId
Response (200): { "message": "Comment deleted successfully." }
```

Errors: `404` comment not found

## Error Handling

All errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "No post exists with this id."
  }
}
```

| Status | Meaning                         |
| ------ | ------------------------------- |
| 400    | Invalid or missing input        |
| 404    | Resource not found              |
| 409    | Conflict (e.g. duplicate email) |
| 500    | Unexpected server error         |

A global error-handling middleware (`middleware/errorHandler.js`) also acts as a final safety net, ensuring unexpected/uncaught errors never crash the server or expose internal details to the client.

## Design Decisions & Assumptions

- **Passwords are hashed with bcrypt** before storage — plain text passwords are never saved.
- **Foreign key constraints are enforced** (`PRAGMA foreign_keys = ON`) — posts and comments cannot reference a non-existent user or post.
- **Cascade deletes** — deleting a user or post automatically removes their related posts/comments, avoiding orphaned data.
- **No authentication/login system is implemented** — `user_id` is passed directly in request bodies for simplicity, since a full login/session system was outside this task's scope. In a production system, this would instead come from a verified auth token.
- **Parameterized queries** (`?` placeholders) are used throughout to prevent SQL injection.
- **Comments have no "get all" endpoint** — they are only ever listed in the context of a specific post (`/posts/:postId/comments`), which better reflects real usage.

## Testing

All endpoints were manually tested using Postman, covering:

- Successful requests (create, read, update, delete) for all three resources
- Validation errors (missing required fields)
- Not-found errors (invalid/non-existent IDs)
- Conflict errors (duplicate email registration)

Example screenshots of these test cases are available in the `/screenshots` folder (if included).
