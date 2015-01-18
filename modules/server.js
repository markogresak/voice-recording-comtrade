/**
 * Start connect server, serve files inside `global.serverRoot`
 * and listen on port `global.serverPort`.
 */
require('connect')()
  .use(require('serve-static')(global.serverRoot))
  .listen(global.serverPort);

/**
 * Log server starting information.
 */
console.log('Listening on ' + global.serverPort + ' ...');
console.log('Press Ctrl + C to stop.');

