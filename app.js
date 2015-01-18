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
global.serverPort = 9876;
/**
 * Port used by binary socket server.
 *
 * @type {Number}
 */
global.binaryServerPort = 9001;
/**
 * Path to file containing SSL config.
 *
 * @type {String}
 */
global.sslConfigFile = 'sslConfig.json';

/**
 *  - server.js: serving static files inside `serverRoot` on port `serverPort`
 *  - binary-server.js: binary socket server used to upload audio files
 */
require('./modules/server.js');
require('./modules/binary-server.js');
