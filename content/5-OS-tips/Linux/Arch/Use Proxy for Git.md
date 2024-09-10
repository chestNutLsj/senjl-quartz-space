Generally, the Git proxy configuration depends on the [Git Server Protocol](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols) you use. And there're two common protocols: SSH and HTTP/HTTPS. Both require a proxy setup already. In the following, I assume a SOCKS5 proxy set up on `localhost:1080`. But it can also be a HTTP proxy. I'll talk about how to set up a SOCKS5 proxy later.

## SSH Protocol

When you do `git clone ssh://[user@]server/project.git` or `git clone [user@]server:project.git`, you're using the SSH protocol. You need to configurate your SSH client to use a proxy. Add the following to your SSH config file, say `~/.ssh/config`:

```
ProxyCommand nc -x localhost:1080 %h %p
```

This is to make all SSH connections, including those by Git, via the proxy at `localhost:1080`. 

If you want to use a HTTP proxy at `localhost:1080`, do it like:

```
ProxyCommand nc -X connect -x localhost:1080 %h %p
```

You may want to use a proxy for a specific host, say GitHub. You can do it like this:

```
Host github.com                                                                                                             
  User git
  ProxyCommand nc -x localhost:1080 %h %p
```

This uses a proxy only for GitHub, so that when you `git clone git@github.com:your-name/your-project.git`, the proxy works.

The above SSH configuration involves Linux command [`nc`](https://linux.die.net/man/1/nc) and [ssh config](https://linux.die.net/man/5/ssh_config) `ProxyCommand`. Learm more about them if you're interested.

### Setup a SOCKS5 Proxy

It's very easy to setup a SOCKS5 proxy with your SSH Client:

```
ssh -ND 1080 user@host
```

Execute this command under a shell with `user` and `host` replaced with yours. This is to setup a SOCKS5 proxy at port `1080` at localhost.

## HTTP/HTTPS Protocol

When you do `git clone http://example.com/gitproject.git` or `git clone https://example.com/gitproject.git`, you're using the HTTP/HTTPS protocol.

Git respects `http_proxy` and `https_proxy` envrionment variables, so you can simply execute the following command in a shell:

```
export http_proxy=socks5://localhost:1080 https_proxy=socks5://localhost:1080
```

After that, your git command under the same shell will use the proxy *for HTTP/HTTPS connections*.

BTW, Git also has a `http.proxy` configuration to override those two envrionment variables:

```
http.proxy

Override the HTTP proxy, normally configured using the http_proxy, https_proxy, and all_proxy environment 
variables(see curl(1)). In addition to the syntax understood by curl, it is possible to specify a proxy 
string with a user name but no password, in which case git will attempt to acquire one in the same way it
does for other credentials. See gitcredentials(7) for more information. The syntax thus is 
[protocol://][user[:password]@]proxyhost[:port]. 
This can be overridden on a per-remote basis; see remote.<name>.proxy
```

You can set the `http.proxy` configuration by `git config` command (or by editing the git config file directly) instead of export those environment variables.

## Git Protocol

By saying "Git Protocol", I mean a [Git Server Protocol](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols) called "The Git Protocol". It has a URI like `git://server/project.git`. Note it starts with a `git://`, not `ssh://` or `http://` or something else. 

It's not commonly used, so you can skip this. I write this mainly for completeness of Git proxy settings.

Git a has configration `core.gitProxy` dedicated for this protocol, its man reads:

```
core.gitProxy

A "proxy command" to execute (as command host port) instead of establishing direct connection to the 
remote server when using the Git protocol for fetching. If the variable value is in the 
"COMMAND for DOMAIN" format, the command is applied only on hostnames ending with the specified 
domain string. This variable may be set multiple times and is matched in the given order; the first 
match wins.

Can be overridden by the GIT_PROXY_COMMAND environment variable (which always applies universally, 
without the special "for" handling).
```

You can set it by `git config`. 

## Other Refereneces

* http://cms-sw.github.io/tutorial-proxy.html
* https://github.com/cms-sw/cms-git-tools/blob/master/git-proxy