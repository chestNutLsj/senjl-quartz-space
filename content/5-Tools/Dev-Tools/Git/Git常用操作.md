记录在使用过程中常见操作。

## Git pull 强制覆盖本地文件
git 在切代码分支时经常碰到这样的问题：`error: Your local changes to the following files would be overwritten by merge`。

有时本地并没有需要保存的修改，所以可以通过以下方式把本地文件强制覆盖掉。  
```shell 
git fetch --all

git reset --hard branch_alilas/master

git pull
```  

命令解析：
1. `git fetch` 相当于是从远程获取最新到本地，不会自动 merge，如下指令：

```shell
# 将远程仓库的master分支下载到本地当前branch中
git fetch orgin master 

# 比较本地的master分支和origin/master分支的差别
git log -p master  ..origin/master 

# 进行合并
git merge origin/master
```
也可以用以下指令：
```shell
# 从远程仓库master分支获取最新，在本地建立tmp分支
git fetch origin master:tmp

# 将当前分支与tmp分支对比
git diff tmp

# 合并tmp分支到当前分支
git merge tmp
```

2. `git reset--hard origin/master`：版本穿梭
```shell
git reset (–mixed) HEAD~1  
```
回退一个版本,且会将暂存区的内容和本地已提交的内容全部恢复到未暂存的状态,不影响原来本地文件 (未提交的也不受影响)  

```shell
git reset –soft HEAD~1  
```
回退一个版本,不清空暂存区,将已提交的内容恢复到暂存区,不影响原来本地的文件 (未提交的也不受影响)  

```shell
git reset –hard HEAD~1  
```
回退一个版本, 清空暂存区, 将已提交的内容的版本恢复到本地, 本地的文件也将被恢复的版本替换

3. `git pull` 相当于是从远程获取最新版本并 merge 到本地

```shell
git pull origin master
```

在实际使用中，git fetch更安全一些

