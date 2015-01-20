#!/bin/bash

# Base name of
baseName="server"

# Check for errors if last command returned 1.
# Bash's $? (last return code) is used to check for errors.
# If error occured, script will exit with status code 1.
#
function checkError {
  # If last return code isn't 0, exit with error.
  if [[ $? != 0 ]]; then
    echo >&2 "Error occured with last command. Aborting."
    exit 1
  fi
}

# Resolves relative path to absolute.
#
# @param  {String} $1 Relative path of a file/directory.
# @return {String}    Resolved absolute path.
#
function absPath {
    # Go to dirname of given path.
    cd "$(dirname "$1")"
    # Print (return) absolute path (pwd) and basename of given path.
    printf "%s/%s\n" "$(pwd)" "$(basename "$1")"
    # Go back to where script was before. $OLDPWD is managed by bash.
    cd "$OLDPWD"
}

# Check for `openssl` command, exit with error if it's not installed.
type openssl >/dev/null 2>&1 || {
  echo >&2 "Command openssl required but it's not installed. Aborting."
  exit 1
}

# Store path where script was executed.
execDir=$(pwd)
# Store path where this script is located.
scriptsDir=$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)

# Read path to where store store certificate.
echo -e "Enter path to folder where certificate will be stored,
  path can be absolute or relative to current folder.
  If the path doesn't exist, it will be created for you."
read -p "Enter path: " certPath

# If $certPath directory doesn't exist, create it.
if [[ ! -d "$certPath" ]]; then
  echo "Path $certPath doesn't exist, createing it..."
  # Make full path and creck for errors.
  mkdir -p "$certPath"
  checkError
fi

# Go to $certPath directory, check for errors.
cd "$certPath"
checkError

# All certificate related files are generated inside $certPath.
# $baseName is used as name of the files, according extension is added.

# Generating private key, check for error.
# User should be asked to enter and confirm private key password.
echo -e "\nGenerating a private key '$baseName.key':\n"
openssl genrsa -des3 -out "$baseName.key" 1024
checkError

# Generating csr file using private key.
# User should be asked to enter:
#  - 2 letter country code
#  - state or province name, can be left blank
#  - city name, can be left blank
#  - organization name, enter anything
#  - organizational unit name, can be left blank
#  - common name, can be left blank
#  - email address, can be left blank
#  - extra attributes (challenge password, company name), can be left blank
echo -e "\nGenerating a CSR '$baseName.csr':\n"
echo -e "Fields ending in [] are optional and can be blank.\nLeave 'extra' attributes blank."
openssl req -new -key "$baseName.key" -out "$baseName.csr"
checkError

# Generating private key with removed password.
# User should be asked to enter $baseName.key.org password,
# which is the password entered when generating the private key.
echo -e "\nRemoving passphrase from key '$baseName.key':\n"
echo "Expecting password enter at 'generating private key' stage."
cp "$baseName.key" "$baseName.key.org" && openssl rsa -in "$baseName.key.org" -out "$baseName.key"
checkError

# Generating self-signed certificate.
# Certificate is generated using $baseName.key and $baseName.csr files,
# output is $baseName.crt file, self-signed certificate lasting 1 year.
echo -e "\nGenerating a self-signed certificate '$baseName.crt':\n"
openssl x509 -req -days 365 -in "$baseName.csr" -signkey "$baseName.key" -out "$baseName.crt"
checkError

# Go to directory where script is located.
cd "$scriptsDir"

# Generate sslConfig.json file, used by server.
echo -e "\nGenerating a config file:\n"
# Execute script `./create-ssl-config.sh`, passing
# absolute paths to .key and .crt files.
bash ./create-ssl-config.sh $(absPath "./$baseName.key") $(absPath "./$baseName.crt")
checkError

# Go back to directory where execution started.
cd "$execDir"
