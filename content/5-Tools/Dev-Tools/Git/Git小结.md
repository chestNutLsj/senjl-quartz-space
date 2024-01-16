## 1. 什么是Git？

### 1.1 什么是版本控制？

版本控制是一种记录文件内容变化，以便将来查阅特定版本修订情况的系统。

版本控制最重要的是可以记录文件修改历史记录，从而让用户能够查看历史版本，方便版本切换。

### 1.2 集中式版本控制工具 VS. 分布式版本控制工具

#### 集中式版本控制工具
  * CVS、SVN、VSS
  * 有一个单一的集中管理的服务器，保存所有文件的修订版本，而协同工作的人们都通过客户端连到这台服务器，取出最新的文件或者提交更新。
  * 好处：每个人都在一定程度上看到项目中其他人正在做什么，而管理员可以轻松掌握每个开发者的权限，并且管理一个集中化的版本控制系统，要远比在各个客户端上维护本地数据库更容易；
  * 坏处：中央服务器单点故障会影响所有人；并且无法协同工作；
  * ![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/集中式.png)

#### 分布式版本控制工具
  * Git、Mercurial、Bazaar、Darcs...
  * 客户端不是提取最新版本的文件快照，而是将代码完整地镜像（克隆）下来，这样任何一处协同工作用的文件发生故障，事后都可以用其他客户端的本地仓库进行恢复；

  * ![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/分布式.png)


### 1.3 Git

* Git是一个开源的分布式版本控制系统，可以有效、高速的处理从很小到非常大的项目版本管理。

	Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.

*  Git是Linus Torvalds为了帮助管理Linux内核开发而开发的一个开放源码的版本控制软件，这也意味着，在`git bash`中所有`linux shell`中的命令都可以使用；

* Git is easy to learn and has a tiny footprint with lightning fast performance. It outclasses SCM tools like Subversion, CVS, Perforce, and ClearCase with features like cheap local branching, convenient staging areas, and multiple workflows.

* 它采用了分布式版本库的方式，不必服务器端软件支持，使得源代码的发布和交流极其方便。其最出色的是合并跟踪merge tracing能力。

### 1.4 Git工作机制

![](https://www.runoob.com/wp-content/uploads/2015/02/git-process.png)

### 1.5 Git和代码托管中心

代码托管中心是基于网络服务器的远程代码仓库：

* 局域网：GitLab
* 互联网：GitHub、Gitee

## 2. Git安装

[Git官网](https://git-scm.com/)安装即可，本篇写作时最新版本为2.34.1


## 3. Git概念梳理及基本操作

Git工作区、暂存区、版本库的概念：
- **工作区**：电脑中能看到的文件夹下非隐藏的文件或子目录
- **暂存区**：存放在`.git`目录下的`index`(.git/index)文件中，亦可称之为索引
- **版本库**：工作区的隐藏目录`.git`。

![[git-workspace-index-version.png]]
- 图中左侧为工作区，右侧为版本库。在版本库中标记为 "index" 的区域是暂存区（stage/index），标记为 "master" 的是 master 分支所代表的目录树。
- 图中我们可以看出此时 "HEAD" 实际是指向 master 分支的一个"游标"。所以图示的命令中出现 HEAD 的地方可以用 master 来替换。
- 图中的 objects 标识的区域为 Git 的对象库，实际位于 ".git/objects" 目录下，里面包含了创建的各种对象及内容。
- 当对工作区修改（或新增）的文件执行 `git add` 命令时，暂存区的目录树被更新，同时工作区修改（或新增）的文件内容被写入到对象库中的一个新的对象中，而该对象的ID被记录在暂存区的文件索引中。
- 当执行提交操作（`git commit`）时，暂存区的目录树写到版本库（对象库）中，master 分支会做相应的更新。即 master 指向的目录树就是提交时暂存区的目录树。
- 当执行 `git reset HEAD` 命令时，暂存区的目录树会被重写，被 master 分支指向的目录树所替换，但是工作区不受影响。
- 当执行 `git rm --cached <file>`命令时，会直接从暂存区删除文件，工作区则不做出改变。
- 当执行` git checkout . `或者 `git checkout -- <file> `命令时，会用暂存区全部或指定的文件替换工作区的文件。这个操作很危险，会清除工作区中未添加到暂存区中的改动。
- 当执行 `git checkout HEAD . `或者 `git checkout HEAD <file> `命令时，会用 HEAD 指向的 master 分支中的全部或者部分文件替换暂存区和以及工作区中的文件。这个命令也是极具危险性的，因为不但会清除工作区中未提交的改动，也会清除暂存区中未提交的改动。

### 3.1 配置

#### 3.1.1 设置用户签名

```shell
git config --global user.name

git config --global user.emai
```

在任何一个地方打开`git bash`，输入以上两条命令设置全局签名。签名的作用是区分不同操作者的身份，而这个签名信息在每个版本的提交信息中都可以查看，以此区分本次提交来自于谁。如果去掉`--global`参数则只对当前仓库生效。

签名信息可以在当前用户家目录下查看：`~/.gitconfig`获知。

注意：这里设置的用户签名和之后登录GitHub的账号没有任何联系，仅作为提交本地代码时的签名。

#### 3.1.2 其他git的配置命令
1. 显示当前git的配置信息：`git config --list`；
2. 编辑git配置文件夹：
```shell
# 针对当前仓库
git config -e

# 针对系统上所有仓库
git config -e --global
```

### 3.2 基本操作及常用命令一览

![[git-operate.png]]

```shell
❯ git help  
用法：git [-v | --version] [--help] [-C <路径>] [-c <名称>=<取值>]  
          [--exec-path[=<路径>]] [--html-path] [--man-path] [--info-path]  
          [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]  
          [--git-dir=<路径>] [--work-tree=<路径>] [--namespace=<名称>]  
          [--super-prefix=<路径>] [--config-env=<名称>=<环境变量>]  
          <命令> [<参数>]  
  
这些是各种场合常见的 Git 命令：  
  
开始一个工作区（参见：git help tutorial）  
  clone     克隆仓库到一个新目录  
  init      创建一个空的 Git 仓库或重新初始化一个已存在的仓库  
  
在当前变更上工作（参见：git help everyday）  
  add       添加文件内容至索引  
  mv        移动或重命名一个文件、目录或符号链接  
  restore   恢复工作区文件  
  rm        从工作区和索引中删除文件  
  
检查历史和状态（参见：git help revisions）  
  bisect    通过二分查找定位引入 bug 的提交  
  diff      显示提交之间、提交和工作区之间等的差异  
  grep      输出和模式匹配的行  
  log       显示提交日志  
  show      显示各种类型的对象  
  status    显示工作区状态  
  
扩展、标记和调校您的历史记录  
  branch    列出、创建或删除分支  
  commit    记录变更到仓库  
  merge     合并两个或更多开发历史  
  rebase    在另一个分支上重新应用提交  
  reset     重置当前 HEAD 到指定状态  
  switch    切换分支  
  tag       创建、列出、删除或校验一个 GPG 签名的标签对象  
  
协同（参见：git help workflows）  
  fetch     从另外一个仓库下载对象和引用  
  pull      获取并整合另外的仓库或一个本地分支  
  push      更新远程引用和相关的对象  
  
命令 'git help -a' 和 'git help -g' 显示可用的子命令和一些概念帮助。  
查看 'git help <命令>' 或 'git help <概念>' 以获取给定子命令或概念的  
帮助。  
有关系统的概述，查看 'git help git'。
```


### 3.3 初始化本地库

`git init`

在本目录下新建一个空文件夹 gitTest，打开文件夹并右键打开`git bash`，使用`git init`初始化；

此时，该目录中就会出现 .git 文件夹，查看其中文件：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/init_result.png)

*简要讲解一下这里面文件及目录的作用：*

* 一个叫HEAD的文件，里面内容是`ref:refs/heads.master`，包含了一个索引信息，并且此索引总是指向项目中的当前开发分支；
* 一个叫objects的子目录，包含了项目中的所有对象，我们不必直接地了解到这些对象内容，我们应该关心的是存放在这些对象中的项目的数据；
* 一个叫refs的子目录，用来保存指向对象的索引。具体地说，子目录refs包含着两个子目录heads和tags，它们存放了不同的开发分支的头索引，或者是你用来标定版本的标签的索引。**要注意的是**，master是默认的分支，这也是为什么.git/HEAD创建的时候就指向master的原因，尽管目前它其实并不存在。git将假设你会在master上开始并展开你以后的工作，除非你创建你自己分支。另外，这是一个约定俗成的习惯，换言实际上可以将工作分支命名为任何名字，而不是一定叫做master。

### 3.2 查看本地库状态

`git status`

#### 3.2.1 首次查看

此时工作区（存放代码的存储设备区域）没有任何文件：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20status.png)

#### 3.2.2 新增一个文件并再次查看

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E6%96%B0%E5%A2%9E.png)

在其中随便写点什么；保存退出后再查看一下：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20status%20again.png)

注意到，第三行出现变化，显示"Untracked files: "，表示有文件未被追踪；

其中，hello git.txt 文件被标记为**红色**，这表示文件被保存在工作区，还未添加到暂存区；

### 3.4 添加暂存区

`git add file.name`

将 hello git.txt 添加到暂存区：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20add.png)

警告中 LF 表示Linux中的换行符，而 CRLF 是Windows中的换行符。

之后，`git status`的结果中原 hello git.txt 文件标记成**绿色**，这表示该文件已存放到暂存区，等待被提交(committed)。

其中，`(use "git rm --cached \<file>..." to unstage)`表示将文件从暂存区删除，但不删除工作区文件：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20rm.png)



### 3.5 提交本地库

`git commit -m "journal info" file.name`

将暂存区文件提交到本地库：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20commit.png)

其中，`c6c559c`是提交的版本号，通过`git status`查看状态信息，了解当前无新文件需要提交。`git reflog`和`git log`是两个查看日志信息的命令，前者是查看版本，后者是查看版本详细信息。

注意，log 信息中版本号是完整的，而之前所说及 reflog 信息中的版本号是其前七位。

> [!tip] git commit 的提交信息使用 "" or ''？
> 在 Linux 系统中，commit 信息使用单引号 'msg' ；在Windows 系统中，commit 信息使用双引号 "msg"。
> 而在 git bash 中 git commit -m 'commit message' 这样是可以的；在 Windows 命令行中就要使用双引号 git commit -m "commit message"。

### 3.6 修改文件

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E4%BF%AE%E6%94%B9.png)

这时，再查看 status 信息，获知 hello git.txt 文件又被标记为红色，这表明改动后文件被保存在工作区，还未添加到暂存区；

之后可以通过 3.5节 中的流程重新执行一遍，将改动文件提交到本地库：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E9%87%8D%E6%96%B0%E6%8F%90%E4%BA%A4.png)

再查看提交状态及日志信息：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E5%86%8D%E6%AC%A1%E6%8F%90%E4%BA%A4%E7%8A%B6%E6%80%81.png)

可以看到，reflog 中 HEAD 指针指向当前提交版本——f3a2ce5；

### 3.7 历史版本

#### 3.7.1 查看历史版本

`git reflog`

`git log`
- 可以添加`--online`选项查看简洁版本
- 使用`--graph`以拓扑图形式查看历史中什么时候出现了分支、合并
- `--reverse`逆向显示所有日志，
- `--author=coder-name`可以查看指定提交者的日志

`git blame <file>`

#### 3.7.2 版本穿梭

`git reset --hard version.num`

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20reset.png)

同时，查看工作区文件：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E5%B7%A5%E4%BD%9C%E5%8C%BA.png)

当然，能向前回滚到历史版本，也能再恢复到最新版本。

### 3.8 标签

[摘自菜鸟教程](https://www.runoob.com/git/git-tag.html)

` git tag`

如果你达到一个重要的阶段，并希望永远记住那个特别的提交快照，你可以使用 git tag 给它打上标签。

比如说，我们想为我们的 runoob 项目发布一个"1.0"版本。 我们可以用 git tag -a v1.0 命令给最新一次提交打上（HEAD）"v1.0"的标签。

-a 选项意为"创建一个带注解的标签"。 不用 -a 选项也可以执行的，但它不会记录这标签是啥时候打的，谁打的，也不会让你添加个标签的注解。所以推荐一直创建带注解的标签。

```shell
$ git tag -a v1.0 
```

当你执行 git tag -a 命令时，Git 会打开你的编辑器，让你写一句标签注解，就像commit 写的注解一样。

现在，注意当我们执行 git log --decorate 时，我们可以看到我们的标签了：
```shell
*   d5e9fc2 (HEAD -> master) Merge branch 'change_site'
|\  
| * 7774248 (change_site) changed the runoob.php
* | c68142b 修改代码
|/  
* c1501a2 removed test.txt、add runoob.php
* 3e92c19 add test.txt
* 3b58100 第一次版本提交
```

如果我们忘了给某个提交打标签，又将它发布了，我们可以给它追加标签。
例如，假设我们发布了提交 85fc7e7(上面实例最后一行)，但是那时候忘了给它打标签。 我们现在也可以：
```shell
$ git tag -a v0.9 85fc7e7
$ git log --oneline --decorate --graph
*   d5e9fc2 (HEAD -> master) Merge branch 'change_site'
|\  
| * 7774248 (change_site) changed the runoob.php
* | c68142b 修改代码
|/  
* c1501a2 removed test.txt、add runoob.php
* 3e92c19 add test.txt
* 3b58100 (tag: v0.9) 第一次版本提交
```

如果我们要查看所有标签可以使用以下命令：
```shell
$ git tag
v0.9
v1.0
```

指定标签信息命令：
```shell
git tag -a <tagname> -m "runoob.com标签"
```

PGP签名标签命令：
```shell
git tag -s <tagname> -m "runoob.com标签"
```

## 4. Git分支

### 4.1 什么是分支？

版本控制过程中，同时推进多个任务，为每个任务可以创建其单独分支。一个分支就是一个单独的副本。

**优点：**

* 使用分支意味着程序员可以把自己的工作从开发主线上分离开来，开发自己分支的时候不会影响主线分支的运行。
* 各个分支在开发中，如果一个开发失败，不会对其他分支有影响，失败的分支删除重新开始即可；

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E5%88%86%E6%94%AF.png)

### 4.2 分支的操作命令

| 命令名称                 | 作用                       |
| ------------------------ | -------------------------- |
| git branch branch.name   | 创建分支                   |
| git branch -v            | 查看分支                   |
| git checkout branch.name | 切换分支                   |
| git merge branch.name    | 把指定分支合并到当前分支上 |

#### 4.2.1 查看分支

`git branch -v`

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20branch-v.png)

#### 4.2.2 创建分支

`git branch branch.name`

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E5%88%86%E6%94%AF%E5%88%9B%E5%BB%BA.png)



#### 4.2.3 切换分支

`git checkout branch.name`

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20checkout.png)

#### 4.2.4 修改分支

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E4%BF%AE%E6%94%B9%E5%88%86%E6%94%AF.png)

这时，hello git.txt文件被修改，存放在工作区，而未添加到暂存区。

之后，将修改添加到暂存区并提交本地库

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E4%BF%AE%E6%94%B9%E5%90%8E%E7%8A%B6%E6%80%81.png)

此时，我们查看一下 hello git.txt中的内容：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E5%88%86%E6%94%AF%E5%86%85%E5%AE%B9.png)

注意到，此时仍然是在 hot-fix 分支上，那 master 主线上的文件被改动了吗？

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E4%B8%BB%E7%BA%BF%E5%86%85%E5%AE%B9.png)

可以看到，主线内容仍然是 version 0.2的内容，并没有随着分支的改变而改变。这也表明，主线和分支是相互独立的。

#### 4.2.5 合并分支

`git merge branch.name`

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20merge.png)

可以看到，hot-fix 版本的修改被合并到 master 主线上。

#### 4.2.6 产生冲突

合并分支时，两个分支在同一个文件的同一个位置有两套完全不同的修改，此时 Git 无法替我们决定使用哪一个，必须人为决定新代码内容。

我们试着同时修改 master 和 hot-fix 两个分支上 hello git.txt 的同一处内容：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/master%20test.png)

添加提交后，切换到 hot-fix 分支再修改一下：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/hot-fix%20test.png)

再次添加提交，此时，两个分支在同一个文件的同一处修改不同，直接合并就会产生冲突：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/conflict.png)

可以看到，自动合并失败，有一处冲突在 hello git.txt 文件中，且工作分支状态改动为 `master|MERGING` ，这表示正在合并中；

报错信息`both modified: hello git.txt`说明，两个分支都作了同一处修改，这时，就需要自己手动修改。

#### 4.2.7 解决冲突

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E6%89%8B%E5%8A%A8%E8%A7%A3%E5%86%B3.png)

- `<<<<<<< HEAD` 与 `=======` 之间的，是 master 分支修改的内容，
- `======= `与 `>>>>>>> hot-fix` 之间的，是 hot-fix 分支修改的内容；

我们进行手动修改并删除标记符（也可以使用`git diff`工具）。最后进行添加提交步骤。

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E8%A7%A3%E5%86%B3%E5%86%B2%E7%AA%81.png)

注意，在添加到暂存区后准备提交到本地库时， commit 命令不能再带文件名，而是直接提交日志信息即可。

这时，再查看一下 master 分支上的状态及日志信息：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E8%A7%A3%E5%86%B3%E5%86%B2%E7%AA%81%E5%90%8E.png)

## 5. Git团队协作

### 5.1 团队内协作

这一段讲解在B站课程[Git_团队协作](https://b23.tv/Pg6BvFf)，感觉到抽象的地方可以去聆听一番。

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E5%9B%A2%E9%98%9F%E5%86%85%E5%8D%8F%E4%BD%9C.png)

### 5.2 跨团队合作

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/%E8%B7%A8%E5%9B%A2%E9%98%9F%E5%8D%8F%E4%BD%9C.png)

## 6. GitHub操作

注册账号什么的就略过了。。我这里引用GitHub官方的使用教程及尚硅谷的课程笔记。

### 6.1 What is GitHub?

Github is a code hosting platform for version control and collaboration. It lets you and others work together on project from anywhere.

### 6.2 Create a Repository

#### 6.2.1 What is a repo?

A **repository** is usually used to organize a single project. Repositories can contain folders and files, images, videos, spreadsheets, and data sets - anything your project needs.

It is recommended to include a README, or a file with information about your project. GitHub makes it easy to add one at the same time you create your new repository. It also offers other common options such as a license file.

#### 6.2.2 Create a new repo

1. In the upper right corner, next to your avatar or identification, click "+" and then select New repository.
2. Name your repository.
3. Write a short description.
4. Then, select the **Public** authority.
5. Select **Initialize this repository with a README**.
6. Click **Create repository**.

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git-demo.png)

### 6.3 operate remote repo

| command name                       | action                                                 |
| ---------------------------------- | ------------------------------------------------------ |
| git remote -v                      | 查看当前所有远程地址别名                               |
| git remote add 别名 远程地址       | 起别名                                                 |
| git push 别名 分支                 | 推送本地分支上的内容到远程仓库                         |
| git clone 远程地址                 | 将远程仓库的内容克隆到本地                             |
| git pull 远程库地址别名 远程分支名 | 将远程仓库对于分支最新内容拉取后与当前本地分支直接合并 |

#### 6.3.1 创建远程仓库别名

`git remote -v`

`git remote add alias remote-repo.address`

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20remote.png)

这里出现了两个别名，一个用来拉取，一个用来推送。

#### 6.3.2 推送本地分支到远程仓库

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20push.png)

因为写作时GitHub已经不再支持使用密码来 push ，需要使用 HTTPS 协议则要申请 Token ，需要使用 SSH 协议则要配置 SSH Key。因为笔者先配置了 SSH Key，就先用 SSH 协议演示了（HTTPS协议同理

（额，上面截图有个问题是，笔者把ssh写成ssl了，笔误，请谅解。）

这时，打开GitHub的git-demo仓库，就可以看到被推送上去的 hello git.txt：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git-remote.png)

#### 6.3.3 拉取远程仓库内容到本地

`git pull 远程库别名 本地分支`

我们先直接在GitHub上对 hello git.txt 进行修改，然后将远程库的内容拉取到本地：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20pull.png)

#### 6.3.4 克隆远程仓库到本地

`git clone 远程地址`

在本地一个空文件夹里（笔者选择笔记目录下新建gitTest_clone目录）打开 `git bash` ，开始克隆：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20clone.png)

注意，clone 不需要进行 `git init`，并且 clone 产生的结果是一个完整的文件夹。

如果clone时有这样的报错：`Proxy CONNECT absorted.`其原因是没有单独为Git配置代理：

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/git%20https.png)

注意端口号设置成自己VPN的入站端口。其他报错请自行查找资料。

### 6.4 GitHub操作

如果在GitHub中直接操作，基本上都是在图形化的浏览器中，只需要点点鼠标即可。

#### 6.4.1Create a Branch

**Branching** is the way to work on different versions of a repository at one time.

By default your repository has one branch named `main` , which is considered to be the definitive branch. We use branches to experiment and make edits before committing them to `main`.

When you create a branch off the `main` branch, you're making a copy (or a snapshot) of `main` as it was at that point in time. If someone else made changes to the `main` branch while you were working on your branch, you could pull in those updates.

Illstrations:

- The `main` branch.
- A new branch called `feature` to do "feature work" on it.
- The journey that `feature` takes before it's merged into `main`.

Branches accomplish similar goals in Github repositories. Here at Github, developers, writers, and designers use branches for keeping bug fixes and feature work separate from `main` branch. When a change is ready, they merge their branch into `main`.

**To create a new branch**

1. Go to your new repository `hello-world`.
2. Click the drop down at the top of the file list that says **branch: main**.
3. Type a branch name, `readme-edits`, into the new branch text box.
4. Select the blue **Create branch** box or hit <kbd>Enter</kbd>on your keyboard.

Now, there are two branches, `main` and `readme-edits` . They look exactly the same, but not for long. Next we'll add some changes to the new branch.

#### 6.4.2 Make a Commit

Now, we're on the code view for `readme-edits` branch, which copied from `main`. Then make some edits.

On Github, saved changes are called *commits*. Each commit has an associated *commit* message, which is a description explaining why a particualr change was made.

#### 6.4.3 Make and commit changes

1. Click the `README.md` file.
2. Click the pencil icon in the upper right corner of the file view to edit.
3. Edit it.
4. Write a commit message that describes your changes.
5. Click **Commit changes** button.

These changes will be made to just the README file on `readme-edits` branch, so now this branch contains content that's different from `main`.

#### 6.4.4 Open a Pull Request

*Pull Requests* are the heart of collaboration on Github. When you open a *pull request*, you're proposing your changes and requesting that someone review and pull in your contribution and merge them into their branch. 

Pull requests show *diffs*, or differences, of the content from both branches. The changes, additions, and subtractions are shown in green and red.

As soon as you make a commit, you can open a pull request and start a discussion, even before the code is finished.

By using Github's *@mention system* in your pull request message, you can ask for feedback from specific people or teams, whether they're down the hall or 10 time zones away.

You can even pull requests in your own repository and merge them yourself. It's a great way to learn the Github flow before working on larger projects.

#### 6.4.5 Open a Pull Request for changes to the README

1. Click the **Pull Request** tab, then from the Pull Request page, click the green **New pull request** button.
2. In the **Example Comparison** box, select the branch you made, `readme-edits`, to compare with `main`.
3. Look over your changes in the diffs on the Compare page, make sure they're what you want to submit.
4. When you're satisfied that these are the changes you want to submit, click the big green **Create Pull Request** button.
5. Give your pull request a title and write a brief description of your changes.

When you're done with your message, click **Create pull request!**

#### 6.4.6 Merge Pull Request

Finally, it's time to bring your changes together - merging your `readme-edits` branch into the `main` branch.

1. Click the green **Merge pull request** button to merge the changes into `main`.
2. Click **Confirm merge**.
3. Go ahead and delete the branch, since its changes have been incorporated, with the **Delete branch** button in the purple box.

### 6.5 团队协作

照搬尚硅谷的教程，具体细节可以查看其[B站视频](https://www.bilibili.com/video/BV1vy4y1s7k6?p=24)。

#### 6.5.1 团队内协作

1. 选择邀请合作者

   ![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/6411.png)

2. 填入想要合作的人

   ![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/6412.png)

3. 复制地址并通过微信、钉钉等方式发送给该客户，复制内容如下：

   ![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/6413.png)

4. 在 atguigulinghuchong 这个账号中的地址栏复制收到邀请的链接，点击接受邀请

   ![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/6414.png)

5. 成功后可以在 atguigulinghuchong 这个账号上看到git-Test的远程仓库

6. 令狐冲可以修改内容并push到远程仓库

7. 回到atguiguyueyue 的GitHub远程仓库中可以看到，最后一次时lhc提交的

#### 6.5.2 跨团队合作

1. 将远程仓库的地址复制发给邀请跨团队协作的人，如东方不败；
2. 在东方不败的GitHub账号里的地址栏复制收到的链接，然后点击Fork将项目叉到自己的本地仓库
3. 东方不败就可以在线编辑fork来的文件
4. 编辑完毕后，填写描述信息并点击左下角绿色 Commit changes
5. 回到岳岳的GitHub账号可以看到一个Pull request请求，下面是聊天室可以交流代码内容
6. 如果代码没有问题，可以点击Merge pull reque合并代码

### 6.6 SSH免密登录

这个在升佬的博客里有详细的教程：[使用GitHub和HEXO的博客搭建过程 - Reverier's Blog](https://blog.woooo.tech/2019/08/18/使用GitHub和HEXO的博客搭建过程/)——其中GitHub账号配置部分。

### 6.7 申请个人Token

在GitHub个人主页下Settings页面，找到下面Developer Setting，选择其中Personal access tokens，创建一个新的Token；

根据需要填写相应选项，如有疑惑可以查看GitHub官方的Token文档：[Scopes for OAuth Apps - GitHub Docs](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)

记得保存个人的Token密钥，之后需要输入GitHub密码的地方用此密钥代替即可。

## 7. IDEA集成Git

### 7.1 配置Git忽略文件

IDEA、Maven等软件中存在一些特定文件，这些文件需要忽略。

1. 为什么要忽略它们？

   与项目的实际功能无关，不参与服务器上部署运行。把它们忽略掉能够屏蔽IDE工具之间的差距。

2. 怎么忽略？

   * 创建忽略规则文件 git.ignore，并存放在用户家目录下：

     ```
     # Compiled class file
     *.class
     
     # Log file
     *.log
     
     # BlueJ files
     *.ctxt
     
     # Mobile Tools for Java (J2ME)
     .mtj.tmp/
     
     # Package Files #
     *.jar
     *.war
     *.nar
     *.ear
     *.zip
     *.tar.gz
     *.rar
     
     # virtual machine crash logs, see http://www.java.com/en/download/help/error_hotspot.xml
     hs_err_pid*
     
     .classpath
     .project
     .settings
     target
     .idea
     *.iml
     ```

   * 在~/.gitconfig文件中引用忽略配置文件：

     ```
     [user]
     	name = chestNutLsj
     	email = 1821552335@qq.com
     [core]
     	excludesfile = C:/Users/overdreams/git.ignore
     ```

### 7.2 在IDEA中定位Git程序

![](https://cdn.jsdelivr.net/gh/chestNutLsj/image-cloud@master/idea%20git.png)

### 7.3 初始化本地库

在IDEA的菜单栏点击VCS(Version Control Setting)，在其中找到创建Git仓库，点击创建即可。

### 7.4 添加到暂存区

当前目录下有一个`pom.xml`文件，并且被标红，这表示它在工作区还未被添加。

右键项目，找到 Git $\rightarrow$ 添加，此时文件被标绿。

我们可以在 src $\rightarrow$ main $\rightarrow$ java $\rightarrow$ 新建 IDEA_git $\rightarrow$ 新建 GitTest.java 文件，并随便写点什么。

对于多个文件的改动，可以直接点击工程根目录进行上述流程的添加，之后所有文件都会保存在暂存区，并标记为绿色。

### 7.5 提交到本地库

右键 Git $\rightarrow$ 提交，记得添加描述信息

### 7.6 切换版本

重新对GitTest.java文件进行更改，这时可以看到文件名被标记蓝色，这表示曾经追踪过但现在被更改了。

将修改过的文件进行添加提交。

点击左下角Git选项，打开页面中就有各版本信息及指针指向。右键点击版本重置分支，即可切换到旧版本。

### 7.7 创建及切换分支

在Git中选择新建分支。

若要切换分支，则点击右下角分支图标。

### 7.8 合并分支

选择右下角分支图标，选择要合并的分支并右击，点击合并分支到当前。

如果发生冲突呢？

那就进行手动合并，解决相应冲突。

## 8.IDEA集成GitHub

### 8.1 设置GitHub账号

在设置$\rarr$版本控制中找到GitHub(如果没有就去插件商店下载)，登陆自己的GitHub账号，可以选择Token或SSH两种方式登录

### 8.2 分项工程到GitHub

点击菜单栏中VCS选项，找到GitHub并分享。

### 8.3 推送本地库到远程库

右键点击项目，可以将当前分支内容push到GitHub的远程仓库中

### 8.4 拉取远程库到本地库

右键点击项目，可以将远程仓库的内容pull到本地仓库

### 8.5 克隆远程库到本地

