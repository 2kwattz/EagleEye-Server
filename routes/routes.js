const authController = require('../controller/auth.controller.js');

const express = require('express');
const router = express.Router();
const {loginLimiter} = require('../middlewares/rateLimiter')

//  Auth Controller 


// Middleware imports
const sqlInjectionGuard = require('../middlewares/sqlInjectionGuard'); // To detect and block SQL Injections 
const bruteforceMiddleware = require('../middlewares/bruteforceMiddleware'); // To detect and prevent bruteforce attacks based on Email + UA + IP Key
const targetedBruteforceRateLimiter = require('../middlewares/targetedBruteforceRateLimiter') // To detect targeted bruteforce attacks regardless of botnets etc
const generalBruteforceRateLimiter = require('../middlewares/generalBruteforceRateLimiter') // Generalized middleware to detect and prevent bruteforce attacks (including spray attacks) based on UA + IP


// GET: Simulate server crash
router.get('/error500', (req, res, next) => {
  next(new Error('Internal Server Error'));
});

// GET: Home
router.get('/', sqlInjectionGuard, bruteforceMiddleware, (req, res) => {
  res.send('Basic Express server running.');
});

// POST: Home
router.post('/', sqlInjectionGuard, (req, res) => {
  res.send('Basic Express server running.');
});

// GET: Login Form
router.get('/login-page', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login Form</title>
</head>
<body>
    <h2>Login</h2>
    <form action="/login-page" method="POST">
        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" required><br><br>
        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password" required><br><br>
        <button type="submit">Login</button>
    </form>
</body>
</html>`);
});

// POST: Login handler
router.post('/login-page', bruteforceMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    const realPassword = "12345678";

    if (password !== realPassword) {
      await req.bruteforce.fail();
      console.log(`[*] Login Failed`);
      return res.status(401).json({ message: "Invalid credentials" });
    } else {
      await req.bruteforce.success();
      res.status(200).json({ message: "Logged in successfully" });
    }
  } catch (error) {
    console.log("[*] Error in Login POST Route ", error);
    res.status(500).json({ message: "Server Error" });
  }
});


router.get("/register",authController.getRegisterPage);

router.post("/register", authController.postRegisterPage)

router.get("/login", authController.getLoginPage)

router.post('/login', loginLimiter,generalBruteforceRateLimiter,targetedBruteforceRateLimiter,  authController.postLoginPage)


module.exports = router;
