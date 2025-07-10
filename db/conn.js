
const mongoose = require('mongoose');

// Mongodb Connection Url
const dbURI = process.env.DEVELOPMENT_MONGODB_URL; // Development Enviournment
let dbURIAtlas; // Production Enviournment

const connectDb = async() =>{
try{
await mongoose.connect(dbURI)
// console.log("[*] Database Connection Log ",databaseConnection)

console.log('[+] Connected to MongoDB Database');

}
catch(error){
    console.log("[-] Error In Connecting Database ",error)
    console.log("\n[*] Attempting reconnection...")
    setTimeout(connectDb, 15000); // Reconnection attempt when connection breaks first time
}
}

connectDb()

mongoose.connection.on('disconnected', () => {
    console.log('[-] MongoDB disconnected. Attempting reconnection...');
    setTimeout(connectDb, 5000);
  });
  
  // Optionally, for 'error' events as well:
  mongoose.connection.on('error', (err) => {
    console.error('[-] Mongoose connection error:', err);
  });
  

module.exports = connectDb;