# DOCKER-VERSION 1.1.2

FROM ubuntu:12.04

RUN apt-get update
RUN apt-get install -y git-core nginx zip curl build-essential openssl libssl-dev python-software-properties openssh-server supervisor

RUN add-apt-repository ppa:chris-lea/node.js-devel
RUN apt-get update
RUN apt-get install -y nodejs

# https://docs.docker.com/articles/using_supervisord/
RUN mkdir -p /var/run/sshd
RUN mkdir -p /var/log/supervisor
ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install and run server
ADD . /var/www
RUN cd /var/www && npm install --production

# Configure nginx
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

EXPOSE 80 443 22 10000

#CMD ["/usr/bin/supervisord"]
CMD cd /var/www && NODE_ENV=production NODE_PATH=./ node --harmony ./server.js
