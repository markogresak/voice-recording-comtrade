#!/bin/bash

#
# DO NOT EXECUTE THIS SCRIPT SERVER IS RUNNING, THE SERVER WILL CRASH
#

# store path at execution
execDir=$(pwd)
# store path of the script
scriptsDir=$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)

# go to scripts directory, where this file is located
cd $scriptsDir

# remove everything in uploads (server will create it again)
if [[ -d '../uploads' ]]; then
  # remove any previous folders
  if [[ -f '../uploads.tar.gz' ]]; then
    rm ../uploads.tar.gz
  fi
  # compress uploads folder
  echo 'Compressing...'
  tar --exclude='*INDEX*' -zcvf ../uploads.tar.gz ../uploads
else
  echo 'Nothing to compress...'
fi

# go back to directory where execution started
cd $execDir
