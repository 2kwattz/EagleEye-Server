// DECOY ROUTES FOR HONEYPOT BAIT

const express = require('express');
const router = express.Router();
const path = require('path'); 
const app = express()

app.use(express.static(path.join(__dirname, 'public')));



// Fake route: Simulate WordPress admin dashboard
router.get('/wp-admin', (req, res) => {
    res.status(403).send('Access Denied');
});

// Fake route: Simulate direct PHP access to wp-admin

router.get('/wp-admin.php', (req, res) => {
    res.status(403).send('Access Denied');
});

// Fake route: Simulate index.php access

router.get('/index.php', (req, res) => {
    res.status(403).send('Access Denied');
});

// Fake route: Simulate generic admin panel

router.get('/admin', (req, res) => {
    res.status(403).send('Access Denied');
});

// Decoy API route to bait unauthorized access
router.get('/api/v1/secret-key', (req, res) => {
    console.log(`DECOY ALERT: ${req.ip} accessed /api/v1/secret-key`);
    res.status(401).send("Unauthorized: Invalid API Key.");
});

// Fake WordPress login page
// router.get('/wp-login.php', (req, res) => {
//     res.send(`
//     <html>
//       <head><title>Log In ‹ My WordPress Site — WordPress</title></head>
//       <body>
//         <h1>WordPress Login</h1>
//         <form>
//           Username: <input/><br>
//           Password: <input type="password"/><br>
//           <button>Login</button>
//         </form>
//       </body>
//     </html>
//   `);
// });

router.get('/wp-login.php', (req, res) => {

    console.log("GET Req sent to WP Login from ",req.ip)

   const wpLoginPagePath = path.join(__dirname, '../public/DecoyPages', 'wp-login.html');
   res.sendFile(wpLoginPagePath)
});

// Fake WordPress JSON API endpoint
router.get('/wp-json', (req, res) => {
    res.json({
        name: "WordPress Site",
        description: "Just another WordPress site",
        url: "https://example.com"
    });
});

// Fake xmlrpc.php endpoint to simulate XML parser error
router.post('/xmlrpc.php', (req, res) => {
    res.status(200).send(`<?xml version="1.0"?><methodResponse><fault><value><struct><member><name>faultCode</name><value><int>32700</int></value></member><member><name>faultString</name><value><string>parse error. not well formed</string></value></member></struct></value></fault></methodResponse>`);
});

// Fake wp-config.php to simulate access denial
router.get('/wp-config.php', (req, res) => {
    res.status(403).send("Access denied.");
});

//  Fake readme.html file
// router.get('/readme.html', (req, res) => {
//     res.send('<h1>Welcome to WordPress</h1><p>Version 5.8.1</p>');
// });

router.get('/readme.html', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordPress Version 4.9.6 ReadMe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            background: #f9f9f9;
            margin: 20px;
            color: #333;
        }
        header {
            text-align: center;
            margin-bottom: 30px;
        }
        header h1 {
            color: #0073aa;
        }
        section {
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        a {
            color: #0073aa;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <h1>WordPress</h1>
        <p>Version: <strong>5.8.1</strong></p>
    </header>
    <section>
        <h2>Welcome to WordPress</h2>
        <p>
            Thank you for choosing WordPress. This release includes significant improvements in functionality, security, and performance.
        </p>
    </section>
    <section>
        <h2>Documentation & Support</h2>
        <p>
            For additional details and updates, please visit the 
            <a href="https://wordpress.org/support/" target="_blank" rel="noopener noreferrer">WordPress Support</a> page.
        </p>
    </section>
    <section>
        <h2>Release Notes</h2>
        <p>
            - New feature enhancements<br>
            - Improved user interface design<br>
            - Security updates and bug fixes
        </p>
    </section>
</body>
</html>`);
});

// Fake license.txt file
router.get('/license.txt', (req, res) => {
    res.send("WordPress is free software, licensed under the GPL.");
});
// Fake path for wp-content assets
router.get('/wp-content/:file', (req, res) => {
    res.status(404).send("File not found");
});

// Fake path for wp-includes files
router.get('/wp-includes/:file', (req, res) => {
    res.status(404).send("404 Not Found");
});

// Fake path for uploaded media
router.get('/wp-content/uploads/:file', (req, res) => {
    res.status(404).send("File not found");
});

// Fake sitemap.xml
router.get('/sitemap.xml', (req, res) => {
    res.status(200).send(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`);
});

// Export the router to be used in server.js
module.exports = router;
