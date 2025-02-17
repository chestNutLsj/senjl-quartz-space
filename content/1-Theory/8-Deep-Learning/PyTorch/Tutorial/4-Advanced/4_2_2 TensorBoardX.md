---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/4_2_2_tensorboardx/
title: 4.2.2 TensorBoardX - PyTorch Tutorial
date: 2023-04-12 20:16:19
tag: 
summary: 
---
```
import torch
import numpy as np
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from torchvision import models,datasets
torch.__version__
```

```
'1.0.0'
```

## Tensorboard 简介

Tensorboard 是 tensorflow 内置的一个可视化工具，它通过将 tensorflow 程序输出的日志文件的信息可视化使得 tensorflow 程序的理解、调试和优化更加简单高效。 Tensorboard 的可视化依赖于 tensorflow 程序运行输出的日志文件，因而 tensorboard 和 tensorflow 程序在不同的进程中运行。 TensorBoard 给我们提供了极其方便而强大的可视化环境。它可以帮助我们理解整个神经网络的学习过程、数据的分布、性能瓶颈等等。

tensorboard 虽然是 tensorflow 内置的可视化工具，但是他们跑在不同的进程中，所以 Github 上已经有大神将 tensorboard 应用到 Pytorch 中 [链接在这里](https://github.com/lanpa/tensorboardX)

## Tensorboard 安装

首先需要安装 tensorboard

`pip install tensorboard`

然后再安装 tensorboardx

`pip install tensorboardx`

安装完成后与 visdom 一样执行独立的命令 `tensorboard --logdir logs` 即可启动，默认的端口是 6006, 在浏览器中打开 `http://localhost:6006/` 即可看到 web 页面。

这里要说明的是，微软的 Edge 浏览器 css 会无法加载，使用 chrome 正常显示。

## 页面

与 visdom 不同，tensorboard 针对不同的类型人为的区分多个标签，每一个标签页面代表不同的类型。 下面我们根据不同的页面功能做个简单的介绍，更多详细内容请参考官网。

### SCALAR

对标量数据进行汇总和记录，通常用来可视化训练过程中随着迭代次数准确率 (val acc)、损失值(train/test loss)、学习率(learning rate)、每一层的权重和偏置的统计量(mean、std、max/min) 等的变化曲线

### IMAGES

可视化当前轮训练使用的训练 / 测试图片或者 feature maps

### GRAPHS

可视化计算图的结构及计算图上的信息，通常用来展示网络的结构

### HISTOGRAMS

可视化张量的取值分布，记录变量的直方图 (统计张量随着迭代轮数的变化情况）

### PROJECTOR

全称 Embedding Projector 高维向量进行可视化

## 使用

在使用前请先去确认执行`tensorboard --logdir logs` 并保证 `http://localhost:6006/` 页面能够正常打开

### 图像展示

首先介绍比较简单的功能，查看我们训练集和数据集中的图像，这里我们使用现成的图像作为展示。这里使用 wikipedia 上的一张猫的图片[这里](https://en.wikipedia.org/wiki/Cat#/media/File:Felis_silvestris_catus_lying_on_rice_straw.jpg)

引入 tensorboardX 包：

```
from tensorboardX import SummaryWriter
```

```
cat_img = Image.open('img/1280px-Felis_silvestris_catus_lying_on_rice_straw.jpg')
cat_img.size
```

```
(1280, 853)
```

这是一张 1280x853 的图，我们先把她变成 224x224 的图片，因为后面要使用的是 vgg16：

```
transform_224 = transforms.Compose([
        transforms.Resize(224), # 这里要说明下 Scale 已经过期了，使用Resize
        transforms.CenterCrop(224),
        transforms.ToTensor(),
    ])
cat_img_224=transform_224(cat_img)
```

将图片展示在 tebsorboard 中：

```
writer = SummaryWriter(log_dir='./logs', comment='cat image') # 这里的logs要与--logdir的参数一样
writer.add_image("cat",cat_img_224)
writer.close()# 执行close立即刷新，否则将每120秒自动刷新
```

浏览器访问 `http://localhost:6006/#images` 即可看到猫的图片。

### 更新损失函数

更新损失函数和训练批次我们与 visdom 一样使用模拟展示，这里用到的是 tensorboard 的 SCALAR 页面：

```
x = torch.FloatTensor([100])
y = torch.FloatTensor([500])

for epoch in range(100):
    x /= 1.5
    y /= 1.5
    loss = y - x
    with SummaryWriter(log_dir='./logs', comment='train') as writer: #可以直接使用python的with语法，自动调用close方法
        writer.add_histogram('his/x', x, epoch)
        writer.add_histogram('his/y', y, epoch)
        writer.add_scalar('data/x', x, epoch)
        writer.add_scalar('data/y', y, epoch)
        writer.add_scalar('data/loss', loss, epoch)
        writer.add_scalars('data/data_group', {'x': x,
                                                 'y': y,
                                                 'loss': loss}, epoch)
```

浏览器访问 `http://localhost:6006/#scalars` 即可看到图形。

### 使用 PROJECTOR 对高维向量可视化

PROJECTOR 的的原理是通过 PCA，T-SNE 等方法将高维向量投影到三维坐标系（降维度）。Embedding Projector 从模型运行过程中保存的 checkpoint 文件中读取数据，默认使用主成分分析法（PCA）将高维数据投影到 3D 空间中，也可以通过设置设置选择 T-SNE 投影方法，这里做一个简单的展示。

我们还是用第三章的 mnist 代码：

```
BATCH_SIZE=512 
EPOCHS=20 
train_loader = torch.utils.data.DataLoader(
        datasets.MNIST('data', train=True, download=True, 
                       transform=transforms.Compose([
                           transforms.ToTensor(),
                           transforms.Normalize((0.1307,), (0.3081,))
                       ])),
        batch_size=BATCH_SIZE, shuffle=True)
```

```
class ConvNet(nn.Module):
    def __init__(self):
        super().__init__()
        # 1,28x28
        self.conv1=nn.Conv2d(1,10,5) # 10, 24x24
        self.conv2=nn.Conv2d(10,20,3) # 128, 10x10
        self.fc1 = nn.Linear(20*10*10,500)
        self.fc2 = nn.Linear(500,10)
    def forward(self,x):
        in_size = x.size(0)
        out = self.conv1(x) #24
        out = F.relu(out)
        out = F.max_pool2d(out, 2, 2)  #12
        out = self.conv2(out) #10
        out = F.relu(out)
        out = out.view(in_size,-1)
        out = self.fc1(out)
        out = F.relu(out)
        out = self.fc2(out)
        out = F.log_softmax(out,dim=1)
        return out
model = ConvNet()
optimizer = torch.optim.Adam(model.parameters())
```

```
def train(model, train_loader, optimizer, epoch):
    n_iter=0
    model.train()
    for batch_idx, (data, target) in enumerate(train_loader):
        optimizer.zero_grad()
        output = model(data)
        loss = F.nll_loss(output, target)
        loss.backward()
        optimizer.step()
        if(batch_idx+1)%30 == 0: 
            n_iter=n_iter+1
            print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                epoch, batch_idx * len(data), len(train_loader.dataset),
                100. * batch_idx / len(train_loader), loss.item()))
            #主要增加了一下内容
            out = torch.cat((output.data, torch.ones(len(output), 1)), 1) # 因为是投影到3D的空间，所以我们只需要3个维度
            with SummaryWriter(log_dir='./logs', comment='mnist') as writer: 
                #使用add_embedding方法进行可视化展示
                writer.add_embedding(
                    out,
                    metadata=target.data,
                    label_img=data.data,
                    global_step=n_iter)
```

这里节省时间，只训练一次：

```
train(model, train_loader, optimizer, 0)
```

```
Train Epoch: 0 [14848/60000 (25%)]  Loss: 0.271775
warning: Embedding dir exists, did you set global_step for add_embedding()?
Train Epoch: 0 [30208/60000 (50%)]  Loss: 0.175213
warning: Embedding dir exists, did you set global_step for add_embedding()?
Train Epoch: 0 [45568/60000 (75%)]  Loss: 0.115128
warning: Embedding dir exists, did you set global_step for add_embedding()?
```

打开 `http://localhost:6006/#projector` 即可看到效果。

### 绘制网络结构
在 pytorch 中我们可以使用 print 直接打印出网络的结构，但是这种方法可视化效果不好，这里使用 tensorboard 的 GRAPHS 来实现网络结构的可视化。 由于 pytorch 使用的是动态图计算，所以我们这里要手动进行一次前向的传播.

使用 Pytorch 已经构建好的模型进行展示：

```
vgg16 = models.vgg16(pretrained=True) # 这里下载预训练好的模型
print(vgg16) # 打印一下这个模型
```

```
VGG(
  (features): Sequential(
    (0): Conv2d(3, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (1): ReLU(inplace)
    (2): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (3): ReLU(inplace)
    (4): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
    (5): Conv2d(64, 128, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (6): ReLU(inplace)
    (7): Conv2d(128, 128, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (8): ReLU(inplace)
    (9): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
    (10): Conv2d(128, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (11): ReLU(inplace)
    (12): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (13): ReLU(inplace)
    (14): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (15): ReLU(inplace)
    (16): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
    (17): Conv2d(256, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (18): ReLU(inplace)
    (19): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (20): ReLU(inplace)
    (21): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (22): ReLU(inplace)
    (23): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
    (24): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (25): ReLU(inplace)
    (26): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (27): ReLU(inplace)
    (28): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
    (29): ReLU(inplace)
    (30): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
  )
  (classifier): Sequential(
    (0): Linear(in_features=25088, out_features=4096, bias=True)
    (1): ReLU(inplace)
    (2): Dropout(p=0.5)
    (3): Linear(in_features=4096, out_features=4096, bias=True)
    (4): ReLU(inplace)
    (5): Dropout(p=0.5)
    (6): Linear(in_features=4096, out_features=1000, bias=True)
  )
)
```

在前向传播前，先要把图片做一些调整：

```
transform_2 = transforms.Compose([
    transforms.Resize(224), 
    transforms.CenterCrop((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225])
])
```

使用上一张猫的图片进行前向传播：

```
vgg16_input=transform_2(cat_img)[np.newaxis]# 因为pytorch的是分批次进行的，所以我们这里建立一个批次为1的数据集
vgg16_input.shape
```

```
torch.Size([1, 3, 224, 224])
```

开始前向传播，打印输出值：

```
out = vgg16(vgg16_input)
_, preds = torch.max(out.data, 1)
label=preds.numpy()[0]
label
```

将结构图在 tensorboard 进行展示：

```
with SummaryWriter(log_dir='./logs', comment='vgg16') as writer:
    writer.add_graph(vgg16, (vgg16_input,))
```

打开 tensorboard 找到 graphs 就可以看到 vgg 模型具体的架构了。