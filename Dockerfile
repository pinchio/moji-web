# DOCKER-VERSION 1.1.2

FROM ubuntu:12.04

RUN apt-get update
RUN apt-get install -y nginx zip curl dialog build-essential openssl libssl-dev wget python-software-properties tmux

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
RUN cd /var/www && npm install

RUN echo "daemon off;" >> /etc/nginx/nginx.conf
RUN curl -o /usr/share/nginx/www/master.zip -L https://codeload.github.com/gabrielecirulli/2048/zip/master
RUN cd /usr/share/nginx/www/ && unzip master.zip && mv 2048-master/* . && rm -rf 2048-master master.zip

RUN python --version
RUN node --version

EXPOSE 80 443 22

CMD ["/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf"]
