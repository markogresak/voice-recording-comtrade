## Generating self-signed SSL key and certificate:

Make sure `openssl` is installed. Try `openssl version`.

#### Generate a Private Key

    # Generating server.key, enter password and remember it
    $ openssl genrsa -des3 -out server.key 1024

#### Generate a CSR

    # Generate server.csr, follow instructions ([] are optional values)
    $ openssl req -new -key server.key -out server.csr

#### Remove Passphrase from Key

    $ cp server.key server.key.org && openssl rsa -in server.key.org -out server.key

#### Generating a Self-Signed Certificate

    $ openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

#### Create `sslConfig.json` config file in project root

Use script [`scripts/create-ssl-config.sh`](./scripts/create-ssl-config.sh) to create config file. Entered paths can be absolute, or relative to project root.

Example output:

    {
      "key": "/path/to/server.key",
      "cert": "/path/to/server.crt"
    }
