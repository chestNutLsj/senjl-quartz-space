## Update the application

### Update the source code
In the following steps, you'll change the "empty text" when you don't have any todo list items to "You have no todo items yet! Add one above!"

1. In the `src/static/js/app.js` file, update line 56 to use the new empty text.

```diff
- <p className="text-center">No items yet! Add one above!</p>
+ <p className="text-center">You have no todo items yet! Add one above!</p>
```

2. Build your updated version of the image, using the `docker build` command .

```shell
docker build -t getting-started .

# The correct output as following:
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
---> 72002222baeb  
Step 4/6 : RUN yarn install --production  
---> Running in f0874a8e4016  
yarn install v1.22.19  
[1/4] Resolving packages...  
[2/4] Fetching packages...  
[3/4] Linking dependencies...  
[4/4] Building fresh packages...  
Done in 90.58s.  
Removing intermediate container f0874a8e4016  
---> 54276bc8efbb  
Step 5/6 : CMD ["node", "src/index.js"]  
---> Running in 2c8eafee3f04  
Removing intermediate container 2c8eafee3f04  
---> 992012734e8e  
Step 6/6 : EXPOSE 3000  
---> Running in e4425a8dfb91  
Removing intermediate container e4425a8dfb91  
---> adb88ebe06a8  
Successfully built adb88ebe06a8  
Successfully tagged getting-started:latest
```

3. Start a new container using the updated code.

```shell
docker run -dp 127.0.0.1:3000:3000 getting-started
```


You probably saw an error like this:

```console
docker: Error response from daemon: driver failed programming external connectivity on endpoint laughing_burnell 
(bb242b2ca4d67eba76e79474fb36bb5125708ebdabd7f45c8eaf16caaabde9dd): Bind for 127.0.0.1:3000 failed: port is already allocated.
```

The error occurred because you aren't able to start the new container while your old container is still running. The reason is that the old container is already using the host's port 3000 and only one process on the machine (containers included) can listen to a specific port. To fix this, you need to remove the old container.

### Remove the old container

==To remove a container, you first need to stop it. ==Once it has stopped, you can remove it. You can remove the old container using the CLI or Docker Desktop's graphical interface. Choose the option that you're most comfortable with.
#### Remove a container using the CLI

1. Get the ID of the container by using the `docker ps` command.

```console
$ docker ps
```

2. Use the `docker stop` command to stop the container. Replace `<the-container-id>` with the ID from `docker ps`. 

```console
$ docker stop <the-container-id>
```

3. Once the container has stopped, you can remove it by using the `docker rm` command. 

```console
$ docker rm <the-container-id>
```


> **Note**
> 
> You can stop and remove a container in a single command by adding the `force` flag to the `docker rm` command. For example: `docker rm -f <the-container-id>`
#### Start the updated app container

1. Now, start your updated app using the command.`docker run`

```console
docker run -dp 127.0.0.1:3000:3000 getting-started

# A new output
c9865e68ee361fe76c57b0df66dbdb243eb5714bac6a2ed38038ffa58c1d9f52

```

2. Refresh your browser on [http://localhost:3000open](http://localhost:3000/) and you should see your updated help text.

### Related information:
- [docker CLI reference](https://docs.docker.com/engine/reference/commandline/cli/)