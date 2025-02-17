make 命令执行时，需要一个 makefile 文件，以告诉 make 命令需要怎么样的去编译和链接程序。

首先，我们用一个示例来说明 makefile 的书写规则，以便给大家一个感性认识。这个示例来源于 gnu 的 make 使用手册，在这个示例中，我们的工程有 8 个 c 文件，和 3 个头文件，我们要写一个 makefile 来告诉 make 命令如何编译和链接这几个文件。

我们的规则是：
1.  如果这个工程没有编译过，那么我们的所有 c 文件都要编译并被链接。
2.  如果这个工程的某几个 c 文件被修改，那么我们只编译被修改的 c 文件，并链接目标程序。
3.  如果这个工程的头文件被改变了，那么我们需要编译引用了这几个头文件的 c 文件，并链接目标程序。

只要我们的 makefile 写得够好，所有的这一切，我们只用一个 make 命令就可以完成，make 命令会自动智能地根据当前的文件修改的情况来确定哪些文件需要重编译，从而自动编译所需要的文件和链接目标程序。

## makefile 的规则
---------------------------------

在讲述这个 makefile 之前，还是让我们先来粗略地看一看 makefile 的规则。

```makefile
target ... : prerequisites ...
    recipe
    ...
    ...
```

- *target*：可以是一个 object file（目标文件），也可以是一个可执行文件，还可以是一个标签（label）。对于标签这种特性，在后续的 “伪目标” 章节中会有叙述。
- *prerequisites*：生成该 target 所依赖的文件和 `/` 或 target。
- *recipe*：该 target 要执行的命令（任意的 shell 命令）。

这是一个文件的依赖关系，也就是说，target 这一个或多个的目标文件依赖于 prerequisites 中的文件，其生成规则定义在 command 中。说白一点就是说：`prerequisites 中如果有一个以上的文件比 target 文件要新的话，recipe 所定义的命令就会被执行`。

这就是 makefile 的规则，也就是 makefile 中最核心的内容。

说到底，makefile 的东西就是这样一点，好像我的这篇文档也该结束了。呵呵。还不尽然，这是 makefile 的主线和核心，但要写好一个 makefile 还不够，我会在后面一点一点地结合我的工作经验给你慢慢道来。内容还多着呢。:)

## 一个示例
-------------------------

正如前面所说，如果一个工程有 3 个头文件和 8 个 C 文件，为了完成前面所述的那三个规则，我们的 makefile 应该是下面的这个样子的。

```
edit : main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o
    cc -o edit main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o

main.o : main.c defs.h
    cc -c main.c
kbd.o : kbd.c defs.h command.h
    cc -c kbd.c
command.o : command.c defs.h command.h
    cc -c command.c
display.o : display.c defs.h buffer.h
    cc -c display.c
insert.o : insert.c defs.h buffer.h
    cc -c insert.c
search.o : search.c defs.h buffer.h
    cc -c search.c
files.o : files.c defs.h buffer.h command.h
    cc -c files.c
utils.o : utils.c defs.h
    cc -c utils.c
clean :
    rm edit main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o
```

反斜杠（ `\` ）是换行符的意思。这样比较便于 makefile 的阅读。我们可以把这个内容保存在名字为 “makefile” 或“Makefile”的文件中，然后在该目录下直接输入命令 `make` 就可以生成执行文件 edit。如果要删除可执行文件和所有的中间目标文件，那么，只要简单地执行一下 `make clean` 就可以了。

在这个 makefile 中，目标文件（target）包含：可执行文件 `edit` 和中间目标文件（ `*.o ` ），依赖文件（prerequisites）就是冒号后面的那些 `.c ` 文件和 `.h ` 文件。每一个 `.o ` 文件都有一组依赖文件，而这些 `.o ` 文件又是可执行文件 ` edit ` 的依赖文件。依赖关系的实质就是说明了目标文件是由哪些文件生成的，换言之，目标文件是哪些文件更新的。

在定义好依赖关系后，后续的 recipe 行定义了如何生成目标文件的操作系统命令，一定要以一个 `Tab` 键作为开头。记住，make 并不管命令是怎么工作的，他只管执行所定义的命令。make 会比较 targets 文件和 prerequisites 文件的修改日期，如果 prerequisites 文件的日期要比 targets 文件的日期要新，或者 target 不存在的话，那么，make 就会执行后续定义的命令。

这里要说明一点的是， `clean` 不是一个文件，它只不过是一个动作名字，有点像 C 语言中的 label 一样，其冒号后什么也没有，那么，make 就不会自动去找它的依赖项，也就不会自动执行其后所定义的命令。要执行其后的命令，就要在 make 命令后显式地指出这个 label 的名字。这样的方法非常有用，我们可以在一个 makefile 中定义不用的编译或是和编译无关的命令，比如程序的打包，程序的备份，等等。

## make 是如何工作的
---------------------------------

在默认的方式下，也就是我们只输入 `make` 命令。那么，
1.  make 会在当前目录下找名字叫 “Makefile” 或“makefile”的文件。
2.  如果找到，它会找文件中的第一个目标文件（target），在上面的例子中，他会找到 “edit” 这个文件，并把这个文件作为最终的目标文件。
3.  如果 edit 文件不存在，或是 edit 所依赖的后面的 `.o` 文件的文件修改时间要比 `edit` 这个文件新，那么，他就会执行后面所定义的命令来生成 `edit` 这个文件。
4.  如果 `edit` 所依赖的 `.o` 文件也不存在，那么 make 会在当前文件中找目标为 `.o` 文件的依赖项，如果找到则再根据那一个规则生成 `.o` 文件。（想象一下栈的运行过程）
5.  当然，你的 C 文件和头文件是存在的啦，于是 make 会生成 `.o` 文件，然后再用 `.o` 文件生成 make 的终极任务，也就是可执行文件 `edit` 了。

这就是整个 make 的依赖项，make 会一层又一层地去找文件的依赖关系，直到最终编译出第一个目标文件。在找寻的过程中，如果出现错误，比如最后被依赖的文件找不到，那么 make 就会直接退出，并报错，而对于所定义的命令的错误，或是编译不成功，make 根本不理。make 只管文件的依赖项。

通过上述分析，我们知道，像 clean 这种，没有被第一个目标文件直接或间接关联，那么它后面所定义的命令将不会被自动执行，不过，我们可以显示地要求 make 执行。即—— `make clean` ，以此来清除所有的目标文件，以便重编译。

于是在我们编程中，如果这个工程已被编译过了，当我们修改了其中一个源文件，比如 `file.c` ，那么根据我们的依赖性，我们的目标 `file.o` 会被重编译（也就是在这个依性关系后面所定义的命令），于是 `file.o` 的文件也是最新的啦，于是 `file.o` 的文件修改时间要比 `edit` 要新，所以 `edit` 也会被重新链接了（详见 `edit` 目标文件后定义的命令）。

而如果我们改变了 `command. h` ，那么， `kdb. o` 、 `command. o` 和 `files. o` 都会被重编译，并且， `edit` 会被重链接。

## makefile 中使用变量
-----------------------------------

在上面的例子中，先让我们看看 edit 的规则：

```
edit : main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o
    cc -o edit main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o
```

我们可以看到 `.o` 文件的字符串被重复了两次，如果我们的工程需要加入一个新的 `.o` 文件，那么我们需要在两个地方加（应该是三个地方，还有一个地方在 clean 中）。当然，我们的 makefile 并不复杂，所以在两个地方加也不累，但如果 makefile 变得复杂，那么我们就有可能会忘掉一个需要加入的地方，而导致编译失败。所以，为了 makefile 的易维护，在 makefile 中我们可以使用变量。makefile 的变量也是一个字符串，理解成 C 语言中的宏可能会更好。

比如，我们声明一个变量，叫 `objects` ， `OBJECTS` ， `objs` ， `OBJS` ， `obj` 或是 `OBJ` ，反正不管什么啦，只要能够表示 obj 文件就行了。我们在 makefile 一开始就这样定义：

```
objects = main.o kbd.o command.o display.o \
     insert.o search.o files.o utils.o
```

于是，我们就可以很方便地在我们的 makefile 中以 `$(objects)` 的方式来使用这个变量了，于是我们的改良版 makefile 就变成下面这个样子：

```
objects = main.o kbd.o command.o display.o \
    insert.o search.o files.o utils.o

edit : $(objects)
    cc -o edit $(objects)
main.o : main.c defs.h
    cc -c main.c
kbd.o : kbd.c defs.h command.h
    cc -c kbd.c
command.o : command.c defs.h command.h
    cc -c command.c
display.o : display.c defs.h buffer.h
    cc -c display.c
insert.o : insert.c defs.h buffer.h
    cc -c insert.c
search.o : search.c defs.h buffer.h
    cc -c search.c
files.o : files.c defs.h buffer.h command.h
    cc -c files.c
utils.o : utils.c defs.h
    cc -c utils.c
clean :
    rm edit $(objects)
```

于是如果有新的 `.o` 文件加入，我们只需简单地修改一下 `objects` 变量就可以了。

关于变量更多的话题，我会在后续给你一一道来。

## 让 make 自动推导
--------------------------------

GNU 的 make 很强大，它可以自动推导文件以及文件依赖关系后面的命令，于是我们就没必要去在每一个 `.o` 文件后都写上类似的命令，因为，我们的 make 会自动识别，并自己推导命令。

只要 make 看到一个 `.o` 文件，它就会自动的把 `.c` 文件加在依赖关系中，如果 make 找到一个 `whatever.o` ，那么 `whatever.c` 就会是 `whatever.o` 的依赖文件。并且 `cc -c whatever.c` 也会被推导出来，于是，我们的 makefile 再也不用写得这么复杂。我们的新 makefile 又出炉了。

```
objects = main.o kbd.o command.o display.o \
    insert.o search.o files.o utils.o

edit : $(objects)
    cc -o edit $(objects)

main.o : defs.h
kbd.o : defs.h command.h
command.o : defs.h command.h
display.o : defs.h buffer.h
insert.o : defs.h buffer.h
search.o : defs.h buffer.h
files.o : defs.h buffer.h command.h
utils.o : defs.h

.PHONY : clean
clean :
    rm edit $(objects)
```

这种方法就是 make 的 “隐式规则”。上面文件内容中， `.PHONY` 表示 `clean` 是个伪目标文件。

关于更为详细的 “隐式规则” 和“伪目标文件”，我会在后续给你一一道来。

## makefile 的另一种风格
------------------------------------

既然我们的 make 可以自动推导命令，那么我看到那堆 `.o` 和 `.h` 的依赖就有点不爽，那么多的重复的 `.h` ，能不能把其收拢起来，好吧，没有问题，这个对于 make 来说很容易，谁叫它提供了自动推导命令和文件的功能呢？来看看最新风格的 makefile 吧。

```
objects = main.o kbd.o command.o display.o \
    insert.o search.o files.o utils.o

edit : $(objects)
    cc -o edit $(objects)

$(objects) : defs.h
kbd.o command.o files.o : command.h
display.o insert.o search.o files.o : buffer.h

.PHONY : clean
clean :
    rm edit $(objects)
```

这里 `defs.h` 是所有目标文件的依赖文件， `command.h` 和 `buffer.h` 是对应目标文件的依赖文件。

这种风格能让我们的 makefile 变得很短，但我们的文件依赖关系就显得有点凌乱了。鱼和熊掌不可兼得。还看你的喜好了。我是不喜欢这种风格的，一是文件的依赖关系看不清楚，二是如果文件一多，要加入几个新的 `.o` 文件，那就理不清楚了。

## 清空目录的规则
----------------------------

每个 Makefile 中都应该写一个清空目标文件（ `.o` ）和可执行文件的规则，这不仅便于重编译，也很利于保持文件的清洁。这是一个 “修养”。一般的风格都是：

```
clean:
    rm edit $(objects)
```

更为稳健的做法是：

```
.PHONY : clean
clean :
    -rm edit $(objects)
```

前面说过， `.PHONY` 表示 `clean` 是一个 “伪目标”。而在 `rm` 命令前面加了一个**小减号的意思是，也许某些文件出现问题，但不要管，继续做后面的事**。当然， `clean` 的规则不要放在文件的开头，不然，这就会变成 make 的默认目标，相信谁也不愿意这样。不成文的规矩是——“clean 从来都是放在文件的最后”。

上面就是一个 makefile 的概貌，也是 makefile 的基础，下面还有很多 makefile 的相关细节，准备好了吗？准备好了就来。

## Makefile 里有什么？
----------------------------------

Makefile 里主要包含了五个东西：显式规则、隐式规则、变量定义、指令和注释。

1.  显式规则。显式规则说明了如何生成一个或多个目标文件。这是由 Makefile 的书写者明显指出要生成的文件、文件的依赖文件和生成的命令。
2.  隐式规则。由于 make 有自动推导的功能，所以隐式规则可以让我们比较简略地书写 Makefile，这是由 make 所支持的。
3.  变量的定义。在 Makefile 中我们要定义一系列的变量，变量一般都是字符串，这个有点像你 C 语言中的宏，当 Makefile 被执行时，其中的变量都会被扩展到相应的引用位置上。
4.  指令。其包括了三个部分，一个是在一个 Makefile 中引用另一个 Makefile，就像 C 语言中的 include 一样；另一个是指根据某些情况指定 Makefile 中的有效部分，就像 C 语言中的预编译 `#if` 一样；还有就是定义一个多行的命令。有关这一部分的内容，我会在后续的部分中讲述。
5.  注释。Makefile 中只有行注释，和 UNIX 的 Shell 脚本一样，其注释是用 `#` 字符，这个就像 C/C++ 中的 `//` 一样。如果你要在你的 Makefile 中使用 `#` 字符，可以用反斜杠进行转义，如： `\#` 。

最后，还值得一提的是，在 Makefile 中的命令，必须要以 `Tab` 键开始。

## Makefile 的文件名
----------------------------------

默认的情况下，make 命令会在当前目录下按顺序寻找文件名为 `GNUmakefile` 、 `makefile` 和 `Makefile` 的文件。在这三个文件名中，最好使用 `Makefile` 这个文件名，因为这个文件名在排序上靠近其它比较重要的文件，比如 `README`。最好不要用 `GNUmakefile`，因为这个文件名只能使用 `GNU make` ，其它版本的 ` make ` 无法识别，但是基本上来说，大多数的 ` make ` 都支持 ` makefile ` 和 ` Makefile ` 这两种默认文件名。

当然，你可以使用别的文件名来书写 Makefile，比如：`Make.Solaris`，`Make.Linux` 等，如果要指定特定的 Makefile，你可以使用 make 的 ` -f ` 或 ` --file ` 参数，如： ` make -f Make.Solaris ` 或 ` make --file Make.Linux ` 。如果你使用多条 ` -f ` 或 ` --file ` 参数，你可以指定多个 makefile。

## 包含其它 Makefile
---------------------------------

在 Makefile 使用 `include` 指令可以把别的 Makefile 包含进来，这很像 C 语言的 `#include` ，被包含的文件会**原模原样的放在当前文件的包含位置**。 `include` 的语法是：
```makefile
include <filename>
```

`<filenames>` 可以是当前操作系统 Shell 的文件模式（可以包含路径和通配符）。

在 `include` 前面可以有一些空字符，但是**绝不能是** `Tab` 键开始。 `include` 和 `<filenames>` 可以用一个或多个空格隔开。举个例子，你有这样几个 Makefile： `a.mk` 、 `b.mk` 、 `c.mk` ，还有一个文件叫 `foo.make` ，以及一个变量 `$(bar)` ，其包含了 `bish` 和 `bash` ，那么，下面的语句：

```
include foo.make *.mk $(bar)
```

等价于：

```
include foo.make a.mk b.mk c.mk bish bash
```

make 命令开始时，会找寻 `include` 所指出的其它 Makefile，并把其内容安置在当前的位置。就好像 C/C++ 的 `#include` 指令一样。如果文件都没有指定绝对路径或是相对路径的话，make 会在当前目录下首先寻找，如果当前目录下没有找到，那么，make 还会在下面的几个目录下找：

1.  如果 make 执行时，有 `-I` 或 `--include-dir` 参数，那么 make 就会在这个参数所指定的目录下去寻找。
2.  接下来按顺序寻找目录 `<prefix>/include` （一般是 `/usr/local/bin` ）、 `/usr/gnu/include` 、 `/usr/local/include` 、 `/usr/include` 。)

环境变量 `.INCLUDE_DIRS` 包含当前 make 会寻找的目录列表。你应当避免使用命令行参数 `-I` 来寻找以上这些默认目录，否则会使得 `make` “忘掉” 所有已经设定的包含目录，包括默认目录。

如果有文件没有找到的话，make 会生成一条警告信息，但不会马上出现致命错误。它会继续载入其它的文件，一旦完成 makefile 的读取，make 会再重试这些没有找到，或是不能读取的文件，如果还是不行，make 才会出现一条致命信息。如果你想让 make 不理那些无法读取的文件，而继续执行，你可以在 include 前加一个减号 “-”。如：
```makefile
-include <filename>
```

其表示，无论 include 过程中出现什么错误，都不要报错继续执行。如果要和其它版本 `make` 兼容，可以使用 `sinclude` 代替 `-include` 。

## 环境变量 MAKEFILES
----------------------------------------

如果你的当前环境中定义了环境变量 `MAKEFILES` ，那么 make 会把这个变量中的值做一个类似于 `include` 的动作。这个变量中的值是其它的 Makefile，用空格分隔。只是，它和 `include` 不同的是，从这个环境变量中引入的 Makefile 的 “目标” 不会起作用，如果环境变量中定义的文件发现错误，make 也会不理。

但是在这里我还是建议不要使用这个环境变量，因为只要这个变量一被定义，那么当你使用 make 时，所有的 Makefile 都会受到它的影响，这绝不是你想看到的。在这里提这个事，只是为了告诉大家，也许有时候你的 Makefile 出现了怪事，那么你可以看看当前环境中有没有定义这个变量。

## make 的工作方式
--------------------------------

GNU 的 make 工作时的执行步骤如下：

1.  读入所有的 Makefile。
2.  读入被 include 的其它 Makefile。
3.  初始化文件中的变量。
4.  推导隐式规则，并分析所有规则。
5.  为所有的目标文件创建依赖关系链。
6.  根据依赖关系，决定哪些目标要重新生成。
7.  执行生成命令。

1-5 步为第一个阶段，6-7 为第二个阶段。第一个阶段中，如果定义的变量被使用了，那么，make 会把其展开在使用的位置。但 make 并不会完全马上展开，make 使用的是拖延战术，如果变量出现在依赖关系的规则中，那么仅当这条依赖被决定要使用了，变量才会在其内部展开。

当然，这个工作方式你不一定要清楚，但是知道这个方式你也会对 make 更为熟悉。有了这个基础，后续部分也就容易看懂了。