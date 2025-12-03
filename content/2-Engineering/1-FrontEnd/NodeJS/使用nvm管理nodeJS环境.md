类似 Python 需要 conda 进行环境管理一样，node 开发迭代版本也很快，我们在学习和开发时很可能使用不同版本的 node，故而出现了 nvm (node.js version management) 这一版本管理工具。

## 安装

### For Windows
下载页面：[GitHub - nvm-sh/nvm: Node Version Manager - POSIX-compliant bash script to manage multiple active node.js versions](https://github.com/nvm-sh/nvm)；

### For ArchLinux
在 Archlinux 上可以很简单地安装：
```shell
yay -S archlinuxcn/nvm
# or
yay -S aur/nvm-git
```

安装成功后在 shell 中输入 `nvm`，正确的输出类似如下，仔细阅读可以详细了解常见用法，后文也会常用命令作以说明：
```shell
❯ nvm  
  
Node Version Manager (v0.39.3)  
  
Note: <version> refers to any version-like string nvm understands. This includes:  
 - full or partial version numbers, starting with an optional "v" (0.10, v0.1.2, v1)  
 - default (built-in) aliases: node, stable, unstable, iojs, system  
 - custom aliases you define with `nvm alias foo`  
  
Any options that produce colorized output should respect the `--no-colors` option.  
  
Usage:  
 nvm --help                                  Show this message  
   --no-colors                               Suppress colored output  
 nvm --version                               Print out the installed version of nvm  
 nvm install [<version>]                     Download and install a <version>. Uses .nvmrc if available and version is omitted.  
  The following optional arguments, if provided, must appear directly after `nvm install`:  
   -s                                        Skip binary download, install from source only.  
   -b                                        Skip source download, install from binary only.  
   --reinstall-packages-from=<version>       When installing, reinstall packages installed in <node|iojs|node version number>  
   --lts                                     When installing, only select from LTS (long-term support) versions  
   --lts=<LTS name>                          When installing, only select from versions for a specific LTS line  
   --skip-default-packages                   When installing, skip the default-packages file if it exists  
   --latest-npm                              After installing, attempt to upgrade to the latest working npm on the given node version  
   --no-progress                             Disable the progress bar on any downloads  
   --alias=<name>                            After installing, set the alias specified to the version specified. (same as: nvm alias <name> <version>)  
   --default                                 After installing, set default alias to the version specified. (same as: nvm alias default <version>)  
 nvm uninstall <version>                     Uninstall a version  
 nvm uninstall --lts                         Uninstall using automatic LTS (long-term support) alias `lts/*`, if available.  
 nvm uninstall --lts=<LTS name>              Uninstall using automatic alias for provided LTS line, if available.  
 nvm use [<version>]                         Modify PATH to use <version>. Uses .nvmrc if available and version is omitted.  
  The following optional arguments, if provided, must appear directly after `nvm use`:  
   --silent                                  Silences stdout/stderr output  
   --lts                                     Uses automatic LTS (long-term support) alias `lts/*`, if available.  
   --lts=<LTS name>                          Uses automatic alias for provided LTS line, if available.  
 nvm exec [<version>] [<command>]            Run <command> on <version>. Uses .nvmrc if available and version is omitted.  
  The following optional arguments, if provided, must appear directly after `nvm exec`:  
   --silent                                  Silences stdout/stderr output  
   --lts                                     Uses automatic LTS (long-term support) alias `lts/*`, if available.  
   --lts=<LTS name>                          Uses automatic alias for provided LTS line, if available.  
 nvm run [<version>] [<args>]                Run `node` on <version> with <args> as arguments. Uses .nvmrc if available and version is omitted.  
  The following optional arguments, if provided, must appear directly after `nvm run`:  
   --silent                                  Silences stdout/stderr output  
   --lts                                     Uses automatic LTS (long-term support) alias `lts/*`, if available.  
   --lts=<LTS name>                          Uses automatic alias for provided LTS line, if available.  
 nvm current                                 Display currently activated version of Node  
 nvm ls [<version>]                          List installed versions, matching a given <version> if provided  
   --no-colors                               Suppress colored output  
   --no-alias                                Suppress `nvm alias` output  
 nvm ls-remote [<version>]                   List remote versions available for install, matching a given <version> if provided  
   --lts                                     When listing, only show LTS (long-term support) versions  
   --lts=<LTS name>                          When listing, only show versions for a specific LTS line  
   --no-colors                               Suppress colored output  
 nvm version <version>                       Resolve the given description to a single local version  
 nvm version-remote <version>                Resolve the given description to a single remote version  
   --lts                                     When listing, only select from LTS (long-term support) versions  
   --lts=<LTS name>                          When listing, only select from versions for a specific LTS line  
 nvm deactivate                              Undo effects of `nvm` on current shell  
   --silent                                  Silences stdout/stderr output  
 nvm alias [<pattern>]                       Show all aliases beginning with <pattern>  
   --no-colors                               Suppress colored output  
 nvm alias <name> <version>                  Set an alias named <name> pointing to <version>  
 nvm unalias <name>                          Deletes the alias named <name>  
 nvm install-latest-npm                      Attempt to upgrade to the latest working `npm` on the current node version  
 nvm reinstall-packages <version>            Reinstall global `npm` packages contained in <version> to current version  
 nvm unload                                  Unload `nvm` from shell  
 nvm which [current | <version>]             Display path to installed node version. Uses .nvmrc if available and version is omitted.  
   --silent                                  Silences stdout/stderr output when a version is omitted  
 nvm cache dir                               Display path to the cache directory for nvm  
 nvm cache clear                             Empty cache directory for nvm  
 nvm set-colors [<color codes>]              Set five text colors using format "yMeBg". Available when supported.  
                                              Initial colors are:  
                                                 bygre  
                                              Color codes:  
                                               r/R = red / bold red  
                                               g/G = green / bold green  
                                               b/B = blue / bold blue  
                                               c/C = cyan / bold cyan  
                                               m/M = magenta / bold magenta  
                                               y/Y = yellow / bold yellow  
                                               k/K = black / bold black  
                                               e/W = light grey / white  
Example:  
 nvm install 8.0.0                     Install a specific version number  
 nvm use 8.0                           Use the latest available 8.0.x release  
 nvm run 6.10.3 app.js                 Run app.js using node 6.10.3  
 nvm exec 4.8.3 node app.js            Run `node app.js` with the PATH pointing to node 4.8.3  
 nvm alias default 8.1.0               Set default node version on a shell  
 nvm alias default node                Always default to the latest available node version on a shell  
  
 nvm install node                      Install the latest available version  
 nvm use node                          Use the latest version  
 nvm install --lts                     Install the latest LTS version  
 nvm use --lts                         Use the latest LTS version  
  
 nvm set-colors cgYmW                  Set text colors to cyan, green, bold yellow, magenta, and white  
  
Note:  
 to remove, delete, or uninstall nvm - just remove the `$NVM_DIR` folder (usually `~/.nvm`)
```

## node 安装

### 查看已安装 node 版本
```shell
❯ nvm ls  
->     v18.12.1  
        system  
default -> 18.12.1 (-> v18.12.1)  
iojs -> N/A (default)  
unstable -> N/A (default)  
node -> stable (-> v18.12.1) (default)  
stable -> 18.12 (-> v18.12.1) (default)  
lts/* -> lts/hydrogen (-> v18.12.1)  
lts/argon -> v4.9.1 (-> N/A)  
lts/boron -> v6.17.1 (-> N/A)  
lts/carbon -> v8.17.0 (-> N/A)  
lts/dubnium -> v10.24.1 (-> N/A)  
lts/erbium -> v12.22.12 (-> N/A)  
lts/fermium -> v14.21.2 (-> N/A)  
lts/gallium -> v16.19.0 (-> N/A)  
lts/hydrogen -> v18.12.1
```

如上，列出了可获取的 node 版本。可以看到，当前默认使用的是 `node lts/hydrogen v18.12.1`，其他版本还没有安装。

### 安装指定版本的 node
使用 `nvm install [node_version]` 即可快速下载指定版本 node：
```shell
nvm install v16.19.0
```

安装完成后查看版本：
```shell
❯ nvm install v16.19.0  
Downloading and installing node v16.19.0...  
Downloading http://nodejs.org/dist/v16.19.0/node-v16.19.0-linux-x64.tar.xz...  
##################################################################################################################################################### 100.0%  
Computing checksum with sha256sum  
Checksums matched!  
Now using node v16.19.0 (npm v8.19.3)  
❯ node --version  
v16.19.0  
❯ npm --version  
8.19.3
```

## nvm 常用命令

### 在 shell 中使用指定版本 node
```shell
nvm use [node_version]
```

### 退出当前 node 环境
```shell
nvm unload
```

## 配置 npm
npm 是 node 的软件包管理器，在命令行中输入它可以简要了解其命令：
```shell
❯ npm  
npm <command>  
  
Usage:  
  
npm install        install all the dependencies in your project  
npm install <foo>  add the <foo> dependency to your project  
npm test           run this project's tests  
npm run <foo>      run the script named <foo>  
npm <command> -h   quick help on <command>  
npm -l             display usage info for all commands  
npm help <term>    search for help on <term>  
npm help npm       more involved overview  
  
All commands:  
  
   access, adduser, audit, bin, bugs, cache, ci, completion,  
   config, dedupe, deprecate, diff, dist-tag, docs, doctor,  
   edit, exec, explain, explore, find-dupes, fund, get, help,  
   hook, init, install, install-ci-test, install-test, link,  
   ll, login, logout, ls, org, outdated, owner, pack, ping,  
   pkg, prefix, profile, prune, publish, query, rebuild, repo,  
   restart, root, run-script, search, set, set-script,  
   shrinkwrap, star, stars, start, stop, team, test, token,  
   uninstall, unpublish, unstar, update, version, view, whoami  
  
Specify configs in the ini-formatted file:  
   /home/westwoods/.npmrc  
or on the command line via: npm <command> --key=value  
  
More configuration info: npm help config  
Configuration fields: npm help 7 config  
  
npm@8.19.3 /home/westwoods/.nvm/versions/node/v16.19.0/lib/node_modules/npm
```