var https = require('https'),
    connect = require('connect'),
    serveStatic = require('serve-static'),
    fs = require('fs');

/**
 * Start connect server, serve files inside `global.serverRoot`
 * and listen on port `global.serverPort`.
 */
var app = connect();
app.use(serveStatic(global.serverRoot));
// app.listen(global.serverPort);

// Read and parse config file, path should be set in app.js.
var sslOptionsString = fs.readFileSync(global.sslOptionsFile).toString();
var sslOptions = JSON.parse(sslOptionsString);

// Throw error if options are not set correctly.
if(!sslOptions || !sslOptions.key || !sslOptions.cert) {
  throw Error('Failed to read SSL options.');
}

https.createServer(sslOptions, app)
  .listen(global.serverPort, function() {
    'use strict';
    // Log server starting information.
    console.log('Listening on ' + global.serverPort + ' ...');
    console.log('Press Ctrl + C to stop.');
  });
