/**
 * Root folder of static server.
 *
 * @type {String}
 */
global.serverRoot = 'public';
/**
 * Port used by static server.
 *
 * @type {Number}
 */
global.serverPort = 3000;
/**
 * Port used by binary socket server.
 *
 * @type {Number}
 */
global.binaryServerPort = 9001;

/**
 *  - server.js: serving static files inside `serverRoot` on port `serverPort`
 *  - binary-server.js: binary socket server used to upload audio files
 */
require('./modules/server.js');
require('./modules/binary-server.js');
