# DOCKER-VERSION 1.1.2

FROM ubuntu:12.04

RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y git-core nginx zip curl dialog build-essential openssl libssl-dev wget python-software-properties tmux openssh-server supervisor

# https://docs.docker.com/articles/using_supervisord/
RUN mkdir -p /var/run/sshd
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install Node.js
RUN \
  cd /tmp && \
  wget http://nodejs.org/dist/v0.11.10/node-v0.11.10.tar.gz && \
  tar xvzf node-v0.11.10.tar.gz && \
  rm -f node-v0.11.10.tar.gz && \
  cd node-v* && \
  ./configure && \
  CXX="g++ -Wno-unused-local-typedefs" make && \
  CXX="g++ -Wno-unused-local-typedefs" make install && \
  cd /tmp && \
  rm -rf /tmp/node-v* && \
  echo '\n# Node.js\nexport PATH="node_modules/.bin:$PATH"' >> /root/.bash_profile

# Install and run server
ADD . /var/www
RUN cd /var/www && npm install && npm run start-dev

RUN echo "daemon off;" >> /etc/nginx/nginx.conf
RUN curl -o /usr/share/nginx/www/master.zip -L https://codeload.github.com/gabrielecirulli/2048/zip/master
RUN cd /usr/share/nginx/www/ && unzip master.zip && mv 2048-master/* . && rm -rf 2048-master master.zip

RUN python --version
RUN node --version

EXPOSE 80 443 22 10000

CMD ["/usr/bin/supervisord"]
