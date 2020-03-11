FROM certbot/certbot:v1.3.0
MAINTAINER vdhpieter <vdhpieter@outlook.com>

RUN apk update && apk add docker bash coreutils grep

ADD start.sh /bin/start.sh

ENTRYPOINT [ "/bin/bash", "/bin/start.sh" ]
