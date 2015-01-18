/* global BinaryClient */

(function(window) {
  'use strict';

  /**
   * Start new WebSockets client on current server, at port 9001
   *
   * @type {BinaryClient}
   */
  var client = new BinaryClient('ws://' + location.hostname + ':9001');
  /**
   * Current recording state.
   *
   * @type {Boolean}
   */
  var recording = false;
  /**
   * BinaryClient stream object.
   *
   * @type {BinaryClient.Stream}
   */
  var Stream = null;

  /**
   * If `navigator.getUserMedia` is not defined, sets a fallback value.
   */
  function initGetUserMedia() {
    var n = navigator;
    if (!n.getUserMedia) {
      n.getUserMedia = n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia;
    }
  }

  /**
   * Converts Float32Array audio stream to Int16Array.
   *
   * @param  {Float32Array} buffer Buffer returned by audioInput.
   *
   * @return {Int16Array}          Input buffer converted to 16-bit int array.
   */
  function convertFloat32ToInt16(buffer) {
    var l = buffer.length;
    var buf = new Int16Array(l);

    while (l--) {
      buf[l] = buffer[l] * 0xFFFF; // convert to 16 bit
    }
    return buf.buffer;
  }

  /**
   * Event handler of `recorder.onaudioprocess`, writes input audio to `Stream`.
   *
   * @param  {Event} e Data recieved by `recorder`
   */
  function writeAudioToStream(e) {
    // If `recording` flag is not set, don't save any data.
    if (!recording) {
      return;
    }
    // Read buffered data from left channel (mono).
    var left = e.inputBuffer.getChannelData(0);
    // Convert input buffer to 16-bit int and write it to stream.
    Stream.write(convertFloat32ToInt16(left));
  }

  /**
   * Success event handler for `navigator.getUserMedia`.
   *
   * @param  {Event} e Data sent by `navigator.getUserMedia` on success.
   */
  function getMediaSuccess(e) {
    // Initialize `AudioContext` or use fallback value.
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    // The sample rate is in `context.sampleRate`.
    var audioInput = context.createMediaStreamSource(e);
    var bufferSize = 2048;
    // New recorder using bufferSize and a single input and output channel.
    var recorder = context.createScriptProcessor(bufferSize, 1, 1);

    // Set handler when audio data is recieved.
    recorder.onaudioprocess = writeAudioToStream;
    // Connect the recorder to `audioInput`.
    audioInput.connect(recorder);
    // Set the destination of audio context.
    recorder.connect(context.destination);
  }

  /**
   * Error event handler for `navigator.getUserMedia`.
   *
   * @param  {Event} e Event sent by `navigator.getUserMedia` when error occurs.
   */
  function getMediaError(e) {
    // Error event handler.
    console.log('Error capturing audio.');
    console.log(e);
  }

  // Event listener when WebSocket opens.
  client.on('open', function() {
    // Set fallback value to `navigator.getUserMedia` if it's not defined.
    initGetUserMedia();

    if (navigator.getUserMedia) {
      // If `navigator.getUserMedia` is defined, start audio capture.
      navigator.getUserMedia({audio: true}, getMediaSuccess, getMediaError);
    }
    else {
      // Object `navigator.getUserMedia` isn't defined, unable to capture audio.
      console.log('getUserMedia not supported in this browser.');
      alert('Unable to use audio recorder.');
    }
  });

  window.startRecording = function() {
    // Create new client stream and set recording flag to true.
    Stream = client.createStream();
    recording = true;
  };

  window.stopRecording = function() {
    // Set recording flag to false and end the stream.
    recording = false;
    Stream.end();
  };
})(this);
