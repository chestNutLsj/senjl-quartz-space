## Image-building best practices
### Image layering

Using the `docker image history` command, you can see the command that was used to create each layer within an image.

1.  Use the `docker image history` command to see the layers in the `getting-started` image you created.
```
$ docker image history getting-started
```

You should get output that looks something like the following.

```
❯ docker image history getting-started
IMAGE          CREATED       CREATED BY                                       SIZE      COMMENT
adb88ebe06a8   4 days ago    /bin/sh -c #(nop)  EXPOSE 3000                   0B        
992012734e8e   4 days ago    /bin/sh -c #(nop)  CMD ["node" "src/index.js…   0B        
54276bc8efbb   4 days ago    /bin/sh -c yarn install --production             85.3MB    
72002222baeb   4 days ago    /bin/sh -c #(nop) COPY dir:7da59228467bf6ecd…   6.47MB    
4dc6c6fec12b   4 days ago    /bin/sh -c #(nop) WORKDIR /app                   0B        
50c7e33a9de1   6 weeks ago   /bin/sh -c #(nop)  CMD ["node"]                  0B        
<missing>      6 weeks ago   /bin/sh -c #(nop)  ENTRYPOINT ["docker-entry…   0B        
<missing>      6 weeks ago   /bin/sh -c #(nop) COPY file:4d192565a7220e13…   388B      
<missing>      6 weeks ago   /bin/sh -c apk add --no-cache --virtual .bui…   7.77MB    
<missing>      6 weeks ago   /bin/sh -c #(nop)  ENV YARN_VERSION=1.22.19      0B        
<missing>      6 weeks ago   /bin/sh -c addgroup -g 1000 node     && addu…   161MB     
<missing>      6 weeks ago   /bin/sh -c #(nop)  ENV NODE_VERSION=18.17.1      0B        
<missing>      6 weeks ago   /bin/sh -c #(nop)  CMD ["/bin/sh"]               0B        
<missing>      6 weeks ago   /bin/sh -c #(nop) ADD file:32ff5e7a78b890996…   7.33MB    
```

Each of the lines represents a layer in the image. The display here shows the base at the bottom with the newest layer at the top. Using this, you can also quickly see the size of each layer, helping diagnose large images.

2.  You'll notice that several of the lines are truncated. If you add the `--no-trunc` flag, you'll get the full output.

```
$ docker image history --no-trunc getting-started
```


### Layer caching

Now that you've seen the layering in action, there's an important lesson to learn to help decrease build times for your container images. Once a layer changes, all downstream layers have to be recreated as well.

Look at the following Dockerfile you created for the getting started app.

```
# syntax=docker/dockerfile:1
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "src/index.js"]
```

Going back to the image history output, ==you see that each command in the Dockerfile becomes a new layer in the image==. You might remember that when you made a change to the image, the yarn dependencies had to be reinstalled. It doesn't make much sense to ship around the same dependencies every time you build.

==To fix it, you need to restructure your Dockerfile to help support the caching of the dependencies==. For Node-based applications, those dependencies are defined in the `package.json` file. You can copy only that file in first, install the dependencies, and then copy in everything else. Then, you only recreate the yarn dependencies if there was a change to the `package.json`. (要解决这个问题，你需要重组你的 Dockerfile，以帮助支持缓存依赖项。对于基于 Node 的应用程序，这些依赖项定义在 package. json 文件中。你可以先只复制该文件，安装依赖项，然后再复制其他文件。然后，只有在 package. json 发生变化时，才重新创建 yarn 依赖项。)

1.  Update the Dockerfile to copy in the `package.json` first, install dependencies, and then copy everything else in.

```
# syntax=docker/dockerfile:1
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
CMD ["node", "src/index.js"]
```

2.  Create a file named `.dockerignore` in the same folder as the Dockerfile with the following contents.
```
node_modules
```

`.dockerignore` files are an easy way to selectively copy only image relevant files. You can read more about this [here](https://docs.docker.com/engine/reference/builder/#dockerignore-file). ==In this case, the `node_modules` folder should be omitted in the second `COPY` step== because otherwise, it would possibly overwrite files which were created by the command in the `RUN` step. For further details on why this is recommended for Node.js applications and other best practices, have a look at their guide on [Dockerizing a Node.js web appopen_in_new](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/).

3.  Build a new image using `docker build`.

```
docker build -t getting-started .
```

You should see output like the following.

```
❯ docker build -t getting-started .
DEPRECATED: The legacy builder is deprecated and will be removed in a future release.
            Install the buildx component to build images with BuildKit:
            https://docs.docker.com/go/buildx/

Sending build context to Docker daemon  6.538MB
Step 1/7 : FROM node:18-alpine
 ---> 50c7e33a9de1
Step 2/7 : WORKDIR /app
 ---> Using cache
 ---> 4dc6c6fec12b
Step 3/7 : COPY package.json yarn.lock ./
 ---> cd2e59f231b8
Step 4/7 : RUN yarn install --production
 ---> Running in fa48cc7dfb6f
yarn install v1.22.19
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 57.55s.
Removing intermediate container fa48cc7dfb6f
 ---> d7961d0091d9
Step 5/7 : COPY . .
 ---> dd3843740895
Step 6/7 : CMD ["node", "src/index.js"]
 ---> Running in 9f7942865ee6
Removing intermediate container 9f7942865ee6
 ---> 7d02266deb19
Step 7/7 : EXPOSE 3000
 ---> Running in ad7053ca647c
Removing intermediate container ad7053ca647c
 ---> ee2e8aea622f
Successfully built ee2e8aea622f
Successfully tagged getting-started:latest

```

4.  Now, make a change to the `src/static/index.html` file. For example, change the `<title>` to "The Awesome Todo App".

5.  Build the Docker image now using `docker build -t getting-started .` again. This time, your output should look a little different.
```
❯ docker build -t getting-started .
DEPRECATED: The legacy builder is deprecated and will be removed in a future release.
            Install the buildx component to build images with BuildKit:
            https://docs.docker.com/go/buildx/

Sending build context to Docker daemon  6.538MB
Step 1/7 : FROM node:18-alpine
 ---> 50c7e33a9de1
Step 2/7 : WORKDIR /app
 ---> Using cache
 ---> 4dc6c6fec12b
Step 3/7 : COPY package.json yarn.lock ./
 ---> Using cache
 ---> cd2e59f231b8
Step 4/7 : RUN yarn install --production
 ---> Using cache
 ---> d7961d0091d9
Step 5/7 : COPY . .
 ---> ebc1e569ef3a
Step 6/7 : CMD ["node", "src/index.js"]
 ---> Running in 746060187ac7
Removing intermediate container 746060187ac7
 ---> 18c1681ade56
Step 7/7 : EXPOSE 3000
 ---> Running in e4f8f0c6b1b3
Removing intermediate container e4f8f0c6b1b3
 ---> dbb5a6bd1df3
Successfully built dbb5a6bd1df3
Successfully tagged getting-started:latest

```

First off, you should notice that the ==build was much faster. And, you'll see that several steps are using previously cached layers==. Pushing and pulling this image and updates to it will be much faster as well.

### Multi-stage builds

Multi-stage builds are an incredibly powerful tool to help use multiple stages to create an image. There are several advantages for them:

* ==Separate build-time dependencies from runtime dependencies==
* ==Reduce overall image size== by shipping only what your app needs to run

#### Maven/Tomcat example

When building Java-based applications, you need a JDK to compile the source code to Java bytecode. However, that JDK isn't needed in production. Also, you might be using tools like Maven or Gradle to help build the app. Those also aren't needed in your final image. Multi-stage builds help.

```
# syntax=docker/dockerfile:1
FROM maven AS build
WORKDIR /app
COPY . .
RUN mvn package

FROM tomcat
COPY --from=build /app/target/file.war /usr/local/tomcat/webapps 
```

In this example, you use one stage (called `build`) to perform the actual Java build using Maven. In the second stage (starting at `FROM tomcat`), you copy in files from the `build` stage. The final image is only the last stage being created, which can be overridden using the `--target` flag.

#### React example

When building React applications, you need a Node environment to compile the JS code (typically JSX), SASS stylesheets, and more into static HTML, JS, and CSS. If you aren't doing server-side rendering, you don't even need a Node environment for your production build. You can ship the static resources in a static nginx container.

```
# syntax=docker/dockerfile:1
FROM maven AS build
WORKDIR /app
COPY . .
RUN mvn package

FROM tomcat
COPY --from=build /app/target/file. war /usr/local/tomcat/webapps
```

In the previous Dockerfile example, it uses the `node:18` image to perform the build (maximizing layer caching) and then copies the output into an nginx container.

### Summary

In this section, you learned a few image building best practices, including layer caching and multi-stage builds.

### Related information:

*   [.dockerignore](https://docs.docker.com/engine/reference/builder/#dockerignore-file)
*   [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
*   [Build with Docker guide](https://docs.docker.com/build/guide/)
*   [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
