var fs = require('fs');

// Read and parse config file, path should be set in app.js.
var sslConfigString = fs.readFileSync(global.sslConfigFile).toString();
var sslConfig = JSON.parse(sslConfigString);

// Throw error if options are not set correctly.
if(!sslConfig || !sslConfig.key || !sslConfig.cert) {
  throw Error('Failed to read SSL options.');
}

// Read SSL files using values from config.
module.exports = {
  key: fs.readFileSync(sslConfig.key),
  cert: fs.readFileSync(sslConfig.cert)
};
