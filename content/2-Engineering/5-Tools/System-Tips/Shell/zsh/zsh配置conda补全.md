## 安装 `conda-zsh-completion`
```shell
yay -S conda-zsh-completion
```

## 查看安装路径
```shell
yay -Ql conda-zsh-completion

conda-zsh-completion /usr/
conda-zsh-completion /usr/share/
conda-zsh-completion /usr/share/licenses/
conda-zsh-completion /usr/share/licenses/conda-zsh-completion/
conda-zsh-completion /usr/share/licenses/conda-zsh-completion/LICENSE 
conda-zsh-completion /usr/share/zsh/ 
conda-zsh-completion /usr/share/zsh/site-functions/
conda-zsh-completion /usr/share/zsh/site-functions/_conda
```

需要用到的的安装路径是 `/usr/share/zsh/site-functions/_conda`。这是 zsh 插件 `conda-zsh-completion` 的主要安装位置。

在 zsh 中，`/usr/share/zsh/site-functions/` 目录通常用于存储全局的 zsh 脚本和函数，其中 `_conda` 文件是 `conda-zsh-completion` 插件的自动补全脚本。当启用了 `conda` 插件并运行 zsh 时，该脚本将被加载，从而提供与 conda 相关的自动补全功能。

## 启用插件
项目文档提示：
```shell
# To use this completion, install it somewhere on your hard drive:
#
#     $ git clone https://github.com/esc/conda-zsh-completion
#
# And then add it to your $fpath in ~/.zshrc before you call compinit:
#
#     fpath+=/path/to/where/you/installed/conda-zsh-completion
#     compinit
```

因此，在 `~/.zshrc` 中 compinit 行之前添加如下内容：
```shell
fpath+=/usr/share/zsh/site-functions/_conda
```

之后重启终端即可使用。