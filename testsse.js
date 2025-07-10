const express = require('express');
const app = express();
const fs = require('fs')
const https = require('https');


app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let counter = 0;

  const interval = setInterval(() => {
    const msg = `data: Hello ${++counter}\n\n`;
    console.log("Sending:", msg.trim());
    res.write(msg);
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
    console.log("Client disconnected.");
  });
});

app.get('/', (req, res) => {


  res.send(`
    <!DOCTYPE html>
    <html>
    <body style="background:#111;color:#0f0;font-family:monospace;padding:20px;">
      <h2>Test SSE Feed</h2>
      <div id="output"></div>
      <script>
        const output = document.getElementById('output');
        const source = new EventSource('/events');
        source.onmessage = function(event) {
          const div = document.createElement('div');
          div.textContent = event.data;
          output.appendChild(div);
        };
        source.onerror = function() {
          const div = document.createElement('div');
          div.style.color = 'red';
          div.textContent = '❌ Connection error';
          output.appendChild(div);
        };
      </script>
    </body>
    </html>
  `);
});

const sslOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

// Start HTTPS server
https.createServer(sslOptions, app).listen(8080, () => {
  console.log('🚀 HTTPS Server running at https://localhost:8080');
});