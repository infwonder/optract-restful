FROM infwonder/ubuntu-builder
MAINTAINER jasonlin@11be.org

USER root
RUN useradd -m -d /optract optract

USER optract
WORKDIR /optract

COPY package.json /optract
COPY package-lock.json /optract
RUN npm install

COPY ./lib /optract/lib
COPY ./dapps /optract/dapps
COPY ./caches /optract/caches
COPY ./server.js /optract

EXPOSE 8080

ENTRYPOINT ["/optract/server.js"]
