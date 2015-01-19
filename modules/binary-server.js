var https = require('https'),
    BinaryServer = require('binaryjs').BinaryServer,
    wav = require('wav'),
    fm = require('./file-manager.js'),
    fs = require('fs');


// Read and parse config file, path should be set in app.js.
var sslConfigString = fs.readFileSync(global.sslConfigFile).toString();
var sslConfig = JSON.parse(sslConfigString);

// Throw error if options are not set correctly.
if(!sslConfig || !sslConfig.key || !sslConfig.cert) {
  throw Error('Failed to read SSL options.');
}

// Read SSL files using values from config.
var sslOptions = {
  key: fs.readFileSync(sslConfig.key),
  cert: fs.readFileSync(sslConfig.cert)
};

/**
 * Https server using `sslOptions` from sslConfig.json,
 * on port `global.binaryServerPort`.
 *
 * @type {HttpsServer}
 */
var httpsServer = https.createServer(sslOptions, function(req, res) {
  'use strict';
  // GET request, send head 200 and a generic message.
  res.writeHead(200);
  res.end('Web Socket Server\n');
}).listen(global.binaryServerPort);

/**
 * Initialize new BinaryServer using `httpsServer`.
 *
 * @type {BinaryServer}
 */
var binaryServer = new BinaryServer({server: httpsServer});

// Event on new client conenction.
binaryServer.on('connection', function(client) {
  'use strict';

  /**
   * Wav file writer, uses file with next available index.
   * Name should use pattern: {uploadsPath}/{baseName}-{nextIndex()}.{extension}
   *
   * @type {wav}
   */
  var filePath = fm.nextFilePath('sound', 'wav');
  var fileWriter = new wav.FileWriter(filePath, {
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  });

  // Event on data recieved.
  client.on('stream', function(stream) {
    console.log('new stream: ' + filePath);

    stream.pipe(fileWriter);

    // Event on stream closed.
    stream.on('end', function() {
      fileWriter.end();
      console.log('--- end stream: ' + filePath);
    });
  });
});
