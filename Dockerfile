# DOCKER-VERSION 1.1.2

FROM ubuntu:12.04

RUN apt-get update
RUN apt-get install -y git-core nginx zip curl dialog build-essential openssl libssl-dev wget python-software-properties tmux openssh-server supervisor

RUN add-apt-repository ppa:chris-lea/node.js-devel
RUN apt-get update
RUN apt-get install -y nodejs

# https://docs.docker.com/articles/using_supervisord/
RUN mkdir -p /var/run/sshd
RUN mkdir -p /var/log/supervisor
# COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
# RUN touch ~/.profile

# Install and run server
ADD . /var/www
RUN cd /var/www && npm install --production

# RUN echo "daemon off;" >> /etc/nginx/nginx.conf
# RUN curl -o /usr/share/nginx/www/master.zip -L https://codeload.github.com/gabrielecirulli/2048/zip/master
# RUN cd /usr/share/nginx/www/ && unzip master.zip && mv 2048-master/* . && rm -rf 2048-master master.zip

EXPOSE 80 443 22 10000

#CMD ["/usr/bin/supervisord"]
#CMD cd /var/www && NODE_PATH=./ node --harmony ./server.js
CMD sudo python -m SimpleHTTPServer 80

