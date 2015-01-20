#!/bin/bash

# Path to config file.
configPath='../sslConfig.json'

# Go to scripts directory, where this file is located.
cd $(dirname $0)

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

# Reads a value from stdin until it ends with given extension.
#
# @param  {String} $1 Prompt text for read command.
# @param  {String} $2 Expected extension of entered value.
# @return {String}    Entered value.
#
function readValue {
  # Set val as local varaible.
  local val
  # Infinite loop, stops when user enters expected value.
  while true; do
    # Read `val`, output prompt text passed in argument $1.
    read -p "$1" val
    # If entered `val` ends with argument $2, return `val` and stop the loop.
    if [[ "$val" == *"$2" ]]; then
      echo $val
      break
    fi
    # Print error message, redirect it to stderr.
    >&2 echo "  Error: File must end with $2"
  done
}

if [[ -z $1 && -z $1 ]]; then
  # Read path to .key and .crt files.
  serverKey=$(readValue 'Enter path to .key file: ' '.key')
  serverCrt=$(readValue 'Enter path to .crt file: ' '.crt')
else
  serverKey="$1"
  serverCrt="$2"
fi

# Store json config to string.
configFile="{
  \"key\": \"$serverKey\",
  \"cert\": \"$serverCrt\"
}"

# Output created config.
echo 'Created config:'
echo "$configFile"

# Infinite loop, stops when user enters y or n (case insensitive).
while true; do
    # Read a single character from stdin.
    read -sn 1 -p "Is config correct? [y/n]" yn
    case $yn in
        [Yy]* )
          # Config is correct, store it to `$configPath`,
          # output absolute path to config and break the loop.
          echo "$configFile" > "$configPath"
          echo -e "\nConfig saved to $(absPath "$configPath")"
          break ;;
        [Nn]* )
          # Config is incorrect, break the loop.
          break ;;
        * )
          # User pressed incorrect key.
          echo "Please answer with y/n." ;;
    esac
done

# Go back to directory where execution started.
cd "$OLDPWD"
