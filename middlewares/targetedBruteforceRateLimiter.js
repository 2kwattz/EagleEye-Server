// In the bruteforceMiddleware.js, Each failed login attempt ( wrong password ) increments the counter for the exact key
// If the user tries a wrong password for that email, It increments the failed attepts counter for that email + ip + ua
// The previous middleware is good for protecting specific accounts from targeted bruteforce attacks, But weak against attackers spraying many emails
// This middleware aims to eliminate this issue

// A global rate limiter is added in place regardless of the email  address.

// This middleware is based on IP + UA (User Agent) key which follows a more generalized approach 

const redis = require('redis');
const { promisify } = require("util")
const client = redis.createClient({legacyMode: true}); // Connecting to Redis
const useragent = require('useragent'); // Fetches Device Fingerprints

//  Connecting to the Redis Client
client.connect().catch((err) => {
    console.log("[*] [TargetedBruteforce Middleware] Error In Connecting To The Redis Client:", err);
});

// Converted Redis Commands for Async/Await versions

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const incrAsync = promisify(client.incr).bind(client);
const expireAsync = promisify(client.expire).bind(client);
const delAsync = promisify(client.del).bind(client);


// Login Bruteforce Prevention

const MAX_LOGIN_ATTEMPTS = 10; // Max failed login attempts
const BLOCKED_TIME = 1 * 60 * 60; // Blocked for 1 hour


const targetedBruteforceRateLimiter = async(req,res,next) => {

    // Fetching IP Addresses of the suspicious user
    const ip = req.ip || req.connection.remoteAddress;
    // const deviceFingerprint = generateServersideFingerprint(req);
    const userAgent = req?.headers['user-agent'] || "unknown"
    const fingerprint = userAgent.replace(/\s/g,"_");
    const emailAddress = req?.body?.email.trim().toLowerCase();

    // Unique key for this combo
    const key = `bf:${emailAddress}`;

    try{
 // Check for failed attempts
 const attempts = await getAsync(key)

 if(attempts && parseInt(attempts) >= MAX_LOGIN_ATTEMPTS){

    console.log(`[!] Blocking IP + Email for ${BLOCKED_TIME / 3600} hours due to repeated login failures.`);

     return res.status(429).json({
         message: "Too many login attempts. Email Verification required",
         emailVerificationRequired: true
     })
 }
 req.tarbruteforce = {
     fail: async() =>{
         if(!attempts){
             await setAsync(key, 1);
             await expireAsync(key, BLOCKED_TIME);
             console.log("[*] Current Value and attempts ", key, attempts)
         }
         else{
             await incrAsync(key)
             console.log("[*] Current Value and attempts ", key, attempts)
         }
     },
     success: async () =>{
         await delAsync(key)
     }
 };

 next();
    }
    catch(error){
        console.log("[*] Error in Targeted Bruteforce Prevention Middleware ", error)
    }
   

}

module.exports =  targetedBruteforceRateLimiter