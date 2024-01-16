Just compiling with `rustc` is fine for simple programs, but as your project grows, you’ll want to manage all the options and make it easy to share your code. Cargo is useful in such case, which will help you write real-world Rust programs.

## What is Cargo?
Cargo is Rust’s build system and package manager. Most Rustaceans use this tool to manage their Rust projects because Cargo handles a lot of tasks for you, such as building your code, downloading the libraries your code depends on, and building those libraries. (We call the libraries that your code needs _dependencies_.)

The simplest Rust programs, like the one we’ve written so far, don’t have any dependencies. If we had built the “Hello, world!” project with Cargo, it would only use the part of Cargo that handles building your code. As you write more complex Rust programs, you’ll add dependencies, and ==if you start a project using Cargo, adding dependencies will be much easier to do.==

## How to use cargo?
![[How-to-use-Cargo?#创建新包]]

Cargo has generated two files and one directory for us: a _Cargo.toml_ file and a _src_ directory with a _main.rs_ file inside.

It has also initialized a new Git repository along with a _.gitignore_ file. Git files won’t be generated if you run `cargo new` within an existing Git repository; you can override this behavior by using `cargo new --vcs=git`.

> Note: Git is a common version control system. You can change `cargo new` to use a different version control system or no version control system by using the `--vcs` flag. Run `cargo new --help` to see the available options.

> [! warning] 
> `$ cargo new 11-hello_cargo`  
> error: the name `11-hello_cargo` cannot be used as a package name, the name cannot start with a digit If you need a package name to not match the directory name, consider using --name flag.  
> If you need a binary with the name "11-hello_cargo", use a valid package name, and set the binary name to be different from the package. This can be done by setting the binary filename to `src/bin/11-hello_cargo.rs` or change the name in `Cargo.toml` with:
> ```  
  [[bin]]  
   name = "11-hello_cargo"  
   path = "src/main. rs"
> ```

This file is in the [_TOML_](https://toml.io/) (_Tom’s Obvious, Minimal Language_) format, which is Cargo’s configuration format.

Cargo expects your source files to live inside the _src_ directory. The top-level project directory is just for README files, license information, configuration files, and anything else not related to your code. Using Cargo helps you organize your projects. There’s a place for everything, and everything is in its place.

If you started a project that doesn’t use Cargo, as we did with the “Hello, world!” project, you can convert it to a project that does use Cargo. Move the project code into the _src_ directory and create an appropriate _Cargo.toml_ file.

![[How-to-use-Cargo?#使用Cargo构建程序]]

Running `cargo build` for the first time also causes Cargo to create a new file at the top level: _Cargo.lock_. This file keeps track of the exact versions of dependencies in your project. This project doesn’t have dependencies, so the file is a bit sparse. You won’t ever need to change this file manually; Cargo manages its contents for you.

![[How-to-use-Cargo?#使用Cargo运行程序]]

Using `cargo run` is more convenient than having to remember to run `cargo build` and then use the whole path to the binary, so most developers use `cargo run`.

Notice that this time we didn’t see output indicating that Cargo was compiling `hello_cargo`. Cargo figured out that the files hadn’t changed, so it didn’t rebuild but just ran the binary. If you had modified your source code, Cargo would have rebuilt the project before running it.

![[How-to-use-Cargo?#在开发过程中检查代码]]

As such, many Rustaceans run `cargo check` periodically as they write their program to make sure it compiles. Then they run `cargo build` when they’re ready to use the executable.

![[How-to-use-Cargo?#使用Cargo构建优化的Rust程序]]

The optimizations make your Rust code run faster, but turning them on lengthens the time it takes for your program to compile. This is why there are two different profiles: one for development, when you want to rebuild quickly and often, and another for building the final program you’ll give to a user that won’t be rebuilt repeatedly and that will run as fast as possible.

### More detailed about Cargo
-  [[How-to-use-Cargo?]]
- [[The Cargo Book.pdf]]

## Cargo as convention
With simple projects, Cargo doesn’t provide a lot of value over just using `rustc`, but it will prove its worth as your programs become more intricate. Once programs grow to multiple files or need a dependency, it’s much easier to let Cargo coordinate the build.

Even though the `hello_cargo` project is simple, it now uses much of the real tooling you’ll use in the rest of your Rust career. In fact, to work on any existing projects, you can use the following commands to check out the code using Git, change to that project’s directory, and build:
```
$ git clone example.org/someproject 
$ cd someproject 
$ cargo build
```

## Quiz
> Say you just downloaded a Cargo project, and then you run `cargo run` at the command-line. Which statement is NOT true about what happens next?
> 
> You answered: Cargo executes the project's binary
> The correct answer is: Cargo watches for file changes and re-executes the binary on a change
> 
> Context: Cargo does not watch your files by default. But you can use plugins like `cargo-watch` for this purpose.

