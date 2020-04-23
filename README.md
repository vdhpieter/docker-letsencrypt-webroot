# Let’s Encrypt (webroot) in a Docker
![Letsencrypt Logo](https://letsencrypt.org/images/letsencrypt-logo-horizontal.svg)

Letsencrypt cert auto getting and renewal script based on [certbot](https://hub.docker.com/r/certbot/certbot/) base image.

  - [GitHub](https://github.com/vdhpieter/docker-letsencrypt-webroot)
  - [DockerHub](https://hub.docker.com/r/vdhpieter/letsencrypt-webroot/)

## Contribute

I took over this project from [@kvaps](https://github.com/kvaps). I'm not a docker or open source expert but will do all I can to look at issues & PR's. Help is greatly appreciated!

## Usage

* First, you need to set up your web server so that it gave the contents of the `/.well-known/acme-challenge` directory properly.
  Example, for nginx add location for your server:
```nginx
    location '/.well-known/acme-challenge' {
        default_type "text/plain";
        root        /tmp/letsencrypt;
    }
```
* Then run your web server image with letsencrypt-webroot connected volumes:
```bash
   -v /data/letsencrypt:/etc/letsencrypt
   -v /data/letsencrypt-www:/tmp/letsencrypt
```
* Run letsencrypt-webroot image:
```bash
   docker run \
     --name some-letsencrypt \
     -v /data/letsencrypt:/etc/letsencrypt \
     -v /data/letsencrypt-www:/tmp/letsencrypt \
     -e 'DOMAINS=example.com www.example.com' \
     -e 'EMAIL=your@email.tld' \
     -e 'WEBROOT_PATH=/tmp/letsencrypt' \
     vdhpieter/letsencrypt-webroot
```

* Configure your app to use certificates in the following path:

  * **Private key**: `/etc/letsencrypt/live/example.com/privkey.pem`
  * **Certificate**: `/etc/letsencrypt/live/example.com/cert.pem`
  * **Intermediates**: `/etc/letsencrypt/live/example.com/chain.pem`
  * **Certificate + intermediates**: `/etc/letsencrypt/live/example.com/fullchain.pem`

**NOTE**: You should connect `/etc/letsencrypt` directory fully, because if you connect just `/etc/letsencrypt/live`, then symlinks to your certificates inside it will not work!

## Renew hook

You can also assign hook for your container, it will be launched after letsencrypt receive a new certificate.

* This feature requires a passthrough docker.sock into letsencrypt container: `-v /var/run/docker.sock:/var/run/docker.sock`
* Also add `--link` to your container. Example: `--link some-nginx`
* Then add `LE_RENEW_HOOK` environment variable to your container:

Example hooks:
  - nginx reload: `-e 'LE_RENEW_HOOK=docker kill -s HUP @CONTAINER_NAME@'`
  - container restart: `-e 'LE_RENEW_HOOK=docker restart @CONTAINER_NAME@'`

For more detailed example, see the docker-compose configuration

## Docker-compose

This is example of letsencrypt-webroot with nginx configuration:

`docker-compose.yml`
```yaml
nginx:
  restart: always
  image: nginx
  hostname: example.com
  volumes:
    - /etc/localtime:/etc/localtime:ro
    - ./nginx:/etc/nginx:ro
    - ./letsencrypt/conf:/etc/letsencrypt
    - ./letsencrypt/html:/tmp/letsencrypt
  ports:
    - 80:80
    - 443:443
  environment:
    - LE_RENEW_HOOK=docker kill -s HUP @CONTAINER_NAME@

letsencrypt:
  restart: always
  image: vdhpieter/letsencrypt-webroot
  volumes:
    - /etc/localtime:/etc/localtime:ro
    - /var/run/docker.sock:/var/run/docker.sock
    - ./letsencrypt/conf:/etc/letsencrypt
    - ./letsencrypt/html:/tmp/letsencrypt
  links:
    - nginx
  environment:
    - DOMAINS=example.com www.example.com
    - EMAIL=your@email.tld
    - WEBROOT_PATH=/tmp/letsencrypt
    - EXP_LIMIT=30
    - CHECK_FREQ=30
    - CHICKENEGG=1
    - STAGING=0
```

## Once run

You also can run it with once mode, just add `once` in your docker command.
With this option a container will exited right after certificates update.

## Environment variables

* **DOMAINS**: Domains for your certificate. Example to `example.com www.example.com`.
* **EMAIL**: Email for urgent notices and lost key recovery. Example to `your@email.tld`.
* **WEBROOT_PATH** Path to the letsencrypt directory in the web server for checks. Example to `/tmp/letsencrypt`.
* **CHOWN** Owner for certs. Defaults to `root:root`.
* **CHMOD** Permissions for certs. Defaults to `644`.
* **EXP_LIMIT** The number of days before expiration of the certificate before request another one. Defaults to `30`.
* **CHECK_FREQ**: The number of days how often to perform checks. Defaults to `30`.
* **CHICKENEGG**: Set this to 1 to generate a self signed certificate before attempting to start the process with no previous certificate. Some http servers (nginx) might not start up without a certificate file present. Defaults to `1`.
* **STAGING**: Set this to 1 to use the staging environment of letsencrypt to prevent rate limiting while working on your setup. Defaults to `0`.
