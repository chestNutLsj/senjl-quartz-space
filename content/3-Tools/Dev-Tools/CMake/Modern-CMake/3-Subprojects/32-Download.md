## 在构建时 (build time) 下载

直到 CMake 3.11， 主流的下载包的方法都在构建时进行。这（在构建时下载）会造成几个问题；其中最主要问题的是 `add_subdirectory` 不能对一个尚不存在的文件夹使用！因此，我们导入的外部项目内置的工具必须自己构建自己（这个外部项目）来解决这个问题。（同时，这种方法也能用于构建不支持 CMake 的包）[1](https://modern-cmake-cn.github.io/Modern-CMake-zh_CN/chapters/projects/download.html#fn_1)

> 1. 注意，外部数据就是不在包内的数据的工具。 [↩](https://modern-cmake-cn.github.io/Modern-CMake-zh_CN/chapters/projects/download.html#reffn_1 "Jump back to footnote [1] in the text.")

## 在配置时 (configure time) 下载

如果你更喜欢在配置时下载，看看这个仓库 [Crascit/DownloadProject](https://github.com/Crascit/DownloadProject) ，它提供了插件式（不需要改变你原有的 CMakeLists.txt）的解决方案。但是，子模块 (submodules) 很好用，以至于我已经停止了使用 CMake 对诸如 GoogleTest 之类的项目的下载，并把他们加入到了子模块中。自动下载在没有网络访问的环境下也是难以实现的，并且外部项目经常被下载到构建目录中，如果你有多个构建目录，这就既浪费时间又浪费空间。