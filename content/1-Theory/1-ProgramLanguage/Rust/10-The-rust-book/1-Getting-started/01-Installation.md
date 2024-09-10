## 安装Rust

在ArchLinux上安装Rust非常简单，可以有两种方法：

### 官方脚本安装

Rust 项目提供了一个可下载的脚本来处理安装。要获取该脚本，请打开浏览器以访问 [https://sh.rustup.rs](https://link.zhihu.com/?target=https%3A//sh.rustup.rs/) 并保存该文件。阅读该脚本以确保你对它的具体行为有所了解，然后再运行它：

```shell
$ sh ./rustup.rs
```

或者使用`curl`工具下载：
```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

你也可以参考这个[安装 Rust](https://link.zhihu.com/?target=https%3A//www.rust-lang.org/tools/install) 的网页以获取更多信息。

安装 Rust 和 Cargo 之后，你必须 _获取(source)_ `env` 文件中的配置，以使更改应用于当前shell：

```shell
$ source $HOME/.cargo/env
```

更好的办法是，将所需目录添加到 `PATH` 环境变量中：

```shell
export PATH=$PATH:~/.cargo/bin
```

这种安装方式仅仅为当前用户进行了安装，而不是所有用户，因此不需要sudo权限。

更新和卸载官方方式安装的Rust的方式也很简单：
```shell
# update
rustup self update

# uninstall
rustup self uninstall
```


### 包管理器安装

对于ArchLinux以及其他发行版，只要对应包管理器源中有Rust包，都可以使用这种方式安装，以在整个系统范围内安装Rust，供所有用户使用，并且它会与系统更新同步。

在[ArchWiki中有安装Rust](https://wiki.archlinux.org/title/Rust#Installation)的详细安装步骤。其中给出两种安装方法，一种称为`Native Installation`的方法是从软件源中下载rust包，其中包含了rustc编译器和Cargo构建工具。

但这并不是一个好的选择，ArchWiki更推荐使用Rustup toolchain manager来下载，其优点是提供多版本（stable，beta，nightly）、多平台（Mac、Windows、Android等）、多架构（x86、x86_64、arm）的工具链。

在ArchLinux中使用AUR下载Rust安装器——rustup：
```shell
yay -S rustup
```
不过通过这种方式下载的rustup，不能使用`rustup self update`来更新，它需要使用pacman来进行系统级更新。并且，这种方式下载后，Rust 可执行文件存在于`/usr/bin`而不是`~/.cargo/bin`，这意味着整个系统都可以使用Rust并且不用添加环境变量。

默认情况下rustup不会下载工具链，需要用户手动安装全套工具链：
```shell
rustup toolchain install beta
```

这里一共有三种Rust套装可供选择：`stable`稳定版，`beta`测试版，`nightly`更不稳定的测试版，查看`rustup toolchain --help`中的文档以选择自己需要的版本。静待安装即可。

如果下载速度很慢，则可以配置镜像源：
```shell
# 设置 toolchain 更新环境变量
export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static
# 安装最新的 stable 工具链
rustup toolchain install stable
```

最后，查看一下默认工具链：
```shell
rustup toolchain list
```
可以看到其中工具链列表中有一项标记为`default`，如果没有，则使用如下命令手动指定默认工具链：
```shell
rustup default toolchain_name
```

### 验证安装
当完成全部安装后，使用如下命令查看是否安装成功：
```shell
$ rustc --version            
rustc 1.64.0-beta.3 (82bf34178 2022-08-18)  

$ cargo --version
cargo 1.64.0-beta.3 (ded089921 2022-08-11)
```

If you don’t see this information, check that Rust is in your %PATH% system variable as follows.

In Windows CMD, use:
> echo %PATH%

In PowerShell, use:
> echo $env:Path

In Linux and macOS, use:
> $ echo $PATH

If that’s all correct and Rust still isn’t working, there are a number of places you can get help. Find out how to get in touch with other Rustaceans (a silly nickname we call ourselves) on the community page.

## 卸载 rustup
To uninstall Rust and rustup, run the following uninstall script from your shell:
> $ rustup self uninstall

## Local Documentation
The installation of Rust also includes a local copy of the documentation so that you can read it offline. Run `rustup doc` to open the local documentation in your browser.

Any time a type or function is provided by the standard library and you’re not sure what it does or how to use it, use the application programming interface (API) documentation to find out!