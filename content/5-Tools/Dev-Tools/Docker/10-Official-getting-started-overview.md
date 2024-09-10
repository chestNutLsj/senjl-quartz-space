## Docker components

Docker consists of multiple parts:

- The Docker daemon (sometimes also called the Docker Engine), which is a process which runs as docker. service. It serves the Docker API and manages Docker containers.
- The docker CLI command, which allows users to interact with the Docker API via the command line and control the Docker daemon.
- Docker containers, which are namespaced processes that are started and managed by the Docker daemon as requested through the Docker API.

## Running docker CLI
Typically , users use Docker by running `docker` CLI commands, which in turn request the Docker daemon to perform actions which in turn result in management of Docker containers. 

Understanding the relationship between the client (`docker`), server (`docker.service`) and containers is important to successfully administering Docker.

Note that ==if the Docker daemon stops or restarts, all currently running Docker containers are also stopped or restarted==.

Also note that it is possible to send requests to the Docker API and control the Docker daemon without the use of the `docker` CLI command. See the [Develop with Docker Engine API | Docker Docs](https://docs.docker.com/engine/api/) for more information.

## Overview

This guide contains step-by-step instructions on how to get started with Docker. This guide shows you how to:
* Build and run an image as a container.
* Share images using Docker Hub.
* Deploy Docker applications using multiple containers with a database.
* Run applications using Docker Compose.

### What is a container?

A container is a sandboxed process running on a host machine that is isolated from all other processes running on that host machine. That isolation leverages [kernel namespaces and cgroupsopen_in_new](https://medium.com/@saschagrunert/demystifying-containers-part-i-kernel-space-2c53d6979504), features that have been in Linux for a long time. Docker makes these capabilities approachable and easy to use. 

To summarize, a container:
* Is a runnable instance of an image. You can create, start, stop, move, or delete a container using the Docker API or CLI.
* Can be run on local machines, virtual machines, or deployed to the cloud.
* Is portable (and can be run on any OS).
* Is isolated from other containers and runs its own software, binaries, configurations, etc.

If you're familiar with `chroot`, then think of a container as an extended version of `chroot`. The filesystem comes from the image. However, a container adds additional isolation not available when using chroot.

### What is an image?

A running container uses an isolated filesystem. This isolated filesystem is provided by an image, and the image must contain everything needed to run an application - all dependencies, configurations, scripts, binaries, etc. The image also contains other configurations for the container, such as environment variables, a default command to run, and other metadata.
