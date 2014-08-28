# DOCKER-VERSION 1.1.2

FROM ubuntu:14.04

RUN apt-get update
RUN apt-get install -y software-properties-common git-core nginx curl
RUN apt-get install -y zip openssl libssl-dev openssh-server supervisor

RUN add-apt-repository ppa:chris-lea/node.js-devel
RUN apt-get update
RUN apt-get install -y nodejs

# https://docs.docker.com/articles/using_supervisord/
RUN mkdir -p /var/run/sshd
RUN mkdir -p /var/log/supervisor
RUN mkdir -p /var/www

ADD package.json /var/www/package.json
ADD npm-shrinkwrap.json /var/www/npm-shrinkwrap.json
RUN cd /var/www && npm install --production

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Configure nginx
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Install and run server
ADD . /var/www

EXPOSE 80 443 22 10000

CMD supervisord -c /etc/supervisor/conf.d/supervisord.conf
#CMD cd /var/www && NODE_ENV=production NODE_PATH=./ node --harmony ./server.js
