const rateLimit = require('express-rate-limit'); // Hard Rate Limiter
const slowDown = require("express-slow-down"); // Slow Down Rate Limiter


// Hard Rate Limit ( Block Persistent Spammer )

// Login attempts: Max 20 per 5 mins
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "You are trying too often. Please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot Password attempts: Max 5 per 5 mins
const forgotPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "You are trying too often. Please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security Question Answers: Max 5 per day
const securityQuestionAnswerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "You are trying too often. Please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Soft Slowdown Rate Limiter (Delays Malicious User)

const speedLimiter = slowDown({
  windowMs: 5 * 60 * 1000, // 5 minutes
  delayAfter: 5,           // Allow 5 requests per window
  delayMs: 3000            // Then add 1s delay per request above 5
});

module.exports = {
  loginLimiter,
  forgotPasswordLimiter,
  securityQuestionAnswerLimiter,
  speedLimiter
};

