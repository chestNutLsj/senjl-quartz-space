---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter01_getting-started/1_3_4_cifar10_tutorial/
title: 1.3.4 Classifier - PyTorch Tutorial
date: 2023-04-06 14:52:03
tags:
---
```
%matplotlib inline
```

上一讲中已经看到如何去定义一个神经网络，计算损失值和更新网络的权重。 你现在可能在想下一步。

## 关于数据？[](#_2 "Permanent link")

一般情况下处理图像、文本、音频和视频数据时，可以使用标准的 Python 包来加载数据到一个 numpy 数组中。 然后把这个数组转换成 `torch.*Tensor`。

*   图像可以使用 Pillow, OpenCV
*   音频可以使用 scipy, librosa
*   文本可以使用原始 Python 和 Cython 来加载，或者使用 NLTK 或 SpaCy 处理

特别的，对于图像任务，我们创建了一个包 `torchvision`，它包含了处理一些基本图像数据集的方法。这些数据集包括 Imagenet, CIFAR10, MNIST 等。除了数据加载以外，`torchvision` 还包含了图像转换器， `torchvision.datasets` 和 `torch.utils.data.DataLoader`。

`torchvision`包不仅提供了巨大的便利，也避免了代码的重复。

在这个教程中，我们使用 CIFAR10 数据集，它有如下 10 个类别 ：‘airplane’, ‘automobile’, ‘bird’, ‘cat’, ‘deer’, ‘dog’, ‘frog’, ‘horse’, ‘ship’, ‘truck’。CIFAR-10 的图像都是 3x32x32 大小的，即，3 颜色通道，32x32 像素。

![](https://pytorch.org/tutorials/_images/cifar10.png)

## 训练一个图像分类器[](#_3 "Permanent link")

依次按照下列顺序进行：

1.  使用`torchvision`加载和归一化 CIFAR10 训练集和测试集
2.  定义一个卷积神经网络
3.  定义损失函数
4.  在训练集上训练网络
5.  在测试集上测试网络

## 1. 读取和归一化 CIFAR10[](#1-cifar10 "Permanent link")

使用`torchvision`可以非常容易地加载 CIFAR10。

```
import torch
import torchvision
import torchvision.transforms as transforms
```

torchvision 的输出是 [0,1] 的 PILImage 图像，我们把它转换为归一化范围为 [-1, 1] 的张量。

```
transform = transforms.Compose(
    [transforms.ToTensor(),
     transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))])

trainset = torchvision.datasets.CIFAR10(root='./data', train=True,
                                        download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(trainset, batch_size=4,
                                          shuffle=True, num_workers=2)

testset = torchvision.datasets.CIFAR10(root='./data', train=False,
                                       download=True, transform=transform)
testloader = torch.utils.data.DataLoader(testset, batch_size=4,
                                         shuffle=False, num_workers=2)

classes = ('plane', 'car', 'bird', 'cat',
           'deer', 'dog', 'frog', 'horse', 'ship', 'truck')
```

```
Downloading https://www.cs.toronto.edu/~kriz/cifar-10-python.tar.gz to ./data\cifar-10-python.tar.gz

100%|███████████████████████████████████████████████████████████████████████████████▉| 170M/170M [20:39<00:00, 155kB/s]

Files already downloaded and verified
```

我们展示一些训练图像。

```
import matplotlib.pyplot as plt
import numpy as np

# 展示图像的函数

def imshow(img):
    img = img / 2 + 0.5     # unnormalize
    npimg = img.numpy()
    plt.imshow(np.transpose(npimg, (1, 2, 0)))

# 获取随机数据
dataiter = iter(trainloader)
images, labels = dataiter.next()

# 展示图像
imshow(torchvision.utils.make_grid(images))
# 显示图像标签
print(' '.join('%5s' % classes[labels[j]] for j in range(4)))
```

```
171MB [20:51, 155kB/s]

  cat   car   cat  ship
```

## 2. 定义一个卷积神经网络[](#2 "Permanent link")

从之前的神经网络一节复制神经网络代码，并修改为输入 3 通道图像。

```
import torch.nn as nn
import torch.nn.functional as F

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(3, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 5 * 5, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 16 * 5 * 5)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x


net = Net()
```

## 3. 定义损失函数和优化器[](#3 "Permanent link")

我们使用交叉熵作为损失函数，使用带动量的随机梯度下降。

```
import torch.optim as optim

criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9)
```

## 4. 训练网路[](#4 "Permanent link")

有趣的时刻开始了。 我们只需在数据迭代器上循环，将数据输入给网络，并优化。

```
for epoch in range(2):  # 多批次循环

    running_loss = 0.0
    for i, data in enumerate(trainloader, 0):
        # 获取输入
        inputs, labels = data

        # 梯度置0
        optimizer.zero_grad()

        # 正向传播，反向传播，优化
        outputs = net(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        # 打印状态信息
        running_loss += loss.item()
        if i % 2000 == 1999:    # 每2000批次打印一次
            print('[%d, %5d] loss: %.3f' %
                  (epoch + 1, i + 1, running_loss / 2000))
            running_loss = 0.0

print('Finished Training')
```

## 5. 在测试集上测试网络[](#5 "Permanent link")

我们在整个训练集上进行了 2 次训练，但是我们需要检查网络是否从数据集中学习到有用的东西。 通过预测神经网络输出的类别标签与实际情况标签进行对比来进行检测。 如果预测正确，我们把该样本添加到正确预测列表。 第一步，显示测试集中的图片并熟悉图片内容。

```
dataiter = iter(testloader)
images, labels = dataiter.next()

# 显示图片
imshow(torchvision.utils.make_grid(images))
print('GroundTruth: ', ' '.join('%5s' % classes[labels[j]] for j in range(4)))
```

```
GroundTruth:    cat  ship  ship plane
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter01_getting-started/img/1_3_4_cifar10_tutorial_14_1.png)

让我们看看神经网络认为以上图片是什么。

```
outputs = net(images)
```

输出是 10 个标签的能量。 一个类别的能量越大，神经网络越认为它是这个类别。所以让我们得到最高能量的标签。

```
_, predicted = torch.max(outputs, 1)

print('Predicted: ', ' '.join('%5s' % classes[predicted[j]]
                              for j in range(4)))
```

```
Predicted:  plane plane plane plane
```

结果看来不错。

接下来让看看网络在整个测试集上的结果如何。

```
correct = 0
total = 0
with torch.no_grad():
    for data in testloader:
        images, labels = data
        outputs = net(images)
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

print('Accuracy of the network on the 10000 test images: %d %%' % (
    100 * correct / total))
```

```
Accuracy of the network on the 10000 test images: 9 %
```

结果看起来不错，至少比随机选择要好，随机选择的正确率为 10%。 似乎网络学习到了一些东西。

在识别哪一个类的时候好，哪一个不好呢？

```
class_correct = list(0. for i in range(10))
class_total = list(0. for i in range(10))
with torch.no_grad():
    for data in testloader:
        images, labels = data
        outputs = net(images)
        _, predicted = torch.max(outputs, 1)
        c = (predicted == labels).squeeze()
        for i in range(4):
            label = labels[i]
            class_correct[label] += c[i].item()
            class_total[label] += 1

for i in range(10):
    print('Accuracy of %5s : %2d %%' % (
        classes[i], 100 * class_correct[i] / class_total[i]))
```

```
Accuracy of plane : 99 %
Accuracy of   car :  0 %
Accuracy of  bird :  0 %
Accuracy of   cat :  0 %
Accuracy of  deer :  0 %
Accuracy of   dog :  0 %
Accuracy of  frog :  0 %
Accuracy of horse :  0 %
Accuracy of  ship :  0 %
Accuracy of truck :  0 %
```

下一步?

我们如何在 GPU 上运行神经网络呢？

## 在 GPU 上训练[](#gpu "Permanent link")

把一个神经网络移动到 GPU 上训练就像把一个 Tensor 转换 GPU 上一样简单。并且这个操作会递归遍历有所模块，并将其参数和缓冲区转换为 CUDA 张量。

```
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

# 确认我们的电脑支持CUDA，然后显示CUDA信息：

print(device)
```

本节的其余部分假定`device`是 CUDA 设备。

然后这些方法将递归遍历所有模块并将模块的参数和缓冲区 转换成 CUDA 张量：

```
net.to(device)
```

记住：inputs 和 targets 也要转换。

```
inputs, labels = inputs.to(device), labels.to(device)
```

为什么我们没注意到 GPU 的速度提升很多？那是因为网络非常的小。

**实践:** 尝试增加你的网络的宽度（第一个`nn.Conv2d`的第 2 个参数，第二个`nn.Conv2d`的第一个参数，它们需要是相同的数字），看看你得到了什么样的加速。

**实现的目标**:

*   深入了解了 PyTorch 的张量库和神经网络
*   训练了一个小网络来分类图片

**_译者注：后面我们教程会训练一个真正的网络，使识别率达到 90% 以上。_**

## 多 GPU 训练[](#gpu_1 "Permanent link")

如果你想使用所有的 GPU 得到更大的加速， 请查看[数据并行处理](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter01_getting-started/1_3_4_cifar10_tutorial/5_data_parallel_tutorial.ipynb)。

## 下一步？[](#_4 "Permanent link")

*   :doc:`训练神经网络玩电子游戏 </intermediate/reinforcement_q_learning>`
*   `在ImageNet上训练最好的ResNet`
*   `使用对抗生成网络来训练一个人脸生成器`
*   `使用LSTM网络训练一个字符级的语言模型`
*   `更多示例`
*   `更多教程`
*   `在论坛上讨论PyTorch`
*   `Slack上与其他用户讨论`