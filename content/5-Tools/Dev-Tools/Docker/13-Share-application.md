## Share the application

Now that you've built an image, you can share it. To share Docker images, you have to use a Docker registry. The default registry is Docker Hub and is where all of the images you've used have come from.

> **Docker ID**
> 
> A Docker ID lets you access Docker Hub, which is the world's largest library and community for container images. Create a [Docker IDopen](https://hub.docker.com/signup) for free if you don't have one.

### Create a repository

To push an image, you first need to create a repository on Docker Hub.

1. [Sign up](https://www.docker.com/pricing?utm_source=docker&utm_medium=webreferral&utm_campaign=docs_driven_upgrade) or Sign in to [Docker Hub](https://hub.docker.com/).
2. Select the **Create Repository** button.
3. For the repository name, use `getting-started`. Make sure the **Visibility** is **Public**.
4. Select **Create**.

In the following image, you can see an example Docker command from Docker Hub. This command will push to this repository.

![[10-Official-getting-started-create-repo.png]]

### Push the image

1. In the command line, run the `docker push` command that you see on Docker Hub. Note that your command will have your Docker ID, not "docker".

```
❯ docker push chestnutlsj/getting-started:getting-started  
The push refers to repository [docker.io/chestnutlsj/getting-started]  
An image does not exist locally with the tag: chestnutlsj/getting-started
```

==Why did it fail?== The push command was looking for an image named `chestnutlsj/getting-started`, but didn't find one. If you run `docker image ls`, you won't see one either.

To fix this, you need to tag your existing image you've built to give it another name.

2. Sign in to Docker Hub using the command `docker login -u YOUR-USER-NAME`.
```
# correct output:
❯ docker login -u chestnutlsj  
Password:    
WARNING! Your password will be stored unencrypted in /home/senjl/.docker/config.json.  
Configure a credential helper to remove this warning. See  
https://docs.docker.com/engine/reference/commandline/login/#credentials-store  
  
Login Succeeded
```

3. Use the `docker tag` command to give the `getting-started` image a new name. Replace `YOUR-USER-NAME` with your Docker ID.

```
docker tag getting-started:latest chestnutlsj/getting-started:hellodocker
```

4. Now run the `docker push` command again. If you're copying the value from Docker Hub, you can drop the `tagname` part, as you didn't add a tag to the image name. If you don't specify a tag, Docker uses a tag called `latest`.

```
❯ docker push chestnutlsj/getting-started:hellodocker  
The push refers to repository [docker.io/chestnutlsj/getting-started]  
62aeed21ca62: Pushed    
d851decfeff3: Pushed    
e1616fdfe6cb: Pushed    
498c77a984f9: Mounted from library/node    
69b50a78845f: Mounted from library/node    
ea2a97a3209c: Mounted from library/node    
4693057ce236: Mounted from library/node    
hellodocker: digest: sha256:dec513ddea8f7df4d3d3784d50a8923d0d96a35e54be002187f71a864cf93b16 size: 1787
```

### Run the image on a new instance

Now that your image has been built and pushed into a registry, try running your app on a brand new instance that has never seen this container image. To do this, you will use Play with Docker.

> [! note] Play with Docker.
> 
> Play with Docker uses the amd64 platform. If you are using an ARM based Mac with Apple Silicon, you will need to rebuild the image to be compatible with Play with Docker and push the new image to your repository.
> 
> To build an image for the amd64 platform, use the `--platform` flag.
> 
> ```
> $ docker build --platform linux/amd64 -t YOUR-USER-NAME/getting-started .
> ```
> 
> Docker buildx also supports building multi-platform images. To learn more, see [Multi-platform images](https://docs.docker.com/build/building/multi-platform/).

1. Open your browser to [Play with Dockeropen_in_new](https://labs.play-with-docker.com/).

2. Select **Login** and then select **docker** from the drop-down list.

3. Sign in with your Docker Hub account and then select **Start**.

4. Select the **ADD NEW INSTANCE** option on the left side bar. If you don't see it, make your browser a little wider. After a few seconds, a terminal window opens in your browser.

![[10-Official-getting-started-play-docker.png]]

5. In the terminal, start your freshly pushed app.

```
docker run -dp 0.0.0.0:3000:3000 YOUR-USER-NAME/getting-started
```

You should see the image get pulled down and eventually start up.

![[10-Official-getting-started-run-in-playdocker.png]]

> **Tip**
> 
> You may have noticed that this command binds the port mapping to a different IP address. Previous `docker run` commands published ports to `127.0.0.1:3000` on the host. This time, you're using `0.0.0.0`.
> 
> ==Binding to `127.0.0.1` only exposes a container's ports to the loopback interface. Binding to `0.0.0.0`, however, exposes the container's port on all interfaces of the host, making it available to the outside world.==
> 
> For more information about how port mapping works, see [Networking](https://docs.docker.com/network/#published-ports).

6. Select the 3000 badge when it appears.

If the 3000 badge doesn't appear, you can select **Open Port** and specify `3000`.

### Related information:

* [docker CLI reference](https://docs.docker.com/engine/reference/commandline/cli/)
* [Multi-platform images](https://docs.docker.com/build/building/multi-platform/)
* [Docker Hub overview](https://docs.docker.com/docker-hub/)