var fs = require('fs');

var dir = './uploads';
var indexFile = dir + '/INDEX';
var initialIndex = 10000;

/**
 * Read index value from file.
 *
 * @return {Number} Current index value.
 */
function getIndex() {
  'use strict';
  var value;
  try {
    // Read value from file and parse it.
    value = parseInt(fs.readFileSync(indexFile).toString());
  }
  catch (e) {
    value = 0;
  }
  return value || 0;
}

/**
 * Write new value to index file.
 *
 * @param {Number} index New index value.
 * @return {Number} Set index value (for convenience).
 */
function setIndex(index) {
  'use strict';
  fs.writeFileSync(indexFile, index);
  return index;
}

/**
 * Return next available index.
 * Reads index value and increses it by 1, then sets the incresed value.
 *
 * @return {Number} Get next available index.
 */
function nextIndex() {
  'use strict';
  return setIndex(getIndex() + 1);
}

/**
 * Returns file path with added folder, next available index and extension.
 * File name has following template:
 *   {uploadsPath}/{baseName}-{nextIndex()}.{extension}
 *
 * @param  {String} baseName  Base name of file.
 * @param  {String} extension Extension of file.
 *
 * @return {String}           Full path to next available file name.
 */
function nextFilePath(baseName, extension) {
  'use strict';
  var path = dir + '/' + baseName + '-' + nextIndex() + '.' + extension;
  // If path exists, try next index.
  if(fs.existsSync(path)) {
    return nextFilePath(baseName, extension);
  }
  return path;
}

/**
 * Synchronously init uploads dir and index file.
 * Creates ./uploads dir and ./uploads/index file, if they don't exist.
 * It's called immediately upon creation.
 */
(function init() {
  'use strict';
  // Create `dir` if it doesn't exist.
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
  }
  var doNotChangeFile = dir + '/DO_NOT_CHANGE_INDEX';
  if(!fs.existsSync(doNotChangeFile)) {
    fs.writeFile(doNotChangeFile, 'Please don\'t change or remove INDEX file.');
  }
  // Create and init `indexFile` if it doesn't exist.
  if(!fs.existsSync(indexFile)) {
    setIndex(initialIndex);
  }
  // If `indexFile` exists, we still have to check if it contains correct value.
  else {
    try {
      var index = getIndex();
      // If index is a false value, not of type number or
      // less than `initialIndex` value, throw an error.
      if(!index || typeof index !== 'number' || index < initialIndex) {
        throw 'Incorrect index';
      }
    }
    catch (e) {
      // If an error occured (including our), set index to initial value.
      setIndex(initialIndex);
    }
  }
})();

/**
 * Exporting `getIndex`, `setIndex` and `nextIndex`.
 *
 * @type {Object}
 */
module.exports = {
  nextFilePath: nextFilePath
};
