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
     * [Private] Recorder media stream, set when `getMediaSuccess` is called.
     *
     * @type {LocalMediaStream}
     */
    var _recorderMediaStream = null;

    /**
     * Promise for initialization of SrAudioContext.
     *
     * @type {Promise}
     */
    var recorderPromise = function() {
      return new Promise(function(resolve, reject) {
        /**
         * If `navigator.getUserMedia` is not defined, sets a fallback value.
         */
        function initGetUserMedia() {
          if (!navigator.getUserMedia) {
            navigator.getUserMedia =  navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;
          }
        }

        /**
         * Success event handler for `navigator.getUserMedia`.
         *
         * @param  {Event} e Data sent by `navigator.getUserMedia` on success.
         */
        function getMediaSuccess(mediaStream) {
          // Initialize `AudioContext` or use fallback value.
          var SrAudioContext = window.AudioContext || window.webkitAudioContext;
          var context = new SrAudioContext();
          // The sample rate is in `context.sampleRate`.
          var audioInput = context.createMediaStreamSource(mediaStream);
          // Set global recorder media stream.
          _recorderMediaStream = mediaStream;
          var bufferSize = 2048;
          // New recorder using bufferSize and single input and output channel.
          var recorder = context.createScriptProcessor(bufferSize, 1, 1);

          // Connect the recorder to `audioInput`.
          audioInput.connect(recorder);
          // Set the destination of audio context.
          recorder.connect(context.destination);
          // Resolve the promise, passing the recorder object.
          resolve(recorder);
        }

        /**
         * Error event handler for `navigator.getUserMedia`.
         *
         * @param  {Event} e Event sent when error occurs.
         */
        function getMediaErr(e) {
          // Error event handler.
          console.log('Error capturing audio.');
          console.log(e);
          // Reject the promise with error `e`.
          reject(e);
        }

        /**
         * Initializes SrAudioContext, if it's available in current browser.
         */
        (function initAudioContext() {
          // Set fallback value to `navigator.getUserMedia` if it's not defined.
          initGetUserMedia();

          if (navigator.getUserMedia) {
            // If `navigator.getUserMedia` is defined, start audio capture.
            navigator.getUserMedia({audio: true}, getMediaSuccess, getMediaErr);
          }
          else {
            // `navigator.getUserMedia` isn't defined, unable to capture audio.
            console.log('getUserMedia not supported in this browser.');
            alert('Unable to use audio recorder.');
            // Reject the promise with error.
            reject(Error('getUserMedia not supported in this browser.'));
          }
        })();
      });
    };

    /**
     * [private] Reference to BinaryClient.
     *
     * @type {BinaryClient}
     */
    var clientPromise;

    /**
     * [private] handler function for client.open event.
     * Defined globally to be used in both `start` and `stop`.
     */
    var clientOpenHandler;

    var Public = {

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

        //Start new WebSockets client on current server, at port 9001
        clientPromise = new Promise(function(resolve, reject) {
          try {
            resolve(new BinaryClient('wss://' + location.hostname + ':9001'));
          }
          catch (e) {
            reject(e);
          }
        });

        // Set reference of this (since functions override `this`).
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
        clientOpenHandler = function () {
          // Use `initRecorder` promise.
          // Runs the promise here, not as soon as the page is opened.
          recorderPromise()
            .then(function(recorder) {
            // Set handler when audio data is recieved.
            recorder.onaudioprocess = writeAudioToStream;
          }, function(err) {
            console.log('Error:', err);
          });
        };

        clientPromise
          .then(function(client) {
            // Register event listener when WebSocket opens.
            client.on('open', function() {
              // Set recording flag to true and initialize stream object.
              _this.stream = client.createStream();
              _this.recording = true;
              clientOpenHandler();
            });
          }, function(err) {
            console.log('Error:', err);
        });
      },

      /**
       * Stop the recorder.
       * Sets recording flag to false and ends the stream.
       */
      stop: function() {
        this.recording = false;
        if(this.stream) {
          this.stream.end();
          clientPromise
            .then(function(client) {
              client.off('open', clientOpenHandler);
              if(_recorderMediaStream) {
                _recorderMediaStream.stop();
                _recorderMediaStream = null;
              }
            }, function(err) {
              console.log('Error:', err);
          });
        }
      }
    };

    return Public;
  }());

  var soundRecorderInstance = null;

  /**
   * Function used to create new recorder instance,
   * start recording and storing data to the server.
   *
   * @type {Function}
   */
  var startRecordingFunction = function() {
    // Create new instance and start only if it doesn't already exist.
    if(!soundRecorderInstance) {
      soundRecorderInstance = Object.create(SoundRecorder);
      soundRecorderInstance.start();
    }
  };

  /**
   * Function used to stop recording, finalize
   * the server stream and destroy object.
   *
   * @type {Function}
   */
  var stopRecordingFunction = function() {
    // Stop recording and delete instance only if it exists.
    if(soundRecorderInstance) {
      soundRecorderInstance.stop();
      soundRecorderInstance = null;
    }
  };

  // Register global functions and events.
  window.startRecording = startRecordingFunction;
  window.stopRecording = stopRecordingFunction;
  window.addEventListener('beforeunload', stopRecordingFunction , false);
})(this);
