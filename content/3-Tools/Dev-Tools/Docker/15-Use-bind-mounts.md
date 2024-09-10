## Use bind mounts

In [[14-Persist-in-DB|part 4]], you used a volume mount to persist the data in your database. A volume mount is a great choice when you need somewhere persistent to store your application data.

A bind mount is another type of mount, which ==lets you share a directory from the host's filesystem into the container==. When working on an application, you can use a bind mount to mount source code into the container. The container sees the changes you make to the code immediately, as soon as you save a file. This means that you can run processes in the container that watch for filesystem changes and respond to them.

In this chapter, you'll see how you can use bind mounts and a tool called [nodemonopen_in_new](https://npmjs.com/package/nodemon) to watch for file changes, and then restart the application automatically. There are equivalent tools in most other languages and frameworks.

### Quick volume type comparisons

The following table outlines the main differences between volume mounts and bind mounts.

| features                                     | Named volumes                                        | Bind mount                                             |
| -------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| Host location                                | Docker chooses                                       | You decide                                             |
| Mount example (using --mount)                | `type=volume, src=my-volume, target=/usr/local/data` | `type=bind, src=/path/to/data, target=/usr/local/data` |
| Populates new volume with container contents | Yes                                                  | No                                                     |
| Supports Volume Drivers                      | Yes                                                  | No                                                     |


### Trying out bind mounts

Before looking at how you can use bind mounts for developing your application, you can run a quick experiment to get a practical understanding of how bind mounts work.

> **Note**
> 
> If you use Windows and want to use Git Bash to run Docker commands, see [Working with Git Bash](https://docs.docker.com/desktop/troubleshoot/topics/#working-with-git-bash) for syntax differences.

1. Open a terminal and change directory to the `getting-started-app` directory.

2. Run the following command to start `bash` in an `ubuntu` container with a bind mount.
```
$ docker run -it --mount type=bind, src="$(pwd)", target=/src ubuntu bash
```

The `--mount` option tells Docker to create a bind mount, where `src` is the current working directory on your host machine (`getting-started-app`), and `target` is where that directory should appear inside the container (`/src`).

3. After running the command, Docker starts an interactive `bash` session in the root directory of the container's filesystem.
![[15-Use-bind-mounts-bindmount.png]]

4.  Change directory to the `src` directory.
    
    This is the directory that you mounted when starting the container. ==Listing the contents of this directory displays the same files as in the `getting-started-app` directory on your host machine.==

5.  Create a new file named `myfile.txt`.
```
root@bf12ef5bd97e:/src# touch myfile.txt  
root@bf12ef5bd97e:/src# ls  
Dockerfile  README.md  myfile.txt  package.json  spec  src  yarn.lock
```

6. Open the `getting-started-app` directory on the host and observe that the `myfile.txt` file is in the directory.
```
❯ tree .  
.  
├── Dockerfile  
├── myfile.txt  
├── package.json  
├── README.md  
├── spec   
├── src   
└── yarn.lock
```

7.  From the host, delete the `myfile. txt` file.
![[15-Use-bind-mounts-delete-in-host.png]]

8.  In the container, list the contents of the `app` directory once more. Observe that the file is now gone.
```
root@bf12ef5bd97e:/src# ls  
Dockerfile    spec   README.md     src  package.json  yarn.lock
```

9.  Stop the interactive container session with `Ctrl` + `D`.

That's all for a brief introduction to bind mounts. This procedure demonstrated how files are shared between the host and the container, and how ==changes are immediately reflected on both sides==. Now you can use bind mounts to develop software.

### Development containers

Using bind mounts is common for local development setups. ==The advantage is that the development machine doesn’t need to have all of the build tools and environments installed.== With a single docker run command, Docker pulls dependencies and tools.

#### Run your app in a development container

The following steps describe how to run a development container with a bind mount that does the following:

*   Mount your source code into the container
*   Install all dependencies
*   Start `nodemon` to watch for filesystem changes

You can use the CLI or Docker Desktop to run your container with a bind mount.

1.  Make sure you don't have any `getting-started` containers currently running.

2.  Run the following command from the `getting-started-app` directory.

```
docker run -dp 127.0.0.1:3000:3000 \
    -w /app --mount type=bind,src="$(pwd)",target=/app \
    node:18-alpine \
    sh -c "yarn install && yarn run dev"
```

The following is a breakdown of the command:
- `-dp 127.0.0.1:3000:3000` - same as before. Run in detached (background) mode and create a port mapping
* `-w /app` - sets the "working directory" or the current directory that the command will run from
* `--mount type=bind, src="$(pwd)", target=/app` - bind mount the current directory from the host into the `/app` directory in the container
* `node: 18-alpine` - the image to use. Note that this is the base image for your app from the Dockerfile
* `sh -c "yarn install && yarn run dev"` - the command. You're starting a shell using `sh` (alpine doesn't have `bash`) and running `yarn install` to install packages and then running `yarn run dev` to start the development server. If you look in the `package.json`, you'll see that the `dev` script starts `nodemon`.

3.  You can watch the logs using `docker logs <container-id>`. You'll know you're ready to go when you see this:

```
❯ docker logs -f 0a902b2f9b31
yarn install v1.22.19
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 70.76s.
yarn run v1.22.19
$ nodemon src/index.js
[nodemon] 2.0.20
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node src/index.js`
Using sqlite database at /etc/todos/todo.db
Listening on port 3000

```

When you're done watching the logs, exit out by hitting `Ctrl`+`C`.

#### Develop your app with the development container

Update your app on your host machine and see the changes reflected in the container.

1. In the `src/static/js/app.js` file, on line 109, change the "Add Item" button to simply say "Add":

```diff
- {submitting ? 'Adding...' : 'Add Item'}
+ {submitting ? 'Adding...' : 'Add'}
```

Save the file.

2. Refresh the page in your web browser, and you should see the change reflected almost immediately. It might take a few seconds for the Node server to restart. If you get an error, try refreshing after a few seconds.
    ![[15-Use-bind-mounts-diff-add.png]]

3.  Feel free to make any other changes you'd like to make. ==Each time you make a change and save a file, the `nodemon` process restarts the app inside the container automatically==. When you're done, stop the container and build your new image using:
```
$ docker run -dp 127.0.0.1:3000:3000 `
	-w /app --mount "type=bind, src=$pwd, target=/app" `
	node: 18-alpine `
	sh -c "yarn install && yarn run dev"
```

### Summary

At this point, you can persist your database and see changes in your app as you develop without rebuilding the image.

In addition to volume mounts and bind mounts, Docker also supports other mount types and storage drivers for handling more complex and specialized use cases.

### Related information:
* [docker CLI reference](https://docs.docker.com/engine/reference/commandline/cli/)
* [Manage data in Dockeropen_in_new](https://docs.docker.com/storage/)
