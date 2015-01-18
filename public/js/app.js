/* global BinaryClient */

(function(window) {
  'use strict';

  var SoundRecorder = (function() {

    /**
     * Converts Float32Array audio stream to Int16Array.
     *
     * @param  {Float32Array} buffer Buffer returned by audioInput.
     *
     * @return {Int16Array}          Buffer converted to 16-bit int array.
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
     * Promise for initialization of SrAudioContext.
     *
     * @type {Promise}
     */
    var initRecorder = new Promise(function(resolve, reject) {
      /**
       * If `navigator.getUserMedia` is not defined, sets a fallback value.
       */
      function initGetUserMedia() {
        var n = navigator;
        if (!n.getUserMedia) {
          n.getUserMedia =  n.webkitGetUserMedia ||
                            n.mozGetUserMedia ||
                            n.msGetUserMedia;
        }
      }

      /**
       * Success event handler for `navigator.getUserMedia`.
       *
       * @param  {Event} e Data sent by `navigator.getUserMedia` on success.
       */
      function getMediaSuccess(e) {
        // Initialize `AudioContext` or use fallback value.
        var SrAudioContext = window.AudioContext || window.webkitAudioContext;
        var context = new SrAudioContext();
        // The sample rate is in `context.sampleRate`.
        var audioInput = context.createMediaStreamSource(e);
        var bufferSize = 2048;
        // New recorder using bufferSize and single input and output channel.
        var recorder = context.createScriptProcessor(bufferSize, 1, 1);

        // Connect the recorder to `audioInput`.
        audioInput.connect(recorder);
        // Set the destination of audio context.
        recorder.connect(context.destination);
        resolve(recorder);
      }

      /**
       * Error event handler for `navigator.getUserMedia`.
       *
       * @param  {Event} e Event sent when error occurs.
       */
      function getMediaError(e) {
        // Error event handler.
        console.log('Error capturing audio.');
        console.log(e);
        reject(e);
      }

      /**
       * Initializes SrAudioContext, if it's available in current browser.
       */
      function initAudioContext() {
        // Set fallback value to `navigator.getUserMedia` if it's not defined.
        initGetUserMedia();

        if (navigator.getUserMedia) {
          // If `navigator.getUserMedia` is defined, start audio capture.
          navigator.getUserMedia({audio: true}, getMediaSuccess, getMediaError);
        }
        else {
          // `navigator.getUserMedia` isn't defined, unable to capture audio.
          console.log('getUserMedia not supported in this browser.');
          alert('Unable to use audio recorder.');
          reject(Error('getUserMedia not supported in this browser.'));
        }
      }

      initAudioContext();
    });

    var PublicModule = {
      /**
       * Current recording state.
       *
       * @type {Boolean}
       */
      recording: false,
      /**
       * BinaryClient stream object.
       *
       * @type {BinaryClient.Stream}
       */
      stream: null,
      /**
       * Start the recorder.
       * Initializes and starts recording.
       */
      start: function() {
        /**
         * Start new WebSockets client on current server, at port 9001
         *
         * @type {BinaryClient}
         */
        var client = new BinaryClient('ws://' + location.hostname + ':9001');
        var _this = this;

        /**
         * Handler of `recorder.onaudioprocess`, writes input audio to `Stream`.
         *
         * @param  {Event} e Data recieved by `recorder`
         */
        function writeAudioToStream(e) {
          // If `recording` flag is not set, don't save any data.
          if (!_this.recording) {
            return;
          }
          // Read buffered data from left channel (mono).
          var left = e.inputBuffer.getChannelData(0);
          // Convert input buffer to 16-bit int and write it to stream.
          _this.stream.write(convertFloat32ToInt16(left));
        }

        /**
         * Handler for BinaryClient socket open event.
         */
        function openHandler() {
          // Use `initRecorder` promise.
          initRecorder
            .then(function(recorder) {
            // Set handler when audio data is recieved.
            recorder.onaudioprocess = writeAudioToStream;
          }, function(err) {
            console.log('Error:', err);
          });
        }

        // Set recording flag to true and initialize stream object.
        _this.recording = true;
        _this.stream = client.createStream();
        // Register event listener when WebSocket opens.
        client.on('open', openHandler);
      },
      /**
       * Stop the recorder.
       * Sets recording flag to false and ends the stream.
       */
      stop: function() {
        this.recording = false;
        if(this.stream) {
          this.stream.end();
        }
      }
    };

    return PublicModule;
  }());

  var soundRecorderInstance = null;
  window.startRecording = function() {
    // Create new instance and start only if it doesn't already exist.
    if(!soundRecorderInstance) {
      soundRecorderInstance = Object.create(SoundRecorder);
      soundRecorderInstance.start();
    }
  };

  window.stopRecording = function() {
    // Stop recording and delete instance only if it exists.
    if(soundRecorderInstance) {
      soundRecorderInstance.stop();
      soundRecorderInstance = null;
    }
  };
})(this);
