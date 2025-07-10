// By default, Express exposes this: "X-Powered-By: Express"  Which is dumb. You're just telling attackers what you’re running on
// From a security point of view. We need to hide the original services details from the client/user

// const spoofedHeaders = (req, res, next) => {
//     // Fake server info
//     res.setHeader('Server', 'IIS/5.1'); // Windows XP Classic
//     res.setHeader('X-Powered-By', 'PHP/4.2.0'); // Old af
//     res.setHeader('X-Backend-Engine', 'WordPress 1.5');
//     res.setHeader('X-CMS', 'Drupal 6.0');
  
//     // Random weird headers
//     res.setHeader('X-Nginx-Version', '0.3.2');
//     res.setHeader('X-Apache-Mod', 'mod_php/3.0.1');
//     res.setHeader('X-Database', 'MS Access');
  
//     next();
//   };
  
//   module.exports = spoofedHeaders;
  
const spoofedHeaders = (req, res, next) => {
  // Emulate classic WordPress headers
  res.setHeader('Server', 'Apache/2.2.22 (Unix)');  // Mimicking an old WP server
  res.setHeader('X-Powered-By', 'PHP/5.3.29');     // Old PHP version still in use by WP
  res.setHeader('X-Backend-Engine', 'WordPress/4.9.6'); // WordPress with an old version number
  res.setHeader('X-CMS', 'WordPress');              // Clear WordPress CMS header

  // Random yet believable headers (looks like WP infrastructure)
  res.setHeader('X-Nginx-Version', '1.12.2');       // Nginx used in WP setups for reverse proxy
  res.setHeader('X-Apache-Mod', 'mod_php/5.4.45');   // Apache + PHP version WP might use
  res.setHeader('X-Database', 'MySQL/5.6.24');      // MySQL version WP could use
  res.setHeader('X-WP-Cache', 'cached');            // Common WP cache headers
  
  // Fake headers for extra deception
  res.setHeader('X-Content-Type-Options', 'nosniff');  // Common WP security header
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');      // WP security-related header

  next();
};

module.exports = spoofedHeaders;
