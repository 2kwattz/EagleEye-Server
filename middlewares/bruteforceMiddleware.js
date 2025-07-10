const redis = require('redis');
const { promisify } = require("util")
const client = redis.createClient({legacyMode: true}); // Connecting to Redis
const useragent = require('useragent'); // Fetches Device Fingerprints

//  Connecting to the Redis Client
client.connect().catch((err) => {
    console.log("[*] [BruteforceMiddleware] Error In Connecting To The Redis Client:", err);
});

// Converted Redis Commands for Async/Await versions

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const incrAsync = promisify(client.incr).bind(client);
const expireAsync = promisify(client.expire).bind(client);
const delAsync = promisify(client.del).bind(client);


// Login Bruteforce Prevention

const MAX_LOGIN_ATTEMPTS = 10; // Max failed login attempts
const BLOCKED_TIME = 15 * 60; // Blocked for 15 minutes

// Sever-side device fingerprinting generation

const generateServersideFingerprint = (req) => {
    const ip = req.ip || req.connection.remoteAddress; // To get client's IP Address
    const userAgent = req.get('User-Agent'); // To get user agent headers
    const language = req.get('Accept-Language');

    const agent = useragent.parse(userAgent)

    const fingerprint = `${ip} | ${agent.family} | ${agent.os} | ${language}`
    // console.log("[*] User Fingerprint captured ", fingerprint)

    return fingerprint;
}

const bruteforceMiddleware = async(req,res,next) => {

    // Fetching IP Addresses of the suspicious user
    const ip = req.ip || req.connection.remoteAddress;
    // const deviceFingerprint = generateServersideFingerprint(req);
    const userAgent = req?.headers['user-agent'] || "unknown"
    const fingerprint = userAgent.replace(/\s/g,"_");
    const emailAddress = req?.body?.email.trim().toLowerCase();

    // Unique key for this combo
    const key = `bf:${ip}:${fingerprint}:${emailAddress}`;

    try{
 // Check for failed attempts
 const attempts = await getAsync(key)

 if(attempts && parseInt(attempts) >= MAX_LOGIN_ATTEMPTS){
     return res.status(429).json({
         message: "Too many login attempts. Please try again after 15 minutes"
     })
 }
 req.bruteforce = {
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
         delAsync(key)
     }
 };

 next();
    }
    catch(error){
        console.log("[*] Error in Bruteforce Prevention Middleware ", error)
    }
   

}

module.exports =  bruteforceMiddleware