---
date: 2024-04-11
tags:
  - Python
publish: "true"
---
# Using the Python Interpreter
## 2.1. Invoking the Interpreter

The Python interpreter is usually installed as `/usr/local/bin/python3.12` on those machines where it is available; putting `/usr/local/bin` in your Unix shell’s search path makes it possible to start it by typing the command:
```
python3.12
```
to the shell. [^1]Since the choice of the directory where the interpreter lives is an installation option, other places are possible; check with your local Python guru or system administrator. (E.g., `/usr/local/python` is a popular alternative location.)

On Windows machines where you have installed Python from the [Microsoft Store](https://docs.python.org/3/using/windows.html#windows-store), the `python3.12` command will be available. If you have the [py.exe launcher](https://docs.python.org/3/using/windows.html#launcher) installed, you can use the `py` command. See [Excursus: Setting environment variables](https://docs.python.org/3/using/windows.html#setting-envvars) for other ways to launch Python.

Typing an end-of-file character (Control-D on Unix, Control-Z on Windows) at the primary prompt causes the interpreter to exit with a zero exit status. If that doesn’t work, you can exit the interpreter by typing the following command: `quit()`.
> 在 Python 解释器的提示词中输入 End-of-File 字符（如 Unix 机上的 Ctrl+D ，或 Windows 机上的 Ctrl+Z）就可以让解释器以 0 状态退出。或者调用 `quit()` 函数也行。

The interpreter’s line-editing features include interactive editing, history substitution and code completion on systems that support the [GNU Readline](https://tiswww.case.edu/php/chet/readline/rltop.html) library. Perhaps the quickest check to see whether command line editing is supported is typing Control-P to the first Python prompt you get. If it beeps[^2], you have command line editing; see Appendix [Interactive Input Editing and History Substitution](https://docs.python.org/3/tutorial/interactive.html#tut-interacting) for an introduction to the keys. If nothing appears to happen, or if `^P` is echoed, command line editing isn’t available; you’ll only be able to use backspace to remove characters from the current line.

The interpreter operates somewhat like the Unix shell: when called with standard input connected to a tty device, it reads and executes commands interactively; when called with a file name argument or with a file as standard input, it reads and executes a _script_ from that file.
> 解释器的运行模式与Unix shell 类似，
> - 当被连接到 tty[^3] 设备的标准输入调用时，它会交互式地读取并执行输入的命令；
> - 当被文件名作为参数或文件作为标准输入调用时，它会从那个文件执行一个脚本。

A second way of starting the interpreter is `python -c command [arg] ...`, which executes the statement (s) in _command_, analogous to the shell’s `-c` option. Since Python statements often contain spaces or other characters that are special to the shell, it is usually advised to quote _command_ in its entirety.
> 另一种启动解释器的方式是使用命令 `python -c command [arg] ...` ，这将执行command 中的语句，类似于shell 中的 -c 选项[^4]。
> 
> 另外，由于 Python 语句通常含有空格或 shell 中有特殊用途的字符，因此建议用 `""` 引用 _command_ 中的全部内容。

Some Python modules are also useful as scripts. These can be invoked using `python -m module [arg] ...`, which executes the source file for _module_ as if you had spelled out its full name on the command line.
> 一些 Python 模块可以作为脚本使用，我们可以使用 `python -m module [arg] ...` 这条命令调用它们，它会执行 _module_ 中指定的源文件，就像在命令行中拼出其全名一样。

When a script file is used, it is sometimes useful to be able to run the script and enter interactive mode afterwards. This can be done by passing `-i` before the script.
> 使用脚本文件时，有时需要在脚本运行后进入**交互模式**，这可以通过在脚本前传递 `-i` 参数来实现。

All command line options are described in [Command line and environment](https://docs.python.org/3/using/cmdline.html#using-on-general).

### 2.1.1. Argument Passing

When known to the interpreter, the script name and additional arguments thereafter are turned into a list of strings and assigned to the `argv` variable in the `sys` module. You can access this list by executing `import sys`. The length of the list is at least one; when no script and no arguments are given, `sys.argv[0]` is an empty string. When the script name is given as `'-'` (meaning standard input), `sys.argv[0]` is set to `'-'`. When `-c` _command_ is used, `sys.argv[0]` is set to `'-c'`. When `-m` _module_ is used, `sys.argv[0]` is set to the full name of the located module. Options found after `-c` _command_ or `-m` _module_ are not consumed by the Python interpreter’s option processing but left in `sys.argv` for the command or module to handle.
> **参数传递**
> 
> 当解释器知道脚本名称及其后的附加参数时，会将其转换为**字符串列表**，并赋值给 `sys` 模块中的 `argv` 变量：
> - 可以通过 `import sys` 引入 `sys` 模块来访问这个列表
> - 列表的长度至少是 1 ；如果没有指定脚本或参数，那么 `sys.argv[0]` 是一个空字符串
> - 当脚本名字被指定为 `-`（意味着标准输入），`sys.argv[0]` 也会被设置为 `-`；当使用了 `-c command` 选项，`sys.argv[0]` 被设置为 `-c`；当使用 `-m module` 选项，就被设置为定位到的模块的全称
> - 而在 `-c command` 或 `-m module` 之后的选项不会被 Python 解释器使用，而是保留在 `sys.argv` 列表中交给模块自己处理

### 2.1.2. Interactive Mode

When commands are read from a tty, the interpreter is said to be in _interactive mode_. In this mode it prompts for the next command with the _primary prompt_, usually three greater-than signs (`>>>`); for continuation lines it prompts with the _secondary prompt_, by default three dots (`...`). The interpreter prints a welcome message stating its version number and a copyright notice before printing the first prompt:
> 当从tty 中读取到命令 `python3.12` 后，解释器会进入 *交互模式* ：
> - 此模式下会通过 *主要提示符*（通常是三个大于号 `>>>`）提示用户输入下一个命令
> - 对于续行，则会使用 *辅助提示*（通常是三个句点 `...`）
> 
> 解释器会在开始阶段，打印欢迎信息，包括Python 版本号、版权通知等信息。

```
$ python3.12
Python 3.12 (default, April 4 2022, 09:25:04)
[GCC 10.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

Continuation lines are needed when entering a multi-line construct. As an example, take a look at this [`if`](https://docs.python.org/3/reference/compound_stmts.html#if) statement:
> 续行发生在键入一个多行的语句块（这类块通常以 `:` 结尾）时，如if-else 块，此时键入 if 行后直接回车，就会进入续行模式，可以看到提示符发生变化（之后的语句不要忘记 Python 的缩进问题）。
> 
> 在完成多行的语句块编写后，连续两次回车后就可以退出多行语句块的编写。

```
>>> the_world_is_flat = True
>>> if the_world_is_flat:
...     print("Be careful not to fall off!")
...
Be careful not to fall off!
```

For more on interactive mode, see [Interactive Mode](https://docs.python.org/3/tutorial/appendix.html#tut-interac).

## 2.2. The Interpreter and Its Environment

### 2.2.1. Source Code Encoding

By default, Python source files are treated as encoded in UTF-8. In that encoding, characters of most languages in the world can be used simultaneously[^5] in string literals, identifiers and comments — although the standard library only uses ASCII characters for identifiers, a convention that any portable code should follow. To display all these characters properly, your editor must recognize that the file is UTF-8, and it must use a font that supports all the characters in the file.
> 默认情况下 Python 源文件使用 UTF-8 编码，在这种编码中，世界上大多数语言的字符都可以在字符串字面量、标识符和注释中同时使用，尽管**标准库只在标识符中使用 ASCII 字符**——这是任何可移植代码都应遵循的惯例。
> 
> 因此，要成功显示UTF-8 编码，需要编辑器能够识别、字体能够支持它。

To declare an encoding other than the default one, a special comment line should be added as the _first_ line of the file. The syntax is as follows:
> 为了标明当前文件的编码方式（只要不是 UTF-8 都要表明），就需要在文件第一行用特殊的注释注明。

```python
# -*- coding: encoding -*-
```

where _encoding_ is one of the valid [`codecs`]( https://docs.python.org/3/library/codecs.html#module-codecs "codecs: Encode and decode data and streams.") supported by Python.
> 这里 *encoding* 应当是 Python 支持的合法编码方式（默认为 UTF-8）。

For example, to declare that Windows-1252 encoding is to be used, the first line of your source code file should be:

```python
# -*- coding: cp1252 -*-
```

One exception to the _first line_ rule is when the source code starts with a [UNIX “shebang” line](https://docs.python.org/3/tutorial/appendix.html#tut-scripts). In this case, the encoding declaration should be added as the second line of the file. For example:
> 一般而言 Python 脚本的第一行都以编码方式开始，除非你使用 Unix 系统——如果 Python 脚本可以像shell 脚本一样直接执行，那么第一行要注明解释器的路径、版本，并且一定要以 `#!` 开头。

```
#!/usr/bin/env python3
# -*- coding: cp1252 -*-
```

[^1]: On Unix, the Python 3.x interpreter is by default not installed with the executable named `python`, so that it does not conflict with a simultaneously installed Python 2.x executable.
[^2]: 意为“（电子设备或汽车）发出哔哔声”
[^3]: 什么是 tty 设备？——[[What-is-tty-in-Linux？]]
[^4]: shell 的 -c 选项是什么含义？——command
[^5]: 意为“同时”