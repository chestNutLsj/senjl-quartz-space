## 这本书 “是什么”和“不是什么”

本书包括三大部分：
- C 语言入门。介绍基本的 C 语法，帮助没有任何编程经验的读者理解什么是程序，怎么写程序，培养程序员的思维习惯，找到编程的感觉。前半部分改编自 ThinkCpp[^1]
- C 语言本质。结合计算机和操作系统的原理讲解 C 程序是怎么编译、链接、运行的，同时全面介绍 C 的语法。位运算的章节改编自亚嵌教育林小竹老师的讲义。汇编语言的章节改编自 GroudUp[^2]，在这本书的最后一章提到，学习编程有两种 Approach，一种是 Bottom Up，一种是 Top Down，各有优缺点，需要两者结合起来。所以我编这本书的思路是，第一部分 Top Down，第二部分 Bottom Up，第三部分可以算填了中间的空隙，三部分全都围绕 C 语言展开。
- Linux 系统编程。介绍各种 Linux 系统函数和内核的工作原理。Socket 编程的章节改编自亚嵌教育卫剑钒老师的讲义。

## 为什么要在 Linux 平台上学 C 语言？用 Windows 学 C 语言不好吗？

用 Windows 还真的是学不好 C 语言。C 语言是一种面向底层的编程语言，要写好 C 程序，必须对操作系统的工作原理非常清楚，因为操作系统也是用 C 写的，我们用 C 写应用程序直接使用操作
系统提供的接口。既然你选择了看这本书，你一定了解：Linux 是一种开源的操作系统，你有任何疑问都可以从源代码和文档中找到答案，即使你看不懂源代码，也找不到文档，也很容易找个高手教你，各种邮件列表、新闻组和论坛上从来都不缺乐于助人的高手；而 Windows 是一种封闭的操作系统，除了微软的员工别人都看不到它的源代码，只能通过文档去猜测它的工作原理，更糟糕的是，微软向来喜欢藏着揶着，好用的功能留着自己用，而不会写到文档里公开。本书的第一部分在 Linux 或 Windows 平台上学习都可以，但第二部分和第三部分介绍了很多 Linux 操作系统的原理以帮助读者更深入地理解 C 语言，只能在 Linux 平台上学习。

Windows 平台上的开发工具往往和各种集成开发环境（IDE，Integrated Development Environment）绑在一起，例如 Visual Studio、Eclipse 等。使用 IDE 确实很便捷，但 IDE 对于初学者绝对不是好东西。微软喜欢宣扬傻瓜式编程的理念，告诉你用鼠标拖几个控件，然后点一个按钮就可以编译出程序来，但是真正有用的程序有哪个是这么拖出来的？很多从 Windows 平台入门学编程的人，编了好几年程序，还是只知道编完程序点一个按钮就可以跑了，把几个源文件拖到一个项目里就可以编译到一起了，如果有更复杂的需求他们就傻眼了，因为他们脑子里只有按钮、菜单的概念，根本没有编译器、链接器、Makefile 的概念，甚至连命令行都没用过，然而这些都是初学编程就应该建立起来的基本概念。另一方面，编译器、链接器和 C 语言的语法有密切的关系，不了解编译器、链接器的工作原理，也不可能真正掌握 C 的语法。所以，IDE 并没有帮助你学习，而是阻碍了你学习，本来要学好 C 编程只要把语法和编译命令学会就行了，现在有了 IDE，除了学会语法和编译命令，你还得弄清楚编译命令和 IDE 是怎么集成的，这才算学明白了，本来就很复杂的学习任务被 IDE 搞得更加复杂了。Linux 用户的使用习惯从来都是以敲命令为主，以鼠标操作为辅，从学编程的第一天起就要敲命令编译程序，等到你把这些基本概念都搞清楚了，你觉得哪个 IDE 好用你再去用，不过到那时候你可能会更喜欢 vi 或 emacs 而不是 IDE 了。