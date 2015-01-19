var https = require('https'),
    connect = require('connect'),
    serveStatic = require('serve-static');

/**
 * Start connect server, serve files inside `global.serverRoot`
 * and listen on port `global.serverPort`.
 */
var app = connect();
app.use(serveStatic(global.serverRoot));
// app.listen(global.serverPort);

// Start https server with `sslOptions` and connect config on `serverPort`.
https.createServer(global.sslOptions, app)
  .listen(global.serverPort, function() {
    'use strict';
    // Log server starting information.
    console.log('Listening on ' + global.serverPort + ' ...');
    console.log('Press Ctrl + C to stop.');
  });
