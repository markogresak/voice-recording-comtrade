var BinaryServer = require('binaryjs').BinaryServer;
var wav = require('wav');

var binaryServer = new BinaryServer({port: 9001});

binaryServer.on('connection', function(client) {
  'use strict';

  console.log('new connection');

  var fileWriter = new wav.FileWriter('demo2.wav', {
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  });

  client.on('stream', function(stream) {
    console.log('new stream');
    stream.pipe(fileWriter);

    stream.on('end', function() {
      fileWriter.end();
    });
  });
});
