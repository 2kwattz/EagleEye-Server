// Express Framework

const express = require('express');
const app = express()
require("dotenv").config() // Dotenv enviornment for variables
const twilio = require('twilio');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const { exec } = require('child_process');

const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


// Tor Proxy

const { SocksProxyAgent } = require('socks-proxy-agent');

// Optimization & Compression

const compression = require('compression');
const NodeCache = require("node-cache");
// const cache = new NodeCache();


// Miscellaneous

const path = require('path')
const cookieParser = require('cookie-parser'); // The name says it all
const { dispatchEmail } = require('../services/sendEmail')
const os = require('os'); // OS Detection
const { spawn } = require('child_process'); // Run system processes

// Flight Radar 24 Unofficial SDK

const { FlightRadar24API } = require("flightradarapi");
const frApi = new FlightRadar24API();

// Test Email

// dispatchEmail('forgotPassword','prakashbhatia1970@gmail.com',{
//   type: 'forgotPassword',
//   to: 'prakashbhatia1970@gmail.com',
//   data: {
//     username: "Bunty",
//     resetLink: 'https:localhost:3000/resetPassword',
//     expiryTime: 10
//   }

// })

// Database

const mongoose = require('mongoose');
// const mongodb_url = process.env.DEVELOPMENT_MONGODB_URL
// require('../db/conn')

// const { poolPromise } = require('../db/sql/dbConfig.js');  

// Route Endpoints

const decoyRoutes = require("../routes/decoyRoutes") // Decoy routes for confusing network sniffers & bots


// Security
const csrf = require('csurf');
const helmet = require('helmet'); // Helmet Middleware
const mongoSanitize = require('express-mongo-sanitize'); // Prevents NoSQL Attacks
const sqlInjectionGuard = require('../middlewares/sqlInjectionGuard') // Prevents SQL Attacks
const spoofedHeaders = require('../middlewares/spoofedHeaders') // Honeypot baiter
const IpBlocklist = require("../middlewares/IpBlocklist") // Blocked IP Addresses
const { loginLimiter, forgotPasswordLimiter, securityQuestionAnswerLimiter } = require('../middlewares/rateLimiter'); // Express Rate limiter
const bruteforceMiddleware = require('../middlewares/bruteforceMiddleware')
// const authRoutes = require('../controller/auth.controller')
// Disable Express's default X-Powered-By header
app.disable('x-powered-by');
const cors = require('cors');

// PORT

const PORT = process.env.PORT || 3000

// Middlewares

// Allow CORS 
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true // React app address for frontend interaction
}));

app.use(express.json()); // JSON Parser
app.use(express.urlencoded({ extended: true })); // Body Parser
app.set('trust proxy', false); // Allows Express to look at X-Forwarded-For header to get Client's IP Address
app.use(compression()) // GZip Compression for faster loading time
// app.use(csrf({ cookie: true }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Account SID

const acc_sid = process.env.ACC_ID;
const auth_token = process.env.AUTH_TOKEN;

const virtualNumber1 = '+17342514771';

const client = twilio(acc_sid, auth_token);

let flightTrackingStatus;

// Web Scrapping Configuration
const flightTrackerSources = require("../services/flightTrackers.js")
const scrapperPath = path.join(__dirname, '..', 'Scrapper', 'scrapper.py');
const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
console.log("[*] Verifying Web Scrapper Script Path : ", scrapperPath);

// Indian Air Force Aircrafts Database

const C295Hex = [{ "CA-7106": "8016e5" }];
const C130Hexs = [
  
  { Registration: "KC-3801", AircraftName: "C130J", AircraftOperator: "IndianAirForce", HexCode: "800332", isNearUserSpecifiedCity: false },
  { Registration: "KC-3802", AircraftName: "C130J", AircraftOperator: "IndianAirForce", HexCode: "800333", isNearUserSpecifiedCity: false },

  { Registration: "KC-3804", AircraftName: "C130J", AircraftOperator: "IndianAirForce", HexCode: "800335", isNearUserSpecifiedCity: false },
  { Registration: "KC-3805", AircraftName: "C130J", AircraftOperator: "IndianAirForce", HexCode: "800336", isNearUserSpecifiedCity: false },
  { Registration: "KC-3806", AircraftName: "C130J", AircraftOperator: "IndianAirForce", HexCode: "800337", isNearUserSpecifiedCity: false },
  { Registration: "KC-3807", AircraftName: "C130J", AircraftOperator: "IndianAirForce", HexCode: "800E1E", isNearUserSpecifiedCity: false },
  { Registration: "KC-3808", AircraftName: "C130J", AircraftOperator: "IndianAirForce", HexCode: "800E1F", isNearUserSpecifiedCity: false },
  { Registration: "KC-3809", AircraftName: "C130J", AircraftOperator: "IndianAirForce", HexCode: "800E20", isNearUserSpecifiedCity: false },


];

const P8IHexs = [
  { Registration: "IN329", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "800E8A", isNearUserSpecifiedCity: false },
  { Registration: "IN328", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "800E89", isNearUserSpecifiedCity: false },
  { Registration: "IN327", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "800313", isNearUserSpecifiedCity: false },
  { Registration: "IN326", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "800312", isNearUserSpecifiedCity: false },
  { Registration: "IN325", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "800311", isNearUserSpecifiedCity: false },
  { Registration: "IN324", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "800310", isNearUserSpecifiedCity: false },
  { Registration: "IN323", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "80030F", isNearUserSpecifiedCity: false },
  { Registration: "IN322", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "80030E", isNearUserSpecifiedCity: false },
  { Registration: "IN321", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "80030D", isNearUserSpecifiedCity: false },
  { Registration: "IN320", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "80030C", isNearUserSpecifiedCity: false },
  { Registration: "IN330", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "800E8B", isNearUserSpecifiedCity: false },
  { Registration: "IN331", AircraftName: "P8i", AircraftOperator: "IndianNavy", HexCode: "800E8C", isNearUserSpecifiedCity: false }
];

// const B737IndiaHexs = [{ "K5012": "8002f6" }];

const IAFPrivateJetsHexs = [{ "VUAVV": "385b0ec1" }];

const C17Hexs = [
  { Callsign: "VUAUA", Registration: "CB-8001", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "80078E", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUB", Registration: "CB-8002", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "80078F", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUC", Registration: "CB-8003", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800790", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUD", Registration: "CB-8004", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800791", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUE", Registration: "CB-8005", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800792", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUF", Registration: "CB-8006", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800793", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUG", Registration: "CB-8007", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800794", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUH", Registration: "CB-8008", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800795", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUI", Registration: "CB-8009", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800796", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUJ", Registration: "CB-8010", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800797", isNearUserSpecifiedCity: false },
  { Callsign: "VUAUK", Registration: "CB-8011", AircraftName: "C17", AircraftOperator: "IndianAirForce", HexCode: "800E63", isNearUserSpecifiedCity: false },
];

const IL76Hexs = [
  { Registration: "K-2663", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8013e5", isNearUserSpecifiedCity: false },
  { Registration: "K-2661", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002D5", isNearUserSpecifiedCity: false },
  { Registration: "K-2665", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002D9", isNearUserSpecifiedCity: false },
  { Registration: "KI2664", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002D8", isNearUserSpecifiedCity: false },


  { Registration: "K-2901", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002DD", isNearUserSpecifiedCity: false },
  { Registration: "KI2879", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002DC", isNearUserSpecifiedCity: false },
  { Registration: "KJ-3449", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002D6", isNearUserSpecifiedCity: false },


  { Registration: "RK-3452", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002E9", isNearUserSpecifiedCity: false },
  { Registration: "RK-3453", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002EA", isNearUserSpecifiedCity: false },
  { Registration: "RK-3454", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "8002EB", isNearUserSpecifiedCity: false },
];

const Dornier228 = [
  { Registration: "HM700", AircraftName: "IL76", AircraftOperator: "IndianAirForce", HexCode: "800305", isNearUserSpecifiedCity: false }
 
];

const JaguarsHex = [
  { Registration: "JM255", AircraftName: "Jaguar", AircraftOperator: "IndianAirForce", HexCode: "83F255", isNearUserSpecifiedCity: false }
];

const LCAHex = [
  { Registration: "KH2018", AircraftName: "LCA", AircraftOperator: "IndianAirForce", HexCode: "801447", isNearUserSpecifiedCity: false }
];

const AwacsHex = [

  { Registration: "VUAUM", AircraftName: "AirbusA319", AircraftOperator: "IndianAirForce", HexCode: "8003C1", isNearUserSpecifiedCity: false },
  { Registration: "VTSCO", AircraftName: "AirbusA319", AircraftOperator: "IndianAirForce", HexCode: "8004FD", isNearUserSpecifiedCity: false }

  ];
  const EmbraerLegacy600Hex = [

    { Registration: "K3601", AircraftName: "E35L", AircraftOperator: "IndianAirForce", HexCode: "8002CB", isNearUserSpecifiedCity: false },
    { Registration: "K3602", AircraftName: "E35L", AircraftOperator: "IndianAirForce", HexCode: "8002CC", isNearUserSpecifiedCity: false },
    { Registration: "K3603", AircraftName: "E35L", AircraftOperator: "IndianAirForce", HexCode: "8002CD", isNearUserSpecifiedCity: false },
    { Registration: "K3604", AircraftName: "E35L", AircraftOperator: "IndianAirForce", HexCode: "8002CE", isNearUserSpecifiedCity: false }
  
    ];


const An32Hexs = [
  { Registration: "VUMPG", AircraftName: "An32", AircraftOperator: "IndianAirForce", HexCode: "385aaf10", isNearUserSpecifiedCity: false },
  { Registration: "VUDXD", AircraftName: "An32", AircraftOperator: "IndianAirForce", HexCode: "385b3e9e", isNearUserSpecifiedCity: false }
];


// Patch: redefine req.query to be mutable
app.use((req, res, next) => {
  const queryClone = Object.assign({}, req.query);
  Object.defineProperty(req, 'query', {
    value: queryClone,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  next();
});

app.use(mongoSanitize()); // Protection against NoSQL Injection Attacks

// Helmet is a collection of small middleware functions that set HTTP headers
// to secure your app from common web vulnerabilities such as: Cross-Site Scripting (XSS), Clickjacking
// MIME sniffing, Protocol downgrade attacks, Cross-Origin data leaks

app.use(helmet()); // Helmet's common web vulnerbility security
app.use(sqlInjectionGuard); // Protection against SQL Injection Attacks
app.use(spoofedHeaders) /// Express Header Mask
app.use(IpBlocklist) // Prevents Blocked IP Addresses to access the web application
app.use('/', decoyRoutes); // Setting decoy routes for honeypot bait
// app.use(authRoutes)

// Redirect all Http traffic to Https in Production enviornment

if (process.env.NODE_ENV === 'production') {

  app.use((req, res, next) => {
    try {

      if (!req.secure) {
        const host = req.headers.host;
        const url = req.url;

        if (!host || !url) {
          console.warn("[!] Missing headers in request, skipping redirect.");
          return next(); // Graceful degradation
        }

        const redirectUrl = `https://${host}${url}`;
        console.log(`[→] Redirecting insecure request to: ${redirectUrl}`);
        return res.redirect(301, redirectUrl); // Permanent Redirect
      }
      next();
    } catch (error) {
      console.error("[*] HTTPS Middleware Redirect Error:", error.message);
      return next(); // Always call next() in error case
    }
  });
} else {
  console.log("\n[*] Node is in Development Environment. HTTPS Redirection not implemented.\n");
}

// Routes 

const routes = require('../routes/routes');
const { ConversationRelay } = require('twilio/lib/twiml/VoiceResponse');
app.use('/', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || 500;

  switch (status) {
    case 400:
      res.status(400).send('400 - Bad Request');
      break;
    case 401:
      res.status(401).send('401 - Unauthorized');
      break;

    case 402:
      res.status(402).send('402 - Payment Required'); // Rarely used, but hey
      break;
    case 403:
      res.status(403).send('403 - Forbidden');
      break;
    case 404:
      res.status(404).send('404 - Not Found');
      break;
    case 500:
    default:
      res.status(500).send('500 - Internal Server Error');
      break;
  }
});



let logs = []; // Store all logs

// 🚀 Helper to push logs
// function pushLog(type, message) {
//   logs.push({ type, message, timestamp: new Date().toISOString() });
//   if (logs.length > 500) logs.shift(); // prevent memory overload
// }


// function pushLog(type, message) {
//   const entry = { type, message, timestamp: new Date().toISOString() };
//   logs.push(entry);
//   if (logs.length > 500) logs.shift();

//   // Emit to all connected sockets
//   io.emit('log', [entry]); // send only the new entry
// }

// // ✅ Hijack console methods
// ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
//   const original = console[method];
//   console[method] = (...args) => {
//     const message = args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');
//     pushLog(method, message);
//     original.apply(console, args);
//   };
// });

// // ✅ Capture stdout & stderr (like process.print, etc.)
// const { stdout, stderr } = process;

// const interceptStream = (stream, type) => {
//   const write = stream.write;
//   stream.write = (chunk, ...args) => {
//     // pushLog(type, chunk.toString().trim());
//     // write.apply(stream, [chunk, ...args]);
//     try {
//       const clean = Buffer.from(chunk).toString('utf8').trim();
//       pushLog(type, clean);
//     } catch (e) {
//       console.warn(`[⚠️] Failed to decode log (${type}):`, e.message);
//     }
    
//   };
// };

// interceptStream(stdout, 'stdout');
// interceptStream(stderr, 'stderr');

// // ✅ Capture unhandled exceptions
// process.on('uncaughtException', err => {
//   pushLog('uncaughtException', err.stack || err.toString());
//   console.error(err);
// });

// process.on('unhandledRejection', reason => {
//   pushLog('unhandledRejection', reason.stack || reason.toString());
//   console.error(reason);
// });

// ✅ Sample logs
console.log("Server is starting...");
setTimeout(() => {
  Promise.reject(new Error("Unhandled rejection for demo"));
}, 5000);

// ✅ API to expose logs
app.get('/api/print-logs', (req, res) => {
  res.json(logs);
});

app.get("/api/flightstatus", async function (req, res) {
  res.json(C17Hexs)
})
// User's latitude & longitude

city_lat = 24.653

city_lon = 24.842

// Phone Numbers to call

const callNumbers = [9909471247,6354248126,9874867962]
let currentScrappersIp = null

// Location Proximation

const R = 3959; // Radius of the Earth in miles

function degToDeg360(degree) {
  return degree * (Math.PI / 180);  // we're not calling it radian, okay?
}


function haversine(lat1, lon1, lat2, lon2) {
  /**
   * Calculate the great-circle distance in miles between two points
   * on the Earth's surface given by their latitude and longitude.
   */

  // Convert degrees to 0–2π equivalents 
  lat1 = degToDeg360(lat1);
  lon1 = degToDeg360(lon1);
  lat2 = degToDeg360(lat2);
  lon2 = degToDeg360(lon2);

  // Haversine formula
  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a = Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dlon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function is_within_radius(lat1, lon1, lat2, lon2, radius = 400) {
  const distance = haversine(lat1, lon1, lat2, lon2);
  return distance <= radius;
}

// Scrapper

let firstPreference = "radarbox"
let secondPreference = "adsb";

io.on('connection', socket => {

  // Optional: send initial logs
  socket.emit('log', logs );
  

  socket.emit('currentflighttracked', flightTrackingStatus)

  socket.on('disconnect', () => {
   
  });
});


async function generateScrappingUrl(aircraftType, TrackingType, Source, Identifier) {

  let BASE_URL;

  if (Source === "radarbox" && TrackingType === "registration") {
    BASE_URL = flightTrackerSources["radarbox"].getURL(Identifier)
    console.log("BASE_URL ", BASE_URL)
    return BASE_URL
  }
  else if (Source === "adsb" && TrackingType === "hex") {
    BASE_URL = flightTrackerSources["adsb"].getURL(Identifier)
    console.log("BASE_URL ", BASE_URL)
    return BASE_URL

  }

  return null
}

// async function runPythonScrapper(TrackingUrl, AircraftOperator, timeout=70000) {

//   const args = [scrapperPath, TrackingUrl, AircraftOperator];

//   try {

//     console.log("Spawning Scrapper Process")

//     let stdout = '';
//     let stderr = '';

//     const pythonScrapper = spawn(pythonCmd, args,{detached: true});

//     console.log("Spawned Python Instance")

//     const timeoutId = setTimeout(() => {
//       console.warn('Timeout reached! Killing Python scraper like your ex killed your joy.');
//       process.kill(-pythonScrapper.pid); // kills the full process group
//     }, timeout);

//     for await (const chunk of pythonScrapper.stdout) {
//       stdout += chunk.toString();
//     }

//     for await (const chunk of pythonScrapper.stderr) {
//       stderr += chunk.toString();
//     }

//     const exitCode = await new Promise((resolve) => pythonScrapper.on('close', resolve));

//     if (exitCode !== 0) {
//       throw new Error(stderr || `Python exited with code ${exitCode}`);
//     }

//     clearTimeout(timeoutId);

//     return stdout.trim(); 

//   }
//   catch (error) {
//     console.log("Error in spawning scrapper process ", error)
//   }

// }

// async function runPythonScrapper(TrackingUrl, AircraftOperator, timeout = 70000) {
//   const args = [scrapperPath, TrackingUrl, AircraftOperator];

//   return new Promise((resolve, reject) => {
//     let stdout = '';
//     let stderr = '';

//     console.log("Spawning Scrapper Process");

//     const pythonScrapper = spawn(pythonCmd, args, {
//       detached: true,
//       stdio: ['ignore', 'pipe', 'pipe']
//     });

//     console.log("Spawned Python Instance");

//     const timer = setTimeout(() => {
//       console.warn('Timeout reached! Nuking Python and Chromium like her patience during your "just one more game" moment.');
    
//       try {
//         // Kill Python script
//         process.kill(pythonScrapper.pid);
    
//         // Kill Chromium instances spawned by Python
//         const killChrome = spawn('taskkill', ['/IM', 'chrome.exe', '/F', '/T']);
    
//         killChrome.stdout.on('data', data => {
//           console.log(`Chrome Kill Output: ${data}`);
//         });
    
//         killChrome.stderr.on('data', data => {
//           console.error(`Chrome Kill Error: ${data}`);
//         });
    
//       } catch (e) {
//         console.error("Error during kill sequence:", e.message);
        
//       }
    
//       reject(new Error('Timeout: Python scraper hung or took too long.'));
//     }, timeout);
    

//     pythonScrapper.stdout.on('data', chunk => {
//       stdout += chunk.toString();
//     });

//     pythonScrapper.stderr.on('data', chunk => {
//       stderr += chunk.toString();
//     });

//     pythonScrapper.on('close', (code) => {
//       clearTimeout(timer);
//       if (code !== 0) {
//         reject(new Error(stderr || `Python exited with code ${code}`));
//       } else {
//         resolve(stdout.trim());
//       }
//     });

//     pythonScrapper.on('error', (err) => {
//       clearTimeout(timer);
//       reject(err);
//     });
//   });
// }

async function runAdsbLolApi(){
  const endpoint = "https://api.adsb.lol/v2/lat/22.3072/lon/73.1812/dist/250";
  const proxy = 'socks5h://127.0.0.1:9050'; // like your Tor setup

  const agent = new SocksProxyAgent(proxy);
  
  try {
    const response = await axios.get(endpoint, { httpsAgent: agent });
    console.log("ADB Response:", response.data);

    const c17Map = new Map(C17Hexs.map(c17 => [c17.HexCode.toLowerCase(), c17]));

    response.data.ac.forEach(aircraft => {
      const hex = aircraft.hex.toLowerCase();
      
      if (c17Map.has(hex)) {
        // Update the `isNearUserSpecifiedCity` flag
        c17Map.get(hex).isNearUserSpecifiedCity = true;

        const callNumbers = [9909471247,6354248126,9874867962]

        callNumbers.forEach((number, index) => {
          const cmd = `adb shell am start -a android.intent.action.CALL -d tel:${number}`;
          exec(cmd, (err, stdout, stderr) => {
            if (err) {
              console.error(`❌ Call error for ${number}:`, err.message);
            } else {
              console.log(`Call dialed to ${number}`);
            }
          });
        });
        console.log(`🛩️ C-17 Detected: ${aircraft.flight} [Hex: ${hex}] is NEAR your city!`);
      }

    
  } )

}

catch (error) {
  console.error("Error calling ADSB API:", error.message);
}
}


async function runFlightRadar24SdkApi(){



  // Vadodara: ~22.3072°N, 73.1812°E
  let bounds = frApi.getBoundsByPoint(22.3072, 73.1812, 463000); // 250 nm (463km) radius
  
  const proxy = 'socks5h://127.0.0.1:9050'; // like your Tor setup

  const agent = new SocksProxyAgent(proxy);

  let flights = await frApi.getFlights(null, bounds);
  console.log("Flights Data from FR24 Unofficial Sdk ",flights)

  const detectedHexs = new Set(
    flights.map(f => f.icao24bit.toUpperCase())

  );

  console.log(detectedHexs)

  let anyMatch = false;

  // Indian Navy's P8is
  P8IHexs.forEach(p8 => {
    if (detectedHexs.has(p8.HexCode.toUpperCase())) {

      console.log(`${p8.Registration} ${p8.AircraftName} is within 250 nautical miles of Vadodara. Grab your camera and start shooting `)
      p8.isNearUserSpecifiedCity = true;
      anyMatch = true;
    }
    else{
      console.log("No Indian Navy's P8i is within 250 nautical miles of Vadodara.")
    }

  });

  IL76Hexs.forEach(il76 =>{

    if(detectedHexs.has(il76.HexCode.toUpperCase())){

      console.log(`${il76.Registration} ${il76.AircraftName} is within 250 nautical miles of Vadodara. Grab your camera and start shooting `)
      il76.isNearUserSpecifiedCity = true;
      anyMatch = true;
    }
    else{
    //   console.log("No Indian Air Force's IL76 is within 250 nautical miles of Vadodara.")
    }
  })

  C130Hexs.forEach(C130j =>{
    if(detectedHexs.has(C130j.HexCode.toUpperCase())){

      console.log(`${C130j.Registration} ${C130j.AircraftName} is within 250 nautical miles of Vadodara. Grab your camera and start shooting `);
      anyMatch = true;
      C130j.isNearUserSpecifiedCity = true;
    }
    else{
      // console.log("No Indian Air Force's C130J is within 250 nautical miles of Vadodara.")
    }
  })

  JaguarsHex.forEach(jag =>{
    if(detectedHexs.has(jag.HexCode.toUpperCase())){

      console.log(`${jag.Registration} ${jag.AircraftName} is within 250 nautical miles of Vadodara. Grab your camera and start shooting `);

      anyMatch = true;
      jag.isNearUserSpecifiedCity = true;

    }
    else{
      // console.log(`JM255 is not within 250 nautical miles of Vadodara.`)
    }
  })


  LCAHex.forEach(lca =>{
    if(detectedHexs.has(lca.HexCode.toUpperCase())){

      console.log(`${lca.Registration} ${lca.AircraftName} is within 250 nautical miles of Vadodara. Grab your camera and start shooting `);

      anyMatch = true;
      lca.isNearUserSpecifiedCity = true;

    }
    else{
      // console.log(`KH2018 LCA is not within 250 nautical miles of Vadodara. `)
    }
  })

  if(anyMatch){

    const callNumbers = [9909471247,6354248126,9874867962]

    callNumbers.forEach((number, index) => {

      const message = 'Automated Test Message from the flight tracker server. Ignore pls';
      const safeMessage = message.replace(/"/g, '\\"');

      // Final command with single outer quotes, double quotes inside
      const cmd = `adb shell su -c 'service call isms 5 i32 0 s16 "com.android.mms.service" s16 "${number}" s16 "null" s16 "${message}" s16 "null" s16 "null"'`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error(`Sms error for ${number}:`, err.message);
        } else {
          console.log(`SMS Sent to ${number}`);
          console.log(`SMS STDOUT `,stdout);

          console.log(`SMS STDERR `,stdout);
        }
      });
    });

  }


  }

async function runPythonScrapper(TrackingUrl, AircraftOperator,Registration, timeout = 70000) {
  const args = [scrapperPath, TrackingUrl, AircraftOperator];

  return new Promise(function tryRun(resolve) {
    let stdout = '';
    let stderr = '';

    console.log(`[Node] Spawning Scraper Process for: ${Registration}`);

    const pythonScrapper = spawn(pythonCmd, args, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let killedDueToTimeout = false;

    const timer = setTimeout(() => {
      console.warn('[Node] Timeout reached. Killing Python and Chrome.');

      killedDueToTimeout = true;

      try {
        process.kill(pythonScrapper.pid);

        const killChrome = spawn('taskkill', ['/IM', 'chrome.exe', '/F', '/T']);

        killChrome.stdout.on('data', data => {
          console.log(`[Node] Chrome Kill Output: ${data.toString().trim()}`);
        });

        killChrome.stderr.on('data', data => {
          console.error(`[Node] Chrome Kill Error: ${data.toString().trim()}`);
        });

      } catch (e) {
        console.error(`[Node] Error during kill sequence: ${e.message}`);
      }
    }, timeout);

    pythonScrapper.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`[Node] STDOUT: ${data.toString().trim()}`);
    });

    pythonScrapper.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`[Node] [PythonScrapper] STDERR: ${data.toString().trim()}`);
    });

    pythonScrapper.on('close', (code) => {
      clearTimeout(timer);
      console.warn(`[Node] Scraper exited with code ${code}`);

      if (code === 0 && !killedDueToTimeout) {
        console.log('[Node] Scraper completed successfully. No restart.');
        return resolve(stdout.trim());
      }

      console.log('[Node] Proxy Error occurred. Restarting scraper in 3 seconds...');
      setTimeout(() => tryRun(resolve), 3000); // retry
    });
  });
}

async function scrapFlights(AircraftType) {


  for (const planes of AircraftType) {
    const { Registration, HexCode, AircraftOperator,AircraftName, Callsign } = planes;
    console.log("BASE REG", Registration)

    const TRACKING_URL = await generateScrappingUrl("C17", "registration", "radarbox", Registration)
    console.log(`[Node] Tracking Url for ${Registration} generated `, TRACKING_URL)
    let result = await runPythonScrapper(TRACKING_URL, AircraftOperator, Registration)

      result = await JSON.parse(result);

      console.log("[Node] Scrapper Results ", result)

      let aircraftLatitude;
      let aircraftLongitude;

      if (!result.error) {

        aircraftLatitude = parseFloat(result?.latitude);
        aircraftLongitude = parseFloat(result?.longitude);
        currentScrappersIp = result?.currentIp;

        console.log(result)
        flightTrackingStatus = result

      console.log("[Node] Fetched Lat Long", aircraftLatitude, aircraftLongitude)
      if (is_within_radius(
        parseFloat(city_lat),
        parseFloat(city_lon),
        parseFloat(aircraftLatitude),
        parseFloat(aircraftLongitude)
      )) {
        console.log(`[Node] ${Registration} is within 400 miles of Vadodara `)

        // generateCallMessage(`This is a call from 2kwattz EagleEye Flight Alert System, ${AircraftOperator} ${AircraftName} with registeration ${Registration} is within 400 miles of Vadodara.`)
        const message = `This is a call from 2kwattz EagleEye Flight Alert System. ${AircraftOperator} ${AircraftName} with registration ${Registration} is within 400 miles of Vadodara.`;

        // Encode the message to be URL-safe
        const encodedMessage = encodeURIComponent(message);
        const formattedNumbers = callNumbers.map(num => `+91${num}`);

        // const callUrl = '/alertMessage';

        const callUrl = `http://150.107.210.11/alertMessage?message=${encodedMessage}`;
        async function callAll() {
          for (const number of formattedNumbers) {
            try {
              const call = await client.calls.create({
                url: callUrl,
                to: number,
                from: virtualNumber1,
              });
              console.log(`Calling ${number} - SID: ${call.sid}`);
            } catch (err) {
              console.error(`Failed to call ${number}:`, err.message);
            }
          }
        }
        await callAll();


        const inRadiusAircraft = C17Hexs.find(plane => plane?.Registration === Registration);

        if (!inRadiusAircraft) {

          console.log("[Node] In Radius aircraft not found in Database")
          
        }
        else{
           inRadiusAircraft.isNearUserSpecifiedCity = true;
        }

      }
      else {

        const outRadiusAircraft = C17Hexs.find(plane => plane?.Registration === Registration);
        console.log(`[Node] ${Registration} is NOT within 400 miles of Vadodara `)
        outRadiusAircraft.isNearUserSpecifiedCity = false;
      }



    }
    else {
      console.log("[Node] Error in calculating radius ", result)
    }

  }

}


// await scrapFlights(C17Hexs);
const INTERVAL = 10 * 60 * 1000; // 10 minutes
let isRunning = false;
let nextRun;
let scraperStatus;
let lastRun;

// (async () => {
//   try {
//     console.log("[Node] Running scrapper on startup...");
//     await scrapFlights(C17Hexs);
//     console.log("[Node] Scrapper finished.");
//   } catch (err) {
//     console.error("[Node] Scrapper startup error:", err);
//   }
// })();


async function runScrapper() {
  if (isRunning) {
    console.log("Scrapper is already running. Skipping this cycle.");
    return;
  }

  isRunning = true;
  scraperStatus = 'running';
  lastRun = new Date();

  try {
    console.log(`[Node] Scrapper started at ${lastRun.toLocaleTimeString()}`);
    // await scrapFlights(C17Hexs);
    // await runAdsbLolApi()
    await runFlightRadar24SdkApi()
 
    console.log(`[Node] Scrapper finished.`);
    scraperStatus = 'dormant';
  } catch (err) {
    console.error("[Node] Scrapper error:", err);
    scraperStatus = 'error';
  }

  nextRun = new Date(Date.now() + INTERVAL);
  isRunning = false;
}

runScrapper(); // Run immediately

setInterval(() => {
  scraperStatus = 'dormant'; // waiting phase
  runScrapper();
}, INTERVAL);


console.log(flightTrackerSources.adsb)



/**
 * Generates a TwiML response with a custom message
 * @param {string} msg - Message to say during the call
 * @returns {string} XML TwiML response
 */
 function generateCallMessage(msg) {
  const response = new VoiceResponse();
  response.say(
    {
      voice: 'alice',
      language: 'en-IN'
    },
    msg
  );
  return response.toString();
}

app.get('/serverstatus', (req, res) => {
  res.json({
    status: scraperStatus,
    lastRun: lastRun ? lastRun.toISOString() : null,
    nextRun: nextRun ? nextRun.toISOString() : null,
    isRunning,
    scrappersIp: currentScrappersIp
  });
});



app.get('/alertMessage', (req, res) => {
  // Get the message from query param, default if not given
  const message = req.query.message || 'C17 Approaching BDQ. Please Evacuate. I repeat. Please Evacuate';

  const xml = generateCallMessage(message);
  res.type('text/xml');
  res.send(xml);
});

app.get('/api/flightTrackingStatus',(req,res)=>{
  res.json(flightTrackingStatus)
})




// catch-all 404 (must come last)
app.use((req, res) => {
  res.status(404).send('404 - Not Found');
});

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`[*] NodeJs Server running on ${PORT} `);
// });
server.listen(PORT,'0.0.0.0', () => {
  console.log('[Server] Socket.IO server running on 150.107.210.11');
});
