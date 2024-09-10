---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter03_intermediate/3_2_1_cnn_convnet_mnist/
title: 3.2.1 ConvNet Mnist - PyTorch Tutorial
date: 2023-04-10 17:43:35
tag: 
summary:
---
```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, transforms
torch.__version__
```

```
'2.0.0'
```

## 3.2.1 数据集介绍

MNIST 包括 6 万张 28x28 的训练样本，1 万张测试样本，很多教程都会对它” 下手” 几乎成为一个 “典范”，可以说它就是计算机视觉里面的 Hello World。

前面在介绍卷积神经网络的时候说到过 LeNet-5，LeNet-5 之所以强大就是因为在当时的环境下将 MNIST 数据的识别率提高到了 99%，这里我们也自己从头搭建一个卷积神经网络，也达到 99% 的准确率

## 3.2.2 手写数字识别

首先，我们定义一些超参数：

```python
BATCH_SIZE=512 #大概需要2G的显存
EPOCHS=20 # 总共训练批次
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu") # 让torch判断是否使用GPU，建议使用GPU环境，因为会快很多
```

因为 Pytorch 里面包含了 MNIST 的数据集，所以我们这里直接使用即可。 如果第一次执行会生成 data 文件夹，并且需要一些时间下载，如果以前下载过就不会再次下载了。

由于官方已经实现了 dataset，所以这里可以直接使用 DataLoader 来对数据进行读取：

```python
train_loader = torch.utils.data.DataLoader(
        datasets.MNIST('data', train=True, download=True, 
                       transform=transforms.Compose([
                           transforms.ToTensor(),
                           transforms.Normalize((0.1307,), (0.3081,))
                       ])),
        batch_size=BATCH_SIZE, shuffle=True)
```

```
Downloading http://yann.lecun.com/exdb/mnist/train-images-idx3-ubyte.gz
Downloading http://yann.lecun.com/exdb/mnist/train-labels-idx1-ubyte.gz
Downloading http://yann.lecun.com/exdb/mnist/t10k-images-idx3-ubyte.gz
Downloading http://yann.lecun.com/exdb/mnist/t10k-labels-idx1-ubyte.gz
Processing...
Done!
```

测试集：

```python
test_loader = torch.utils.data.DataLoader(
        datasets.MNIST('data', train=False, transform=transforms.Compose([
                           transforms.ToTensor(),
                           transforms.Normalize((0.1307,), (0.3081,))
                       ])),
        batch_size=BATCH_SIZE, shuffle=True)
```

下面我们定义一个网络，网络包含两个卷积层，conv1 和 conv2，然后紧接着两个线性层作为输出，最后输出 10 个维度，这 10 个维度我们作为 0-9 的标识来确定识别出的是那个数字。

在这里建议大家将每一层的输入和输出维度都作为注释标注出来，这样后面阅读代码的会方便很多。

```python
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
```

我们实例化一个网络，实例化后使用. to 方法将网络移动到 GPU

优化器我们也直接选择简单暴力的 Adam

```python
model = ConvNet().to(DEVICE)
optimizer = optim.Adam(model.parameters())
```

下面定义一下训练的函数，我们将训练的所有操作都封装到这个函数中

```python
def train(model, device, train_loader, optimizer, epoch):
    model.train()
    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)
        optimizer.zero_grad()
        output = model(data)
        loss = F.nll_loss(output, target)
        loss.backward()
        optimizer.step()
        if(batch_idx+1)%30 == 0: 
            print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                epoch, batch_idx * len(data), len(train_loader.dataset),
                100. * batch_idx / len(train_loader), loss.item()))
```

测试的操作也一样封装成一个函数：

```python
def test(model, device, test_loader):
    model.eval()
    test_loss = 0
    correct = 0
    with torch.no_grad():
        for data, target in test_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            test_loss += F.nll_loss(output, target, reduction='sum').item() # 将一批的损失相加
            pred = output.max(1, keepdim=True)[1] # 找到概率最大的下标
            correct += pred.eq(target.view_as(pred)).sum().item()

    test_loss /= len(test_loader.dataset)
    print('\nTest set: Average loss: {:.4f}, Accuracy: {}/{} ({:.0f}%)\n'.format(
        test_loss, correct, len(test_loader.dataset),
        100. * correct / len(test_loader.dataset)))
```

下面开始训练，这里就体现出封装起来的好处了，只要写两行就可以了：

```python
for epoch in range(1, EPOCHS + 1):
    train(model, DEVICE, train_loader, optimizer, epoch)
    test(model, DEVICE, test_loader)
```

```
Train Epoch: 1 [14848/60000 (25%)]  Loss: 0.272529
Train Epoch: 1 [30208/60000 (50%)]  Loss: 0.235455
Train Epoch: 1 [45568/60000 (75%)]  Loss: 0.101858

Test set: Average loss: 0.1018, Accuracy: 9695/10000 (97%)

Train Epoch: 2 [14848/60000 (25%)]  Loss: 0.057989
Train Epoch: 2 [30208/60000 (50%)]  Loss: 0.083935
Train Epoch: 2 [45568/60000 (75%)]  Loss: 0.051921

Test set: Average loss: 0.0523, Accuracy: 9825/10000 (98%)

Train Epoch: 3 [14848/60000 (25%)]  Loss: 0.045383
Train Epoch: 3 [30208/60000 (50%)]  Loss: 0.049402
Train Epoch: 3 [45568/60000 (75%)]  Loss: 0.061366

Test set: Average loss: 0.0408, Accuracy: 9866/10000 (99%)

Train Epoch: 4 [14848/60000 (25%)]  Loss: 0.035253
Train Epoch: 4 [30208/60000 (50%)]  Loss: 0.038444
Train Epoch: 4 [45568/60000 (75%)]  Loss: 0.036877

Test set: Average loss: 0.0433, Accuracy: 9859/10000 (99%)

Train Epoch: 5 [14848/60000 (25%)]  Loss: 0.038996
Train Epoch: 5 [30208/60000 (50%)]  Loss: 0.020670
Train Epoch: 5 [45568/60000 (75%)]  Loss: 0.034658

Test set: Average loss: 0.0339, Accuracy: 9885/10000 (99%)

Train Epoch: 6 [14848/60000 (25%)]  Loss: 0.067320
Train Epoch: 6 [30208/60000 (50%)]  Loss: 0.016328
Train Epoch: 6 [45568/60000 (75%)]  Loss: 0.017037

Test set: Average loss: 0.0348, Accuracy: 9881/10000 (99%)

Train Epoch: 7 [14848/60000 (25%)]  Loss: 0.022150
Train Epoch: 7 [30208/60000 (50%)]  Loss: 0.009608
Train Epoch: 7 [45568/60000 (75%)]  Loss: 0.012742

Test set: Average loss: 0.0346, Accuracy: 9895/10000 (99%)

Train Epoch: 8 [14848/60000 (25%)]  Loss: 0.010173
Train Epoch: 8 [30208/60000 (50%)]  Loss: 0.019482
Train Epoch: 8 [45568/60000 (75%)]  Loss: 0.012159

Test set: Average loss: 0.0323, Accuracy: 9886/10000 (99%)

Train Epoch: 9 [14848/60000 (25%)]  Loss: 0.007792
Train Epoch: 9 [30208/60000 (50%)]  Loss: 0.006970
Train Epoch: 9 [45568/60000 (75%)]  Loss: 0.004989

Test set: Average loss: 0.0294, Accuracy: 9909/10000 (99%)

Train Epoch: 10 [14848/60000 (25%)] Loss: 0.003764
Train Epoch: 10 [30208/60000 (50%)] Loss: 0.005944
Train Epoch: 10 [45568/60000 (75%)] Loss: 0.001866

Test set: Average loss: 0.0361, Accuracy: 9902/10000 (99%)

Train Epoch: 11 [14848/60000 (25%)] Loss: 0.002737
Train Epoch: 11 [30208/60000 (50%)] Loss: 0.014134
Train Epoch: 11 [45568/60000 (75%)] Loss: 0.001365

Test set: Average loss: 0.0309, Accuracy: 9905/10000 (99%)

Train Epoch: 12 [14848/60000 (25%)] Loss: 0.003344
Train Epoch: 12 [30208/60000 (50%)] Loss: 0.003090
Train Epoch: 12 [45568/60000 (75%)] Loss: 0.004847

Test set: Average loss: 0.0318, Accuracy: 9902/10000 (99%)

Train Epoch: 13 [14848/60000 (25%)] Loss: 0.001278
Train Epoch: 13 [30208/60000 (50%)] Loss: 0.003016
Train Epoch: 13 [45568/60000 (75%)] Loss: 0.001328

Test set: Average loss: 0.0358, Accuracy: 9906/10000 (99%)

Train Epoch: 14 [14848/60000 (25%)] Loss: 0.002219
Train Epoch: 14 [30208/60000 (50%)] Loss: 0.003487
Train Epoch: 14 [45568/60000 (75%)] Loss: 0.014429

Test set: Average loss: 0.0376, Accuracy: 9896/10000 (99%)

Train Epoch: 15 [14848/60000 (25%)] Loss: 0.003042
Train Epoch: 15 [30208/60000 (50%)] Loss: 0.002974
Train Epoch: 15 [45568/60000 (75%)] Loss: 0.000871

Test set: Average loss: 0.0346, Accuracy: 9909/10000 (99%)

Train Epoch: 16 [14848/60000 (25%)] Loss: 0.000618
Train Epoch: 16 [30208/60000 (50%)] Loss: 0.003164
Train Epoch: 16 [45568/60000 (75%)] Loss: 0.007245

Test set: Average loss: 0.0357, Accuracy: 9905/10000 (99%)

Train Epoch: 17 [14848/60000 (25%)] Loss: 0.001874
Train Epoch: 17 [30208/60000 (50%)] Loss: 0.013951
Train Epoch: 17 [45568/60000 (75%)] Loss: 0.000729

Test set: Average loss: 0.0322, Accuracy: 9922/10000 (99%)

Train Epoch: 18 [14848/60000 (25%)] Loss: 0.002581
Train Epoch: 18 [30208/60000 (50%)] Loss: 0.001396
Train Epoch: 18 [45568/60000 (75%)] Loss: 0.015521

Test set: Average loss: 0.0389, Accuracy: 9914/10000 (99%)

Train Epoch: 19 [14848/60000 (25%)] Loss: 0.000283
Train Epoch: 19 [30208/60000 (50%)] Loss: 0.001385
Train Epoch: 19 [45568/60000 (75%)] Loss: 0.011184

Test set: Average loss: 0.0383, Accuracy: 9901/10000 (99%)

Train Epoch: 20 [14848/60000 (25%)] Loss: 0.000472
Train Epoch: 20 [30208/60000 (50%)] Loss: 0.003306
Train Epoch: 20 [45568/60000 (75%)] Loss: 0.018017

Test set: Average loss: 0.0393, Accuracy: 9899/10000 (99%)
```

我们看一下结果，准确率 99%，没问题。

如果你的模型连 MNIST 都搞不定，那么你的模型没有任何的价值。

即使你的模型搞定了 MNIST，你的模型也可能没有任何的价值。

MNIST 是一个很简单的数据集，由于它的局限性只能作为研究用途，对实际应用带来的价值非常有限。但是通过这个例子，我们可以完全了解一个实际项目的工作流程。

我们找到数据集，对数据做预处理，定义我们的模型，调整超参数，测试训练，再通过训练结果对超参数进行调整或者对模型进行调整。

并且通过这个实战我们已经有了一个很好的模板，以后的项目都可以以这个模板为样例。