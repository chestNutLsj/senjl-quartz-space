---
url: https://dockerlabs.collabnix.com/docker/cheatsheet/
title: The Ultimate Docker Cheat Sheet | dockerlabs
date: 2023-09-22 12:37:19
time: 1695357439211
tag: 
summary: Docker - Beginners Intermediate Advanced
---
![](1695357439239.png)

A cheatsheet is a concise summary of important information that is meant to be used as a quick reference. Cheatsheets are often used in the form of a list or a table, and they typically cover a specific topic or subject area. In the context of Docker, a Docker cheatsheet is a summary of commonly used Docker commands and their options, as well as other useful information related to Docker.

Cheatsheets can be particularly helpful when learning a new tool or technology, as they provide a convenient way to quickly look up and remind oneself of key concepts and commands. They can also be useful for experienced users who need to recall a specific command or option but may not remember all the details.

## Table of Contents

*   [Categories](#categories)
    *   🐳 [Basic Docker CLIs](#basic-docker-clis)
    *   🧰 [Container Management CLIs](#container-management-clis)
    *   🧑‍💻 [Inspecting the Container](#inspecting-the-container)
    *   🧑‍💻 [Interacting with Container](#interacting-with-container)
    *   🫙 [Image Management Commands](#image-management-commands)
    *   🧪 [Image Transfer Commands](#image-transfer-commands)
    *   🏗️ [Builder Main Commands](#builder-main-commands)
    *   ⚙️ [The Docker CLI](#the-docker-cli)
    *   🧰 [Docker Security](#docker-security)
*   🧑‍🤝‍🧑 [Contributors](#contributors)
*   💬 [Support and Community](#support-and-community)
*   👉 [References](#references)

## Basic Docker CLIs

Here’s the list of the basic Docker commands that works on both Docker Desktop as well as Docker Engine:

![](https://raw.githubusercontent.com/sangam14/dockercheatsheets/master/dockercheatsheet8.png)

## Container Management CLIs

Here’s the list of the Docker commands that manages Docker images and containers flawlessly:

![](https://raw.githubusercontent.com/sangam14/dockercheatsheets/master/dockercheatsheet1.png)

## Inspecting The Container

Here’s the list of the basic Docker commands that helps you inspect the containers seamlessly:

![](https://raw.githubusercontent.com/sangam14/dockercheatsheets/master/dockercheatsheet3.png)

## Interacting with Container

Do you want to know how to access the containers? Check out these fundamental commands:

![](https://raw.githubusercontent.com/sangam14/dockercheatsheets/master/dockercheatsheet4.png)

## Image Management Commands

Here’s the list of Docker commands that helps you manage the Docker Images:

![](https://raw.githubusercontent.com/sangam14/dockercheatsheets/master/dockercheatsheet5.png)

## Image Transfer Commands

Here’s the list of Docker image transfer commands:

![](https://raw.githubusercontent.com/sangam14/dockercheatsheets/master/dockercheatsheet6.png)

## Builder Main Commands

Want to know how to build Docker Image? Do check out the list of Image Build Commands:

![](https://raw.githubusercontent.com/sangam14/dockercheatsheets/master/dockercheatsheet7.png)

## The Docker CLI

## Manage images

### `docker build`

```
docker build [options] .
  -t "app/container_name"    # name
```

Create an `image` from a Dockerfile.

### `docker run`

```
docker run [options] IMAGE
  # see `docker create` for options
```

Run a command in an `image`.

## Manage containers

### `docker create`

```
docker create [options] IMAGE
  -a, --attach               # attach stdout/err
  -i, --interactive          # attach stdin (interactive)
  -t, --tty                  # pseudo-tty
      --name NAME            # name your image
  -p, --publish 5000:5000    # port map
      --expose 5432          # expose a port to linked containers
  -P, --publish-all          # publish all ports
      --link container:alias # linking
  -v, --volume `pwd`:/app    # mount (absolute paths needed)
  -e, --env NAME=hello       # env vars
```

#### Example

```
$ docker create --name app_redis_1 \
  --expose 6379 \
  redis:3.0.2
```

Create a `container` from an `image`.

### `docker exec`

```
docker exec [options] CONTAINER COMMAND
  -d, --detach        # run in background
  -i, --interactive   # stdin
  -t, --tty           # interactive
```

#### Example

```
$ docker exec app_web_1 tail logs/development.log
$ docker exec -t -i app_web_1 rails c
```

Run commands in a `container`.

### `docker start`

```
docker start [options] CONTAINER
  -a, --attach        # attach stdout/err
  -i, --interactive   # attach stdin

docker stop [options] CONTAINER
```

Start/stop a `container`.

### `docker ps`

```
$ docker ps
$ docker ps -a
$ docker kill $ID
```

Manage `container`s using ps/kill.

## Images

### `docker images`

```
$ docker images
  REPOSITORY   TAG        ID
  ubuntu       12.10      b750fe78269d
  me/myapp     latest     7b2431a8d968
```

```
$ docker images -a   # also show intermediate
```

Manages `image`s.

### `docker rmi`

Deletes `image`s.

## Also see

*   [Getting Started](http://www.docker.io/gettingstarted/) _(docker.io)_

### Inheritance

### Variables

```
docker rmi b750fe78269d
```

### Initialization

```
FROM ruby:2.2.2
```

```
ENV APP_HOME /myapp
RUN mkdir $APP_HOME
```

### Onbuild

```
RUN bundle install
```

### Commands

```
WORKDIR /myapp
```

### Entrypoint

```
VOLUME ["/data"]
# Specification for mount point
```

Configures a container that will run as an executable.

This will use shell processing to substitute shell variables, and will ignore any `CMD` or `docker run` command line arguments.

### Metadata

```
ADD file.xyz /file.xyz
COPY --chown=user:group host_file.xyz /path/container_file.xyz
```

```
ONBUILD RUN bundle install
# when used with another file
```

## See also

*   [https://docs.docker.com/engine/reference/builder/](https://docs.docker.com/engine/reference/builder/)

### Basic example

```
EXPOSE 5900
CMD    ["bundle", "exec", "rails", "server"]
```

### Commands

```
ENTRYPOINT ["executable", "param1", "param2"]
ENTRYPOINT command param1 param2
```

```
ENTRYPOINT exec top -b
```

```
LABEL version="1.0"
```

## Reference

### Building

```
LABEL "com.example.vendor"="ACME Incorporated"
LABEL com.example.label-with-value="foo"
```

```
LABEL description="This text illustrates \
that label-values can span multiple lines."
```

```
# docker-compose.yml
version: '2'

services:
  web:
    build: .
 # build from Dockerfile
    context: ./Path
    dockerfile: Dockerfile
    ports:
     - "5000:5000"
    volumes:
     - .:/code
  redis:
    image: redis
```

### Ports

```
docker-compose start
docker-compose stop
```

```
docker-compose pause
docker-compose unpause
```

### Commands

```
docker-compose ps
docker-compose up
docker-compose down
```

```
web:
 # build from Dockerfile
  build: .
```

### Environment variables

```
# build from custom Dockerfile
  build:
    context: ./dir
    dockerfile: Dockerfile.dev
```

```
# build from image
 image: ubuntu
 image: ubuntu:14.04
 image: tutum/influxdb
 image: example-registry:4000/postgresql
 image: a4bc65fd
```

### Dependencies

```
ports:
    - "3000"
    - "8000:80"  # guest:host
```

```
# expose ports to linked services (not to host)
  expose: ["3000"]
```

### Other options

```
# command to execute
  command: bundle exec thin -p 3000
  command: [bundle, exec, thin, -p, 3000]
```

```
# override the entrypoint
  entrypoint: /app/start.sh
  entrypoint: [php, -d, vendor/bin/phpunit]
```

## Advanced features

### Labels

```
# environment vars
  environment:
    RACK_ENV: development
  environment:
    - RACK_ENV=development
```

### DNS servers

```
# environment vars from file
  env_file: .env
  env_file: [.env, .development.env]
```

### Devices

```
# makes the `db` service available as the hostname `database`
  # (implies depends_on)
 links:
 - db:database
 - redis
```

### External links

```
# make sure `db` is alive before starting
  depends_on:
 - db
```

### Hosts

```
# make this service extend another
 extends:
 file: common.yml  # optional
 service: webapp
```

### services

To view list of all the services running in swarm

To see all running services

```
volumes:
    - /var/lib/mysql
    - ./_data:/var/lib/mysql
```

to see all services logs

```
services:
  web:
    labels:
      com.example.description: "Accounting web app"
```

To scale services quickly across qualified node

```
services:
  web:
    dns: 8.8.8.8
    dns:
      - 8.8.8.8
      - 8.8.4.4
```

### clean up

To clean or prune unused (dangling) images

To remove all images which are not in use containers , add - a

To prune your entire system

To leave swarm

To remove swarm (deletes all volume data and database info)

```
services:
  web:
    devices:
    - "/dev/ttyUSB0:/dev/ttyUSB0"
```

To kill all running containers

```
services:
 web:
 external_links:
 - redis_1
 - project_db_1:mysql
```

## Docker Security

### Docker Scout

Command line tool for Docker Scout:

Analyzes a software artifact for vulnerabilities

```
services:
  web:
    extra_hosts:
      - "somehost:192.168.1.100"
```

Display vulnerabilities from a docker save tarball

```
docker service ls
```

Display vulnerabilities from an OCI directory

```
docker stack services stack_name
```

Export vulnerabilities to a SARIF JSON file

```
docker service logs stack_name service_name
```

Comparing two images

```
docker service scale stack_name_service_name=replicas
```

Displaying the Quick Overview of an Image

```
docker image prune
```

## Contributors

[Sangam biradar](https://twitter.com/BiradarSangam) - Docker Community Leader  
[Ajeet Singh Raina](https://twitter.com/ajeetsraina) - Docker Captain, Collabnix

## Support and Community

If you do get enough interest to contribute to this Cheat Sheet, the community at Collabnix is available to support you. Feel free to raise PR and get your favorite Cheat Sheet added to the list via [PR](https://github.com/collabnix/dockerlabs/pulls), or you can connect to us either on Slack or Discord server.

## Other Cheat Sheets

*   [Kubectl Cheat Sheet](https://collabnix.com/kubectl-cheatsheet/)
*   [Docker Compose Cheat Sheet](https://dockerlabs.collabnix.com/intermediate/docker-compose/compose-cheatsheet.html)