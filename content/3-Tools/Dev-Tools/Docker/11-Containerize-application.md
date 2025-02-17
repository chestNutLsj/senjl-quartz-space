## Containerize an application

For the rest of this guide, you'll be working with a simple todo list manager that runs on `Node.js`. If you're not familiar with `Node.js`, don't worry. This guide doesn't require any prior experience with JavaScript.

### Prerequisites

* You have installed the latest version of [Docker Desktop](https://docs.docker.com/get-docker/).
* You have installed a [Git clientopen_in_new](https://git-scm.com/downloads).
* You have an IDE or a text editor to edit files. Docker recommends using [Visual Studio Codeopen_in_new](https://code.visualstudio.com/).

### Get the app

Before you can run the application, you need to get the application source code onto your machine.

1. Clone the [getting-started-app repositoryopen_in_new](https://github.com/docker/getting-started-app/tree/main) using the following command:

```
$ git clone https://github.com/docker/getting-started-app.git
```

2.  View the contents of the cloned repository. You should see the following files and sub-directories.

```
├── getting-started-app/
│ ├── package.json
│ ├── README.md
│ ├── spec/
│ ├── src/
│ └── yarn.lock
```

### Build the app's image

==To build the image, you'll need to use a Dockerfile. ==

A Dockerfile is simply a text-based file with no file extension that contains a script of instructions. Docker uses this script to build a container image.

1. In the `getting-started-app` directory, the same location as the `package.json` file, create a file named `Dockerfile`. You can use the following commands to create a Dockerfile based on your operating system.
```shell
# In the terminal, run the following commands.

# Make sure you're in the `getting-started-app` directory.
cd /path/to/getting-started-app

# Create an empty file named `Dockerfile`
touch Dockerfile
```


2.  Using a text editor or code editor, add the following contents to the Dockerfile:
```
# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "src/index.js"]
EXPOSE 3000
```

3.  Build the image using the following commands:
```shell
# Build the image
docker build -t getting-started .
```

The `docker build` command uses the Dockerfile to build a new image. ==You might have noticed that Docker downloaded a lot of "layers". This is because you instructed the builder that you wanted to start from the `node:18-alpine` image.== But, since you didn't have that on your machine, Docker needed to download the image.

After Docker downloaded the image, the instructions from the Dockerfile (which is the `RUN` instruction ) copied in your application and used ` yarn ` to install your application's dependencies. ==The ` CMD ` directive specifies the default command to run when starting a container from this image==.

Finally, the `-t` flag tags your image. Think of this as a human-readable name for the final image. Since you named the image `getting-started`, you can refer to that image when you run a container.

The `.` at the end of the `docker build` command tells Docker that it should look for the `Dockerfile` in the current directory.

```
# The correct output
❯ docker build -t getting-started .  
DEPRECATED: The legacy builder is deprecated and will be removed in a future release.  
           Install the buildx component to build images with BuildKit:  
           https://docs.docker.com/go/buildx/  
  
Sending build context to Docker daemon  6.536MB  
Step 1/6 : FROM node:18-alpine  
---> 50c7e33a9de1  
Step 2/6 : WORKDIR /app  
---> Using cache  
---> 4dc6c6fec12b  
Step 3/6 : COPY . .  
---> Using cache  
---> e7c7c17d6e90  
Step 4/6 : RUN yarn install --production  
---> Running in 67fb6a84624a  
yarn install v1.22.19  
[1/4] Resolving packages...  
[2/4] Fetching packages...  
[3/4] Linking dependencies...  
[4/4] Building fresh packages...  
Done in 80.28s.  
Removing intermediate container 67fb6a84624a  
---> eb3f2fc36464  
Step 5/6 : CMD ["node", "src/index.js"]  
---> Running in 80daefc1d806  
Removing intermediate container 80daefc1d806  
---> 14a7714a60e3  
Step 6/6 : EXPOSE 3000  
---> Running in fdb835fc2e6d  
Removing intermediate container fdb835fc2e6d  
---> d2d0b21440d8  
Successfully built d2d0b21440d8  
Successfully tagged getting-started:latest
```

### Start an app container

Now that you have an image, you can run the application in a container using the `docker run` command.

1. Run your container using the `docker run` command and specify the name of the image you just created:

```shell
docker run -dp 127.0.0.1:3000:3000 getting-started

# the correct output maybe
60944f2b639a6ce33f097ea26a4363b3139cebd9e010c08c10b183075de0106b
```

The `-d` flag (short for `--detach`) runs the container in the background. 
The `-p` flag (short for `--publish`) ==creates a port mapping between the host and the container==. 

The `-p` flag takes a string value in the format of `HOST:CONTAINER`, where `HOST` is the address on the host, and `CONTAINER` is the port on the container. The command publishes the container's port 3000 to `127.0.0.1:3000` (`localhost:3000`) on the host. 

Without the port mapping, you wouldn't be able to access the application from the host.

2. After a few seconds, open your web browser to [http://localhost:3000open](http://localhost:3000/). You should see your app.

![[10-Usage-todo-app.png]]

3. Add an item or two and see that it works as you expect. You can mark items as complete and remove them. ==Your frontend is successfully storing items in the backend==.


At this point, you have a running todo list manager with a few items.

### See container's process
If you take a quick look at your containers, you should see at least one container running that's using the `getting-started` image and on port `3000`. To see your containers, you can use the CLI or Docker Desktop's graphical interface.

Run the following `docker ps` command in a terminal to list your containers.

```shell
docker ps
```

Output similar to the following should appear.

```
❯ docker ps  
CONTAINER ID   IMAGE             COMMAND                   CREATED         STATUS         PORTS          
             NAMES  
60944f2b639a   getting-started   "docker-entrypoint.s…"   3 minutes ago   Up 3 minutes   127.0.0.1:3000  
->3000/tcp   awesome_cartwright
```

### Related reference
* [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
* [docker CLI reference](https://docs.docker.com/engine/reference/commandline/cli/)
* [Build with Docker guide](https://docs.docker.com/build/guide/)