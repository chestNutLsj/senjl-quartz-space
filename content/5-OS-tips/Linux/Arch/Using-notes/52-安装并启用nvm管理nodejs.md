### 02. 安装并启用nvm管理nodejs
虽然archlinuxcn中也有nvm可供安装，但直接安装那个版本却没有激活nvm的命令提示，导致虽然安装了却无法使用。而安装aur中的`nvm-git`版本则会有清晰的提示：
```shell
You need to source nvm before you can use it. Do one of the following  
or similar depending on your shell (and then restart your shell):  
  
 echo 'source /usr/share/nvm/init-nvm.sh' >> ~/.bashrc  
 echo 'source /usr/share/nvm/init-nvm.sh' >> ~/.zshrc  
  
You can now install node.js versions (e.g. nvm install 10) and  
activate them (e.g. nvm use 10).  
  
init-nvm.sh is a convenience script which does the following:  
  
[ -z "$NVM_DIR" ] && export NVM_DIR="$HOME/.nvm"  
source /usr/share/nvm/nvm.sh  
source /usr/share/nvm/bash_completion  
source /usr/share/nvm/install-nvm-exec  
  
You may wish to customize and put these lines directly in your  
.bashrc (or similar) if, for example, you would like an NVM_DIR  
other than ~/.nvm or you don't want bash completion.  
  
See the nvm readme for more information: https://github.com/creationix/nvm
```