# Voice recording

## Generating self-signed SSL key and certificate

Server requires SSL certificate so it can accept https requests.

Run script [`./scripts/generate-ssl-certificate.sh`](./scripts/generate-ssl-certificate.sh) and follow on-screen instructions.

Or follow instructions in [generating certificate](./docs/generating-certificate.md) documentation instead.

## Installing

#### Install `npm` dependancies:

    npm install

#### Start the server:

    npm start

Notes:

 - make sure `node` has read and write permissions, if it doesn't work, try `sudo npm start`
