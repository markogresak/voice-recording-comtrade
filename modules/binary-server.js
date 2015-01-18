var BinaryServer = require('binaryjs').BinaryServer,
    wav = require('wav'),
    fm = require('./file-manager.js');

/**
 * Initialize new BinaryServer on port `global.binaryServerPort`.
 *
 * @type {BinaryServer}
 */
var binaryServer = new BinaryServer({ port: global.binaryServerPort });

binaryServer.on('connection', function(client) {
  'use strict';

  /**
   * Wav file writer, uses file with next available index.
   * Name should use pattern: {uploadsPath}/{baseName}-{nextIndex()}.{extension}
   *
   * @type {wav}
   */
  var fileWriter = new wav.FileWriter(fm.nextFilePath('sound', 'wav'), {
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  });

  client.on('stream', function(stream) {
    stream.pipe(fileWriter);

    stream.on('end', function() {
      fileWriter.end();
    });
  });
});
