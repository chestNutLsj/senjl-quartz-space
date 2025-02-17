## Configuration

The Docker daemon can be configured either through a configuration file at `/etc/docker/daemon.json` or by adding command line flags to the `docker.service` systemd unit. According to the [Docker official documentation](https://docs.docker.com/config/daemon/#configure-the-docker-daemon), the configuration file approach is preferred. If you wish to use the command line flags instead, use [systemd drop-in files](https://wiki.archlinux.org/title/Systemd#Drop-in_files "Systemd") to override the `ExecStart` directive in `docker.service`.

For more information about options in `daemon.json` see [dockerd documentation](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file).

### Storage driver

The [storage driver](https://docs.docker.com/storage/storagedriver/select-storage-driver/) controls how images and containers are stored and managed on your Docker host. The default `overlay2` driver has good performance and is a good choice for all modern Linux kernels and filesystems. There are a few legacy drivers such as `devicemapper` and `aufs` which were intended for compatibility with older Linux kernels, but these have no advantages over `overlay2` on Arch Linux.

Users of [btrfs](https://wiki.archlinux.org/title/Btrfs "Btrfs") or [ZFS](https://wiki.archlinux.org/title/ZFS "ZFS") may use the `btrfs` or `zfs` drivers, each of which take advantage of the unique features of these filesystems. See the [btrfs driver](https://docs.docker.com/storage/storagedriver/btrfs-driver/) and [zfs driver](https://docs.docker.com/storage/storagedriver/zfs-driver/) documentation for more information and step-by-step instructions.

### Daemon socket

By default, the Docker daemon serves the Docker API using a [Unix socket](https://en.wikipedia.org/wiki/Unix_domain_socket "wikipedia:Unix domain socket") at `/var/run/docker.sock`. This is an appropriate option for most use cases.

It is possible to configure the Daemon to additionally listen on a TCP socket, which can allow remote Docker API access from other computers. [^1] This can be useful for allowing `docker` commands on a host machine to access the Docker daemon on a Linux virtual machine, such as an Arch virtual machine on a Windows or macOS system.

>[! Warning] 
>The Docker API is unencrypted and unauthenticated by default. Remote TCP access to the Docker daemon is equivalent to unsecured remote root access unless TLS encryption and authorization is also enabled, either with an authenticating HTTP reverse proxy or with the appropriate [additional Docker configuration](https://docs.docker.com/engine/security/https/). In general, enabling Docker API TCP sockets should be considered a high security risk.

Note that the default `docker.service` file sets the `-H` flag by default, and Docker will not start if an option is present in both the flags and `/etc/docker/daemon.json` file. Therefore, the simplest way to change the socket settings is with a drop-in file, such as the following which adds a TCP socket on port 2376:

/etc/systemd/system/docker.service.d/docker.conf

[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H unix:///var/run/docker.sock -H tcp://0.0.0.0:2376

[Reload](https://wiki.archlinux.org/title/Reload "Reload") the systemd daemon and [restart](https://wiki.archlinux.org/title/Restart "Restart") `docker.service` to apply changes.

### HTTP Proxies

There are two parts to configuring Docker to use an HTTP proxy: Configuring the Docker daemon and configuring Docker containers.

#### Docker daemon proxy configuration

See [Docker documentation on configuring a systemd drop-in unit to configure HTTP proxies](https://docs.docker.com/config/daemon/systemd/#httphttps-proxy).

#### Docker container proxy configuration

See [Docker documentation on configuring proxies](https://docs.docker.com/network/proxy/#configure-the-docker-client) for information on how to automatically configure proxies for all containers created using the `docker` CLI.

### Configuring DNS

See [Docker's DNS documentation](https://docs.docker.com/config/containers/container-networking/#dns-services) for the documented behavior of DNS within Docker containers and information on customizing DNS configuration. In most cases, the resolvers configured on the host are also configured in the container.

Most DNS resolvers hosted on `127.0.0.0/8` are [not supported](https://github.com/moby/moby/issues/6388#issuecomment-76124221) due to conflicts between the container and host network namespaces. Such resolvers are [removed from the container's /etc/resolv.conf](https://github.com/moby/libnetwork/blob/master/resolvconf/resolvconf.go). If this would result in an empty `/etc/resolv.conf`, Google DNS is used instead.

Additionally, a special case is handled if `127.0.0.53` is the only configured nameserver. In this case, Docker assumes the resolver is [systemd-resolved](https://wiki.archlinux.org/title/Systemd-resolved "Systemd-resolved") and uses the upstream DNS resolvers from `/run/systemd/resolve/resolv.conf`.

If you are using a service such as [dnsmasq](https://wiki.archlinux.org/title/Dnsmasq "Dnsmasq") to provide a local resolver, consider adding a virtual interface with a link local IP address in the `169.254.0.0/16` block for dnsmasq to bind to instead of `127.0.0.1` to avoid the network namespace conflict.

### Images location

By default, docker images are located at `/var/lib/docker`. They can be moved to other partitions, e.g. if you wish to use a dedicated partition or disk for your images. In this example, we will move the images to `/mnt/docker`.

First, [stop](https://wiki.archlinux.org/title/Stop "Stop") `docker.service`, which will also stop all currently running containers and unmount any running images. You may then move the images from `/var/lib/docker` to the target destination, e.g. `cp -r /var/lib/docker /mnt/docker`.

Configure `data-root` in `/etc/docker/daemon.json`:

/etc/docker/daemon.json

{
  "data-root": "/mnt/docker"
}

Restart `docker.service` to apply changes.

### Insecure registries

If you decide to use a self signed certificate for your private registries, Docker will refuse to use it until you declare that you trust it. For example, to allow images from a registry hosted at `myregistry.example.com:8443`, configure `insecure-registries` in the `/etc/docker/daemon.json` file:

/etc/docker/daemon.json

{
  "insecure-registries": [
    "my.registry.example.com:8443"
  ]
}

Restart `docker.service` to apply changes.

### IPv6

In order to enable IPv6 support in Docker, you will need to do a few things. See [[7]](https://github.com/docker/docker.github.io/blob/c0eb65aabe4de94d56bbc20249179f626df5e8c3/engine/userguide/networking/default_network/ipv6.md) and [[8]](https://github.com/moby/moby/issues/36954) for details.

Firstly, enable the `ipv6` setting in `/etc/docker/daemon.json` and set a specific IPv6 subnet. In this case, we will use the private `fd00::/80` subnet. Make sure to use a subnet at least 80 bits as this allows a container's IPv6 to end with the container's MAC address which allows you to mitigate NDP neighbor cache invalidation issues.

/etc/docker/daemon.json

{
  "ipv6": true,
  "fixed-cidr-v6": "fd00::/80"
}

[Restart](https://wiki.archlinux.org/title/Restart "Restart") `docker.service` to apply changes.

Finally, to let containers access the host network, you need to resolve routing issues arising from the usage of a private IPv6 subnet. Add the IPv6 NAT in order to actually get some traffic:

# ip6tables -t nat -A POSTROUTING -s fd00::/80 ! -o docker0 -j MASQUERADE

Now Docker should be properly IPv6 enabled. To test it, you can run:

# docker run curlimages/curl curl -v -6 archlinux.org

If you use [firewalld](https://wiki.archlinux.org/title/Firewalld "Firewalld"), you can add the rule like this:

# firewall-cmd --zone=public --add-rich-rule='rule family="ipv6" destination not address="fd00::1/80" source address="fd00::/80" masquerade'

If you use [ufw](https://wiki.archlinux.org/title/Ufw "Ufw"), you need to first enable ipv6 forwarding following [Uncomplicated Firewall#Forward policy](https://wiki.archlinux.org/title/Uncomplicated_Firewall#Forward_policy "Uncomplicated Firewall"). Next you need to edit `/etc/default/ufw` and uncomment the following lines

/etc/ufw/sysctl.conf

net/ipv6/conf/default/forwarding=1
net/ipv6/conf/all/forwarding=1

Then you can add the iptables rule:

# ip6tables -t nat -A POSTROUTING -s fd00::/80 ! -o docker0 -j MASQUERADE

It should be noted that, for docker containers created with _docker-compose_, you may need to set `enable_ipv6: true` in the `networks` part for the corresponding network. Besides, you may need to configure the IPv6 subnet. See [[9]](https://docs.docker.com/compose/compose-file/compose-file-v2/#ipv4_address-ipv6_address) for details.

### User namespace isolation

By default, processes in Docker containers run within the same user namespace as the main `dockerd` daemon, i.e. containers are not isolated by the [user_namespaces(7)](https://man.archlinux.org/man/user_namespaces.7) feature. This allows the process within the container to access configured resources on the host according to [Users and groups#Permissions and ownership](https://wiki.archlinux.org/title/Users_and_groups#Permissions_and_ownership "Users and groups"). This maximizes compatibility, but poses a security risk if a container privilege escalation or breakout vulnerability is discovered that allows the container to access unintended resources on the host. (One such vulnerability was [published and patched in February 2019](https://seclists.org/oss-sec/2019/q1/119).)

The impact of such a vulnerability can be reduced by enabling [user namespace isolation](https://docs.docker.com/engine/security/userns-remap/). This runs each container in a separate user namespace and maps the UIDs and GIDs inside that user namespace to a different (typically unprivileged) UID/GID range on the host.

**Note:**

- The main `dockerd` daemon still runs as `root` on the host. Running Docker in [rootless mode](https://docs.docker.com/engine/security/rootless/) is a different feature.
- Processes in the container are started as the user defined in the [USER](https://docs.docker.com/engine/reference/builder/#user) directive in the Dockerfile used to build the image of the container.
- All containers are mapped into the same UID/GID range. This preserves the ability to share volumes between containers.
- Enabling user namespace isolation has [several limitations](https://docs.docker.com/engine/security/userns-remap/#user-namespace-known-limitations).
- Enabling user namespace isolation effectively masks existing image and container layers, as well as other Docker objects in `/var/lib/docker/`, because Docker needs to adjust the ownership of these resources. The upstream documentation recommends to enable this feature on a new Docker installation rather than an existing one.

Configure `userns-remap` in `/etc/docker/daemon.json`. `default` is a special value that will automatically create a user and group named `dockremap` for use with remapping.

/etc/docker/daemon.json

{
  "userns-remap": "default"
}

Configure `/etc/subuid` and `/etc/subgid` with a username/group name, starting UID/GID and UID/GID range size to allocate to the remap user and group. This example allocates a range of 65536 UIDs and GIDs starting at 165536 to the `dockremap` user and group.

/etc/subuid

dockremap:165536:65536

/etc/subgid

dockremap:165536:65536

Restart `docker.service` to apply changes.

After applying this change, all containers will run in an isolated user namespace by default. The remapping may be partially disabled on specific containers passing the `--userns=host` flag to the `docker` command. See [[10]](https://docs.docker.com/engine/security/userns-remap/#disable-namespace-remapping-for-a-container) for details.

### Rootless Docker daemon

**Note:** Docker rootless relies on the unprivileged user namespaces (`CONFIG_USER_NS_UNPRIVILEGED`). This is enabled by default in [linux](https://archlinux.org/packages/?name=linux), [linux-lts](https://archlinux.org/packages/?name=linux-lts), and [linux-zen](https://archlinux.org/packages/?name=linux-zen) kernels. Users of other kernels may need to enable it. This has some security implications, see [Security#Sandboxing applications](https://wiki.archlinux.org/title/Security#Sandboxing_applications "Security") for details.

To run the Docker daemon itself as a regular user, [install](https://wiki.archlinux.org/title/Install "Install") the [docker-rootless-extras](https://aur.archlinux.org/packages/docker-rootless-extras/)AUR package.

Configure `/etc/subuid` and `/etc/subgid` with a username/group name, starting UID/GID and UID/GID range size to allocate to the remap user and group.

/etc/subuid

your_username:165536:65536

/etc/subgid

your_username:165536:65536

[Enable](https://wiki.archlinux.org/title/Enable "Enable") the `docker.socket` [user unit](https://wiki.archlinux.org/title/User_unit "User unit"): this will result in docker being started using systemd's socket activation.

Finally set docker socket [environment variable](https://wiki.archlinux.org/title/Environment_variable "Environment variable"):

$ export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock

### Enable native overlay diff engine

[![Tango-inaccurate.png](https://wiki.archlinux.org/images/d/d6/Tango-inaccurate.png)](https://wiki.archlinux.org/title/File:Tango-inaccurate.png)**The factual accuracy of this article or section is disputed.**[![Tango-inaccurate.png](https://wiki.archlinux.org/images/d/d6/Tango-inaccurate.png)](https://wiki.archlinux.org/title/File:Tango-inaccurate.png)

**Reason:** This may not be necessary on your system. Though `metacopy=on redirect_dir=on` is the default on Arch Linux kernels, some report those settings getting disabled during runtime. (Discuss in [Talk:Docker#Native overlay diff](https://wiki.archlinux.org/title/Talk:Docker#Native_overlay_diff "Talk:Docker"))

By default, Docker cannot use the native overlay diff engine on Arch Linux, which makes building Docker images slow. If you frequently build images, configure the native diff engine as described in [[11]](https://mikeshade.com/posts/docker-native-overlay-diff/):

/etc/modprobe.d/disable-overlay-redirect-dir.conf

options overlay metacopy=off redirect_dir=off

Then [stop](https://wiki.archlinux.org/title/Stop "Stop") `docker.service`, reload the `overlay` module as follows:

# modprobe -r overlay
# modprobe overlay

You can then [start](https://wiki.archlinux.org/title/Start "Start") `docker.service` again.

To verify, run `docker info` and check that `Native Overlay Diff` is `true`.

[^1]: [Linux post-installation steps for Docker Engine | Docker Docs](https://docs.docker.com/engine/install/linux-postinstall/#allow-access-to-the-remote-api-through-a-firewall)