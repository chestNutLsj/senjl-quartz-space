## 安装 Python、Conda、Jupyter 及依赖库
```shell
sudo pacman -S miniconda3

source /opt/miniconda3/bin/activate base

conda config --add channels conda-forge

conda create -n dlnoob python=3.9 -y

conda activate dlnoob

conda install jupyter notebook

conda install matplotlib numpy
```

## 简单使用 Jupyter

### 启动
在 dlnoob 虚拟环境中，运行 jupyter 命令以启动：
```shell
jupyter notebook
```
![[start-jupyter.png]]
<center>Fig 1. 启动 Jupyter Notebook</center>
之后会自动在浏览器打开 Jupyter Notebook，如果没有，请按命令行输出的网址进入。

### 介绍

**什么是 Jupyter notebook？**  
`Jupyter notebook` 是一种 Web 应用，它能让用户将说明文本、数学方程、代码和可视化内容全部组合到一个易于共享的文档中，非常方便研究和教学。在原始的 Python shell 与 IPython 中，可视化在单独的窗口中进行，而文字资料以及各种函数和类脚本包含在独立的文档中。但是，notebook 能将这一切集中到一处，让用户一目了然。

**Jupyter notebook是如何工作的？**
`Jupyter notebook` 源于 Fernando Perez 发起的 `IPython` 项目。IPython 是一种交互式 shell，与普通的 Python shell 相似，但具有一些更高级的功能，例如语法高亮显示和代码补全，还有一些 magic 操作，十分方便。Jupyter notebook 将 IPython 做成了一种 Web 应用，我们可以通过它的基本架构更清楚的了解：
![[jupyter-arch.png]]
<center>Fig 2. Jupyter Notebook 的架构示意图</center>

可以看到，这里的核心是 notebook 的服务器。用户通过浏览器连接到该服务器，而 notebook 呈现为 Web 应用。用户在 Web 应用中编写的代码通过该服务器发送给内核，内核运行代码，并将结果发送回该服务器。然后，任何输出都会返回到浏览器中。保存 notebook 时，它将作为 `JSON` 文件（文件扩展名为 `.ipynb`）写入到该服务器中。

此架构的一个优点是，内核无需运行 Python。由于 notebook 和内核分开，因此可以在两者之间发送任何语言的代码。例如，早期的两个非 Python 内核分别是 R 语言和 Julia 语言。使用 R 内核时，用 R 编写的代码将发送给执行该代码的 R 内核，这与在 Python 内核上运行 Python 代码完全一样。IPython notebook 已被改名，因为 notebook 变得与编程语言无关。新的名称 Jupyter 由 `Julia`、`Python` 和 `R` 组合而成。

### 使用
![[jupyter-panel.png]]
<center>Fig 3. Notebook 打开后的界面</center>

Notebook 界面简洁明了，点击“新建”即可在当前目录下创建笔记本：
![[new-jupyter-notebook.png]]
<center>Fig 4. 新建时的选项</center>
之后会打开一个新的标签页面，这实际上就是扩展名为 `.ipynb` 的一个 Notebook 对象：
![[Pasted image 20230520093940.png]]
<center>Fig 5. Notebook 页面</center>

菜单及工具栏一行中支持丰富的文件操作，右上角注明当前文件“可信”，并且使用 Python 3 Kernel，空心圆表示当前文件处于空闲状态，若正在执行代码，则会变成实心圆。
下方绿色框、`In []:` 开头的区域称为单元（cell），是 Notebook 中程序输入的区域，绿色表示可编辑，蓝色表示选中可操作，这两种状态可以通过 `ESC` 和 `Enter` 键快速切换。
在第一个单元中输入 Python 代码，并按 `Shift` + `Enter` 运行之：
```python
print("Hello, world!")
```
![[run-hello-world.png]]
<center>Fig 6. 执行代码</center>

结果会紧随输入代码之后。现在尝试使用 matplotlib 绘制图形：
```python
%matplotlib inline

import numpy as np
import matplotlib.pyplot as plt

x=np.linspace(-np.pi,np.pi)
plt.plot(x,np.cos(x))
plt.plot(x,np.sin(x))
plt.show()
```

![[cos-sin.png]]
import 在 Notebook 的前文中运行过的话，后文单元中不必再引入。

### 关闭
Jupyter Notebook 服务器模块是作为一个进程启动的，只是关闭浏览器并不会结束，而要在菜单中选择 File -> Close and Halt。

如果关闭了当前 Notebook 的标签页，也可以通过命令面板中 Running 标签页进行结束操作：
![[close-notebook.png]]