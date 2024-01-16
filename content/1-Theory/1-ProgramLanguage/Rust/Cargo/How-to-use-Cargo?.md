Cargo是Rust的构建系统和包管理器，可以帮助开发人员下载和管理依赖选项。在Rust中包称为`crate`，具体参阅Rust社区的[Cargo FAQ](https://doc.rust-lang.org/cargo/faq.html)来了解。

使用`help`命令行参数查看Cargo的一些帮助：
```shell
$ cargo help

Rust's package manager  
  
USAGE:  
   cargo [+toolchain] [OPTIONS] [SUBCOMMAND]  
  
OPTIONS:  
   -V, --version               Print version info and exit  
       --list                  List installed commands  
       --explain <CODE>        Run `rustc --explain CODE`  
   -v, --verbose               Use verbose output (-vv very verbose/build.rs output)  
   -q, --quiet                 Do not print cargo log messages  
       --color <WHEN>          Coloring: auto, always, never  
       --frozen                Require Cargo.lock and cache are up to date  
       --locked                Require Cargo.lock is up to date  
       --offline               Run without accessing the network  
       --config <KEY=VALUE>    Override a configuration value  
   -Z <FLAG>                   Unstable (nightly-only) flags to Cargo, see 'cargo -Z help' for  
                               details  
   -h, --help                  Print help information  
  
Some common cargo commands are (see all commands with --list):  
   build, b    Compile the current package  
   check, c    Analyze the current package and report errors, but don't build object files  
   clean       Remove the target directory  
   doc, d      Build this package's and its dependencies' documentation  
   new         Create a new cargo package  
   init        Create a new cargo package in an existing directory  
   add         Add dependencies to a manifest file  
   run, r      Run a binary or example of the local package  
   test, t     Run the tests  
   bench       Run the benchmarks  
   update      Update dependencies listed in Cargo.lock  
   search      Search registry for crates  
   publish     Package and upload this package to the registry  
   install     Install a Rust binary. Default location is $HOME/.cargo/bin  
   uninstall   Uninstall a Rust binary  
  
See 'cargo help <command>' for more information on a specific command.
```

并且，由于Rust是一个更新迭代非常快的语言，Cargo的库不停在更新，因此可以使用`update`命令更新库的新版本，还可以添加`-p`参数来更新指定的库：
```shell
$ cargo update

$ cargo update -p lib_name
```

## 创建新包

使用`cargo new  package_name`创建新的包：
```shell
$ cargo new hello
 Created binary (application) `hello` package
```
创建成功后，Cargo会返回消息“已创建给定名称的二进制应用包”。

使用`tree`命令查看目录结构：
```shell
$ tree hello
hello
├── Cargo.lock  
├── Cargo.toml  
└── src  
   └── main.rs  
  
1 directory, 3 files
```

查看源代码`main.rs`的内容：
```shell
$ cat src/main.rs
fn main() {  
   println!("Hello, world!");  
}
```

而`Cargo.toml`是包配置文件，包含包名称、版本、作者信息、Rust版本信息、依赖等：
```shell
$ cat Cargo.toml
[package]  
name = "hello"  
version = "0.1.0"  
edition = "2021"  
  
# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html  
  
[dependencies]
```
程序的运行不是孤立的，而通常依赖于外部库或依赖项，在`Cargo.toml`文件中的`[dependencies]`中添加需要的依赖即可，当然，现在这个包的依赖为空。

## 使用Cargo构建程序

进入包的根目录，使用`build`参数来构建包：
```shell
$ cargo build
   Compiling hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished dev [unoptimized + debuginfo] target(s) in 0.33s
```

再次使用`tree`命令查看构建中都发生了什么： 
```shell
$ tree 
.  
├── Cargo.lock  
├── Cargo.toml  
├── src  
│   └── main.rs  
└── target  
   ├── CACHEDIR.TAG  
   └── debug  
       ├── build  
       ├── deps  
       │   ├── hello-2c3affb4eb36b7d2  
       │   └── hello-2c3affb4eb36b7d2.d  
       ├── examples  
       ├── hello  
       ├── hello.d  
       └── incremental  
           └── hello-ormtpyf9czps  
               ├── s-gcx2iz5fuj-4s8l1e-20lchlht7t39y  
               │   ├── 133yfbdk0e9z2sg8.o  
               │   ├── 2dqo6j1ad2rv4mwi.o  
               │   ├── 4bdd94fgxhhf5ddv.o  
               │   ├── 4c1jajxgz5oqmaxw.o  
               │   ├── 4f4jiotoububskr4.o  
               │   ├── dep-graph.bin  
               │   ├── query-cache.bin  
               │   ├── work-products.bin  
               │   └── zqtyelf25legosu.o  
               └── s-gcx2iz5fuj-4s8l1e.lock  
  
9 directories, 18 files
```
`target`目录就是构建产生的结果，其中二进制文件`hello`存在于`./target/debug`目录中。

## 使用Cargo运行程序

构建完成后，使用`run`参数来运行二进制文件：
```shell
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s  
    Running `target/debug/hello`  
Hello, world!
```

或者直接运行二进制文件：
```shell
$ ./target/debug/hello
Hello, world!
```

## 清除构建缓存

使用`clean`参数可以方便地删除所有构建过程中的二进制文件和中间文件：
```shell
$ cargo clean

$ tree .
.  
├── Cargo.lock  
├── Cargo.toml  
└── src  
   └── main.rs  
  
1 directory, 3 files
```



## 使用Cargo添加依赖项

打开`Cargo.toml`文件，在`[dependencies]`中添加需要的库，如`rand`库：
```shell
$ cat Cargo.toml
[package]  
name = "hello"  
version = "0.1.0"  
authors = ["chestNut_Lsj@foxmail.com"]  
edition = "2021"  
  
# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html  
  
[dependencies]  
rand = "0.8.5"
```

重新构建一下：
```shell
$ cargo build
   Updating crates.io index  
 Downloaded getrandom v0.2.7  
 Downloaded ppv-lite86 v0.2.16  
 Downloaded rand v0.8.5  
 Downloaded rand_chacha v0.3.1  
 Downloaded rand_core v0.6.3  
 Downloaded cfg-if v1.0.0  
 Downloaded libc v0.2.132  
 Downloaded 7 crates (778.7 KB) in 5.15s  
  Compiling libc v0.2.132  
  Compiling cfg-if v1.0.0  
  Compiling ppv-lite86 v0.2.16  
  Compiling getrandom v0.2.7  
  Compiling rand_core v0.6.3  
  Compiling rand_chacha v0.3.1  
  Compiling rand v0.8.5  
  Compiling hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished dev [unoptimized + debuginfo] target(s) in 50.04s
```
这时，Cargo会联系[Crates.io](https://crates.io)(Rust用于存储crate包的中央仓库)，并下载和编译`rand`及其递归依赖。

## 隐式编译

之前运行程序的顺序是先进行构建`build`，再执行`run`，事实上可以直接使用`run`参数来隐式地运行`build`：
```shell
$ cargo clean
$ cargo run
  Compiling libc v0.2.132  
  Compiling cfg-if v1.0.0  
  Compiling ppv-lite86 v0.2.16  
  Compiling getrandom v0.2.7  
  Compiling rand_core v0.6.3  
  Compiling rand_chacha v0.3.1  
  Compiling rand v0.8.5  
  Compiling hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished dev [unoptimized + debuginfo] target(s) in 1.89s  
    Running `target/debug/hello`  
Hello, world!
```

## 在开发过程中检查代码

开发程序时通常会经过多次迭代，需要确保程序没有编码错误并可以正常编译，但如果每次都进行编译生成二进制文件，会带来许多不必要的开销。
Cargo提供了`check`选项来编译代码，但跳过了生成可执行文件的最后一步：
```shell
$ cargo clean

$ cargo check
  Compiling libc v0.2.132  
   Checking cfg-if v1.0.0  
   Checking ppv-lite86 v0.2.16  
   Checking getrandom v0.2.7  
   Checking rand_core v0.6.3  
   Checking rand_chacha v0.3.1  
   Checking rand v0.8.5  
   Checking hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished dev [unoptimized + debuginfo] target(s) in 1.51s

$ tree
.  
├── Cargo.lock  
├── Cargo.toml  
├── src  
│   └── main.rs  
└── target  
   ├── CACHEDIR.TAG  
   └── debug  
       ├── build  
       │   ├── libc-9cb7d2be4f148d8d  
       │   │   ├── invoked.timestamp  
       │   │   ├── out  
       │   │   ├── output  
       │   │   ├── root-output  
       │   │   └── stderr  
       │   └── libc-e7e19a56156df0d4  
       │       ├── build-script-build  
       │       ├── build_script_build-e7e19a56156df0d4  
       │       └── build_script_build-e7e19a56156df0d4.d  
       ├── deps  
       │   ├── cfg_if-483f5a2788925099.d  
       │   ├── getrandom-55e6e9ff0a74db26.d  
       │   ├── hello-eda6716f9f3501b8.d  
       │   ├── libc-3d26a49c7271168b.d  
       │   ├── libcfg_if-483f5a2788925099.rmeta  
       │   ├── libgetrandom-55e6e9ff0a74db26.rmeta  
       │   ├── libhello-eda6716f9f3501b8.rmeta  
       │   ├── liblibc-3d26a49c7271168b.rmeta  
       │   ├── libppv_lite86-bf292952cb4fcb49.rmeta  
       │   ├── librand-4ea013f55303293f.rmeta  
       │   ├── librand_chacha-1958c6aef2048c2e.rmeta  
       │   ├── librand_core-151866fa65160912.rmeta  
       │   ├── ppv_lite86-bf292952cb4fcb49.d  
       │   ├── rand-4ea013f55303293f.d  
       │   ├── rand_chacha-1958c6aef2048c2e.d  
       │   └── rand_core-151866fa65160912.d  
       ├── examples  
       └── incremental  
           └── hello-1bg9ru9wzrvu4  
               ├── s-gcx5pju0kr-ixejqe-19nz9vy9di8u7  
               │   ├── dep-graph.bin  
               │   ├── query-cache.bin  
               │   └── work-products.bin  
               └── s-gcx5pju0kr-ixejqe.lock  
  
12 directories, 31 files
```
可以看到，即使在编译过程中创建了中间文件，但没有创建最终的二进制文件或可执行文件，这对于成千上万行代码的大型项目来说将会节约大量时间：
```shell
$ time cargo build
  Compiling libc v0.2.132  
  Compiling cfg-if v1.0.0  
  Compiling ppv-lite86 v0.2.16  
  Compiling getrandom v0.2.7  
  Compiling rand_core v0.6.3  
  Compiling rand_chacha v0.3.1  
  Compiling rand v0.8.5  
  Compiling hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished dev [unoptimized + debuginfo] target(s) in 1.92s  
cargo build  2.78s user 0.48s system 165% cpu 1.961 total


$ cargo clean

$ time cargo check
  Compiling libc v0.2.132  
   Checking cfg-if v1.0.0  
   Checking ppv-lite86 v0.2.16  
   Checking getrandom v0.2.7  
   Checking rand_core v0.6.3  
   Checking rand_chacha v0.3.1  
   Checking rand v0.8.5  
   Checking hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished dev [unoptimized + debuginfo] target(s) in 1.52s  
cargo check  1.68s user 0.28s system 125% cpu 1.556 total
```

## 建立外部Rust包

只要下载或克隆存储库，移至包文件夹，就可以运行任何互联网上可以获得的Rust crate：
```shell
git clone <github-like-url>
cd <package-folder>
cargo build
```

## 使用Cargo构建优化的Rust程序

注意到之前`cargo build`的输出了吗？每次编译都会有一条消息`[unoptimized + debuginfo]`，这意味着Cargo生成的二进制文件包含大量调试信息，并且未针对执行进行优化。
开发者经常经历多次开发迭代，并且需要此调试信息进行分析，同样地，性能不是开发软件时的近期目标，此时未优化是可以接受的。
而准备发布软件时，就不需要这些调试信息，并且需要对其优化以获得最佳性能，因此添加`--release`选项来对其优化：
```shell
$ cargo build --release
  Compiling hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished release [optimized] target(s) in 0.32s

$ tree
.  
├── Cargo.lock  
├── Cargo.toml  
├── src  
│   └── main.rs  
└── target  
   ├── CACHEDIR.TAG  
   └── release  
       ├── build  
       ├── deps  
       │   ├── hello-c9985439c1a4f281  
       │   └── hello-c9985439c1a4f281.d  
       ├── examples  
       ├── hello  
       ├── hello.d  
       └── incremental  
  
7 directories, 8 files
```
对比一下不使用优化的构建结果：
```shell
$ cargo build
  Compiling hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished dev [unoptimized + debuginfo] target(s) in 0.32s
$ tree
.  
├── Cargo.lock  
├── Cargo.toml  
├── src  
│   └── main.rs  
└── target  
   ├── CACHEDIR.TAG  
   └── debug  
       ├── build  
       ├── deps  
       │   ├── hello-2c3affb4eb36b7d2  
       │   └── hello-2c3affb4eb36b7d2.d  
       ├── examples  
       ├── hello  
       ├── hello.d  
       └── incremental  
           └── hello-ormtpyf9czps  
               ├── s-gcx69gv85l-1rberwh-20lchlht7t39y  
               │   ├── 133yfbdk0e9z2sg8.o  
               │   ├── 2dqo6j1ad2rv4mwi.o  
               │   ├── 4bdd94fgxhhf5ddv.o  
               │   ├── 4c1jajxgz5oqmaxw.o  
               │   ├── 4f4jiotoububskr4.o  
               │   ├── dep-graph.bin  
               │   ├── query-cache.bin  
               │   ├── work-products.bin  
               │   └── zqtyelf25legosu.o  
               └── s-gcx69gv85l-1rberwh.lock  
  
9 directories, 18 files
```

## 使用Cargo创建库文件

任何软件程序都可以粗略的分为独立二进制文件或库文件，独立二进制文件是可以独立运行的，尽管它也可以被其他文件当作外部库使用；而库文件不能独立运行，只能被另一个独立二进制文件所利用。
Cargo默认创建的程序都是独立二进制文件，若要创建一个库，可以添加`--lib`选项：
```shell
$ cargo new --lib libhello-lsj
    Created library `libhello-lsj` package

$ tree libhello-lsj
libhello-lsj  
├── Cargo.toml  
└── src  
   └── lib.rs  
  
1 directory, 2 files
```

看看`lib.rs`中有什么：
```shell
$ cat src/lib.rs
pub fn add(left: usize, right: usize) -> usize {  
   left + right  
}  
  
#[cfg(test)]  
mod tests {  
   use super::*;  
  
   #[test]  
   fn it_works() {  
       let result = add(2, 2);  
       assert_eq!(result, 4);  
   }  
}
```
默认情况下，Cargo会在库文件中放置一个测试函数。

## 使用Cargo运行测试
Rust为单元测试和集成测试提供了一流的支持，Cargo允许执行以下任何测试：
```shell
$ cat /src/lib.rs
#[cfg(test)]  
mod tests {  
  
   #[test]  
   fn it_works() {  
       assert_eq!(2+2,4);  
   }  
}
```

Cargo使用`test`命令来运行代码中存在的任何测试：
```shell
$ cargo test
  Compiling libhello-lsj v0.1.0 (/home/lsjarch/MyLearning/Rust/libhello-lsj)  
   Finished test [unoptimized + debuginfo] target(s) in 0.22s  
    Running unittests src/lib.rs (target/debug/deps/libhello_lsj-226b57adde0b124f)  
  
running 1 test  
test tests::it_works ... ok  
  
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s  
  
  Doc-tests libhello-lsj  
  
running 0 tests  
  
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

## 深入了解

要了解Cargo在运行命令时究竟发生了什么，则可以添加`-v`参数与任何Cargo命令一起使用，这样可以将详细信息输出到屏幕：
```shell
$ cd ../hello
      Fresh hello v0.1.0 (/home/lsjarch/MyLearning/Rust/hello)  
   Finished dev [unoptimized + debuginfo] target(s) in 0.00s
   
$ cargo build -v
   Removing /home/lsjarch/MyLearning/Rust/hello/target
```

OK，至此初步使用Cargo构建Rust程序已经学习完毕，若要进一步了解Cargo，可以下载并阅读Rust团队编写的[开源Cargo手册](https://doc.rust-lang.org/cargo)。
