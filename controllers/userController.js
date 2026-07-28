const bcrypt = require("bcrypt");
const { createUser, findUserByEmail } = require("../models/userModel");

const SALT_ROUNDS = 10;

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

   
    if (!name || !email || !password) {
      return res.status(400).json({
        error: {
          code: "MISSING_FIELDS",
          message: "Name, email, and password are all required.",
        },
      });
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: {
          code: "INVALID_EMAIL",
          message: "Please provide a valid email address.",
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: {
          code: "WEAK_PASSWORD",
          message: "Password must be at least 6 characters long.",
        },
      });
    }

    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: "EMAIL_EXISTS",
          message: "An account with this email already exists.",
        },
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await createUser(name, email, hashedPassword);

    return res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Something went wrong. Please try again later.",
      },
    });
  }
}

module.exports = { registerUser };
