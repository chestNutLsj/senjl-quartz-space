## Create a Project Directory
It doesn’t matter to Rust where your code lives, but for the exercises and projects in this book, we suggest making a _projects_ directory in your home directory and keeping all your projects there.

```shell
$ mkdir ./the_rust_book
$ cd ./the_rust_book
$ mkdir 01-hello_world
$ cd 01-hello_world

```

## Write and run a Rust program
Next, make a new source file and call it _main.rs_. ==Rust files always end with the _.rs_ extension==. ==If you’re using more than one word in your filename, the convention is to use an underscore to separate them.== For example, use _hello_world.rs_ rather than _helloworld.rs_.

```rust
fn main(){  
   println!("Hello, world!");  
}
```

Compile it by rustc: 
```shell
$ rustc hello_world.rs
$ ./hello_world
Hello, world!  
$ ls  
hello_world  hello_world.rs
```

## Anatomy of a Rust program
```rust
fn main() {

}
```
These lines define a function named `main`. The `main` function is special: ==it is always the first code that runs in every executable Rust program==. Here, the first line declares a function named `main` that has no parameters and returns nothing. If there were parameters, they would go inside the parentheses `()`.

The function body is wrapped in `{}`. Rust requires curly brackets around all function bodies. It’s good style to place the opening curly bracket on the same line as the function declaration, adding one space in between.

> [! tip] Rustfmt
> If you want to stick to a standard style across Rust projects, you can use an automatic formatter tool called `rustfmt` to format your code in a particular style (more on `rustfmt` in [Appendix D](https://doc.rust-lang.org/book/appendix-04-useful-development-tools.html)). The Rust team has included this tool with the standard Rust distribution, as `rustc` is, so it should already be installed on your computer!

The body of the `main` function holds the following code:
```
println!("Hello, world!");
```

This line does all the work in this little program: it prints text to the screen.

### Coding specification
- First, Rust style is to indent with four spaces, not a tab.
- Second, `println!` calls a Rust macro. ==If it had called a function instead, it would be entered as `println` (without the `!`)==. We’ll discuss Rust macros in more detail in Chapter 19. For now, you just need to know that using a `!` means that you’re calling a macro instead of a normal function and that ==macros don’t always follow the same rules as functions==.
- Third, you see the `"Hello, world!"` string. We pass this string as an argument to `println!`, and the string is printed to the screen.
- Fourth, we ==end the line with a semicolon== (`;`), which indicates that this expression is over and the next one is ready to begin. Most lines of Rust code end with a semicolon.

## Compile and run are separate steps
Before running a Rust program, you must compile it using the Rust compiler by entering the `rustc` command and passing it the name of your source file, like this:
```
$ rustc hello_world.rs
```
If you have a C or C++ background, you’ll notice that this is similar to `gcc` or `clang`. After compiling successfully, Rust outputs a binary executable.

On Linux you can see the executable by entering the `ls` command in your shell:
```
$ ls 
hello_world  hello_world.rs
```
This shows the source code file with the _.rs_ extension, the executable file. From here, you run the _main_ file, like this:
```
$ ./main
```
If your _hello_world.rs_ is your “Hello, world!” program, this line prints `Hello, world!` to your terminal.

If you’re more familiar with a dynamic language, such as Ruby, Python, or JavaScript, you might not be used to compiling and running a program as separate steps. Rust is an _ahead-of-time compiled_ language, meaning you can compile a program and give the executable to someone else, and they can run it even without having Rust installed. If you give someone a _.rb_, _.py_, or _.js_ file, they need to have a Ruby, Python, or JavaScript implementation installed (respectively). But in those languages, you only need one command to compile and run your program. Everything is a trade-off in language design.

