var https = require('https'),
    BinaryServer = require('binaryjs').BinaryServer,
    wav = require('wav'),
    fm = require('./file-manager.js');

/**
 * Https server using `sslOptions` from sslConfig.json,
 * on port `global.binaryServerPort`.
 *
 * @type {HttpsServer}
 */
var httpsServer = https.createServer(global.sslOptions, function(req, res) {
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
