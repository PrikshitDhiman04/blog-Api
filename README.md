# Blog Platform API

A simple RESTful API for a blog platform, supporting user registration, blog posts, and comments. Built with Node.js, Express, and SQLite.

## Tech Stack

- **Node.js** — runtime
- **Express.js** — web framework
- **SQLite** (via the `sqlite3` npm package) — relational database
- **bcrypt** — password hashing
- **dotenv** — environment configuration
- **nodemon** (dev dependency) — auto-restarts the server during development

## Project Structure

blog-api/
├── config/
│ └── database.js # Database connection, schema initialization, query helpers
├── models/
│ ├── userModel.js # User-related database queries
│ ├── postModel.js # Post-related database queries
│ └── commentModel.js # Comment-related database queries
├── controllers/
│ ├── userController.js # User request handling & validation
│ ├── postController.js # Post request handling & validation
│ └── commentController.js # Comment request handling & validation
├── routes/
│ ├── userRoutes.js
│ ├── postRoutes.js
│ └── commentRoutes.js
├── middleware/
│ └── errorHandler.js # Global fallback error handler
├── db/
│ └── schema.sql # Table definitions (run automatically on startup)
├── server.js # App entry point
├── package.json
└── .env # Environment config (not committed)

## Setup Instructions

1. **Clone or extract the project**
```bash
   cd blog-api
```

2. **Install dependencies**
```bash
   npm install
```

3. **Create a `.env` file** in the project root with:
   PORT=3000


4. **Run the server**
```bash
   npm run dev
```
   You should see:

  " Database schema ready.
Server running on http://localhost:3000"


The SQLite database file and all tables are created automatically on first run — no manual database setup is required.

## API Endpoints

### Users

**Register a new user**

POST /users/register
Body: { "name": "Naman Sharma", "email": "Naman@abc.com", "password": "nmn123" }
Response (201): { "id": 1, "name": "Naman Sharma", "email": "Naman@abc.com" }

### Posts

**Create a post**

POST /posts
Body: { "title": "My First Post", "content": "Hello world!", "user_id": 1 }
Response (201): { "id": 1, "title": "My First Post", "content": "Hello world!", "user_id": 1 }

**Get all posts**

GET /posts
Response (200): [ { "id": 1, "title": "...", "content": "...", ... }, ... ]


**Get a single post**

GET /posts/:id
Response (200): { "id": 1, "title": "...", "content": "...", ... }
Response (404): if the post doesn't exist


**Update a post**

PUT /posts/:id
Body: { "title": "Updated Title", "content": "Updated content." }
Response (200): the updated post


**Delete a post**

DELETE /posts/:id
Response (200): { "message": "Post deleted successfully." }


### Comments

**Create a comment on a post**

POST /posts/:postId/comments
Body: { "content": "Great post!", "user_id": 1 }
Response (201): { "id": 1, "content": "Great post!", "post_id": 1, "user_id": 1 }


**Get all comments for a post**

GET /posts/:postId/comments
Response (200): [ { "id": 1, "content": "...", ... }, ... ]


**Update a comment**

PUT /comments/:commentId
Body: { "content": "Updated comment text." }
Response (200): the updated comment


**Delete a comment**

DELETE /comments/:commentId
Response (200): { "message": "Comment deleted successfully." }


## Error Handling

All errors follow a consistent JSON structure:
```json
{ "error": { "code": "POST_NOT_FOUND", "message": "No post exists with this id." } }
```

| Status Code | Meaning |
|---|---|
| 400 | Invalid or missing input |
| 404 | Requested resource does not exist |
| 409 | Conflict (e.g., duplicate email on registration) |
| 500 | Unexpected server error |

A global error-handling middleware (`middleware/errorHandler.js`) also catches any unexpected errors that slip past individual route handlers, ensuring the server never crashes or leaks raw error details to the client.

## Design Decisions & Assumptions

- **Passwords** are hashed using `bcrypt` before being stored — plain text passwords are never saved.
- **Foreign key constraints** are explicitly enabled (`PRAGMA foreign_keys = ON`), since SQLite disables them by default. This ensures posts and comments can only reference users/posts that actually exist.
- **Cascade deletes** are enabled: deleting a user automatically deletes their posts and comments; deleting a post automatically deletes its comments.
- **No authentication/login system** is implemented in this task's scope. `user_id` is passed directly in request bodies for simplicity. In a production system, this would instead be derived from an authenticated session/token.
- **Parameterized queries** (`?` placeholders) are used throughout to prevent SQL injection.

## Testing

All endpoints were manually tested using Postman, covering:
- Successful creation, retrieval, update, and deletion for each resource
- Validation errors (missing required fields)
- Not-found errors (invalid IDs)
- Conflict errors (duplicate email registration)


Example request/response screenshots are available in the `/screenshots` folder.