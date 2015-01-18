/* global BinaryClient */

(function(window) {
  'use strict';
  var client = new BinaryClient('ws://localhost:9001');

  client.on('open', function() {
    window.Stream = client.createStream();

    if (!navigator.getUserMedia) {
      navigator.getUserMedia =  navigator.getUserMedia ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia ||
                                navigator.msGetUserMedia;
    }

    function convertoFloat32ToInt16(buffer) {
      var l = buffer.length;
      var buf = new Int16Array(l);

      while (l--) {
        buf[l] = buffer[l] * 0xFFFF; //convert to 16 bit
      }
      return buf.buffer;
    }

    function success(e) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      var context = new AudioContext();

      // the sample rate is in context.sampleRate
      var audioInput = context.createMediaStreamSource(e);

      var bufferSize = 2048;
      var recorder = context.createScriptProcessor(bufferSize, 1, 1);

      recorder.onaudioprocess = function(e) {
        if (!recording) {
          return;
        }
        console.log('recording');
        var left = e.inputBuffer.getChannelData(0);
        window.Stream.write(convertoFloat32ToInt16(left));
      };

      audioInput.connect(recorder);
      recorder.connect(context.destination);
    }

    if (navigator.getUserMedia) {
      navigator.getUserMedia({ audio: true }, success, function(e) {
        console.log('Error capturing audio.');
        console.log(e);
      });
    }
    else {
      console.log('getUserMedia not supported in this browser.');
    }

    var recording = false;

    window.startRecording = function() {
      recording = true;
    };

    window.stopRecording = function() {
      recording = false;
      window.Stream.end();
    };
  });
})(this);
