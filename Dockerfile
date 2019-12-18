FROM infwonder/ubuntu-builder as builder
MAINTAINER jasonlin@11be.org

USER root
RUN mkdir -p /optract

WORKDIR /optract

COPY package.json /optract
COPY package-lock.json /optract
RUN npm install



FROM ubuntu:xenial
ENV DEBIAN_FRONTEND noninteractiv

USER root
RUN apt-get update -y && apt-get install -y curl && \
 curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
 apt-get install -y nodejs && apt-get clean

RUN useradd -m -d /optract optract
COPY package.json /optract
COPY package-lock.json /optract
COPY --from=builder /optract/node_modules /optract/node_modules
COPY ./lib /optract/lib
COPY ./dapps /optract/dapps
COPY ./caches /optract/caches
COPY ./server.js /optract

RUN chown -R optract.optract /optract

USER optract
WORKDIR /optract

EXPOSE 8080

ENTRYPOINT ["node", "./server.js"]
