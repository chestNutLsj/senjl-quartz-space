---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/4_1_fine-tuning/
title: 4.1 Fine Tuning - PyTorch Tutorial
date: 2023-04-12 17:22:45
tag: 
summary: 
---
```python
%matplotlib inline
import torch,os,torchvision
import torch.nn as nn
import torch.nn.functional as F
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, models, transforms
from PIL import Image
from sklearn.model_selection import StratifiedShuffleSplit
torch.__version__
```

```
'1.0.0'
```

在前面的介绍卷积神经网络的时候，说到过 PyTorch 已经为我们训练好了一些经典的网络模型，那么这些预训练好的模型是用来做什么的呢？其实就是为了我们进行微调使用的。

## 4.1.1 什么是微调

针对于某个任务，自己的训练数据不多，那怎么办？ 没关系，我们先找到一个同类的别人训练好的模型，把别人现成的训练好了的模型拿过来，换成自己的数据，调整一下参数，再训练一遍，这就是微调（fine-tune）。 PyTorch 里面提供的经典的网络模型都是官方通过 Imagenet 的数据集与训练好的数据，如果我们的数据训练数据不够，这些数据是可以作为基础模型来使用的。

### 为什么要微调

1.  对于数据集本身很小（几千张图片）的情况，从头开始训练具有几千万参数的大型神经网络是不现实的，因为越大的模型对数据量的要求越大，过拟合无法避免。这时候如果还想用上大型神经网络的超强特征提取能力，只能靠微调已经训练好的模型。
2.  可以降低训练成本：如果使用导出特征向量的方法进行迁移学习，后期的训练成本非常低，用 CPU 都完全无压力，没有深度学习机器也可以做。
3.  前人花很大精力训练出来的模型在大概率上会比你自己从零开始搭的模型要强悍，没有必要重复造轮子。

### 迁移学习 Transfer Learning

总是有人把 迁移学习和神经网络的训练联系起来，这两个概念刚开始是无关的。 迁移学习是机器学习的分支，现在之所以迁移学习和神经网络联系如此紧密，现在图像识别这块发展的太快效果也太好了，所以几乎所有的迁移学习都是图像识别方向的，所以大家看到的迁移学习基本上都是以神经网络相关的计算机视觉为主，本文中也会以这方面来举例子。

迁移学习初衷是节省人工标注样本的时间，让模型可以通过一个已有的标记数据的领域向未标记数据领域进行迁移从而训练出适用于该领域的模型，直接对目标域从头开始学习成本太高，我们故而转向运用已有的相关知识来辅助尽快地学习新知识

举一个简单的例子就能很好的说明问题，我们学习编程的时候会学习什么？ 语法、特定语言的 API、流程处理、面向对象，设计模式，等等

这里面语法和 API 是每一个语言特有的，但是面向对象和设计模式可是通用的，我们学了 JAVA，再去学 C#，或者 Python，面向对象和设计模式是不用去学的，因为原理都是一样的，甚至在学习 C# 的时候语法都可以少学很多，这就是迁移学习的概念，把统一的概念抽象出来，只学习不同的内容。

迁移学习按照学习方式可以分为基于样本的迁移，基于特征的迁移，基于模型的迁移，以及基于关系的迁移，这里就不详细介绍了。

### 二者关系

其实 "Transfer Learning" 和 "Fine-tune" 并没有严格的区分，含义可以相互交换，只不过后者似乎更常用于形容迁移学习的后期微调中。 我个人的理解，微调应该是迁移学习中的一部分。微调只能说是一个 trick。

## 4.1.2 如何微调

对于不同的领域微调的方法也不一样，比如语音识别领域一般微调前几层，图片识别问题微调后面几层，这个原因我这里也只能讲个大概，具体还要大神来解释：

对于图片来说，我们 CNN 的前几层学习到的都是低级的特征，比如，点、线、面，这些低级的特征对于任何图片来说都是可以抽象出来的，所以我们将他作为通用数据，只微调这些低级特征组合起来的高级特征即可，例如，这些点、线、面，组成的是园还是椭圆，还是正方形，这些代表的含义是我们需要后面训练出来的。

对于语音来说，每个单词表达的意思都是一样的，只不过发音或者是单词的拼写不一样，比如 苹果，apple，apfel（德语），都表示的是同一个东西，只不过发音和单词不一样，但是他具体代表的含义是一样的，就是高级特征是相同的，所以我们只要微调低级的特征就可以了。

下面只介绍下计算机视觉方向的微调，摘自 [cs231](http://cs231n.github.io/transfer-learning/)

ConvNet as fixed feature extractor. 其实这里有两种做法：
1. 使用最后一个 fc layer 之前的 fc layer 获得的特征，学习个线性分类器 (比如 SVM)
2. 重新训练最后一个 fc layer

- Fine-tuning the ConvNet
	固定前几层的参数，只对最后几层进行 fine-tuning,
	对于上面两种方案有一些微调的小技巧，比如先计算出预训练模型的卷积层对所有训练和测试数据的特征向量，然后抛开预训练模型，只训练自己定制的简配版全连接网络。 这个方式的一个好处就是节省计算资源，每次迭代都不会再去跑全部的数据，而只是跑一下简配的全连接

*   Pretrained models
	这个其实和第二种是一个意思，不过比较极端，使用整个 pre-trained 的 model 作为初始化，然后 fine-tuning 整个网络而不是某些层，但是这个的计算量是非常大的, 就只相当于做了一个初始化。

## 4.1.3 注意事项

1.  新数据集和原始数据集合类似，那么直接可以微调一个最后的 FC 层或者重新指定一个新的分类器
2.  新数据集比较小和原始数据集合差异性比较大，那么可以使用从模型的中部开始训练，只对最后几层进行 fine-tuning
3.  新数据集比较小和原始数据集合差异性比较大，如果上面方法还是不行的化那么最好是重新训练，只将预训练的模型作为一个新模型初始化的数据
4.  新数据集的大小一定要与原始数据集相同，比如 CNN 中输入的图片大小一定要相同，才不会报错
5.  如果数据集大小不同的话，可以在最后的 fc 层之前添加卷积或者 pool 层，使得最后的输出与 fc 层一致，但这样会导致准确度大幅下降，所以不建议这样做
6.  对于不同的层可以设置不同的学习率，一般情况下建议，对于使用的原始数据做初始化的层设置的学习率要小于（一般可设置小于 10 倍）初始化的学习率，这样保证对于已经初始化的数据不会扭曲的过快，而使用初始化学习率的新层可以快速的收敛。

## 4.1.3 微调实例

这里面我们使用官方训练好的 resnet50 来参加 kaggle 上面的 [dog breed](https://www.kaggle.com/c/dog-breed-identification) 狗的种类识别来做一个简单微调实例。

首先我们需要下载官方的数据解压，只要保持数据的目录结构即可，这里指定一下目录的位置，并且看下内容

```python
DATA_ROOT = 'data'
all_labels_df = pd.read_csv(os.path.join(DATA_ROOT,'labels.csv'))
all_labels_df.head()
```

| id | breed                            ||
|----|----------------------------------|---|
| 0  | 000 bec 180 eb 18 c 7604 dcecc 8 fe 0 dba 07 | boston_bull      |
| 1  | 001513 dfcb 2 ffafc 82 cccf 4 d 8 bbaba 97 | dingo            |
| 2  | 001 cdf 01 b 096 e 06 d 78 e 9 e 5112 d 419397 | pekinese         |
| 3  | 00214 f 311 d 5 d 2247 d 5 dfe 4 fe 24 b 2303 d | bluetick         |
| 4  | 0021 f 9 ceb 3235 effd 7 fcde 7 f 7538 ed 62 | golden_retriever |


获取狗的分类，根据分类进行编号。这里定义了两个字典，分别以名字和 id 作为对应，方便后面处理：

```python
breeds = all_labels_df.breed.unique()
breed2idx = dict((breed,idx) for idx,breed in enumerate(breeds))
idx2breed = dict((idx,breed) for idx,breed in enumerate(breeds))
len(breeds)
```

添加到列表中:

```python
all_labels_df['label_idx'] = [breed2idx[b] for b in all_labels_df.breed]
all_labels_df.head()
```

<table><thead><tr><th></th><th>id</th><th>breed</th><th>label_idx</th></tr></thead><tbody><tr><th>0</th><td>000bec180eb18c7604dcecc8fe0dba07</td><td>boston_bull</td><td>0</td></tr><tr><th>1</th><td>001513dfcb2ffafc82cccf4d8bbaba97</td><td>dingo</td><td>1</td></tr><tr><th>2</th><td>001cdf01b096e06d78e9e5112d419397</td><td>pekinese</td><td>2</td></tr><tr><th>3</th><td>00214f311d5d2247d5dfe4fe24b2303d</td><td>bluetick</td><td>3</td></tr><tr><th>4</th><td>0021f9ceb3235effd7fcde7f7538ed62</td><td>golden_retriever</td><td>4</td></tr></tbody></table>

由于我们的数据集不是官方指定的格式，我们自己定义一个数据集:

```
class DogDataset(Dataset):
    def __init__(self, labels_df, img_path, transform=None):
        self.labels_df = labels_df
        self.img_path = img_path
        self.transform = transform

    def __len__(self):
        return self.labels_df.shape[0]

    def __getitem__(self, idx):
        image_name = os.path.join(self.img_path, self.labels_df.id[idx]) + '.jpg'
        img = Image.open(image_name)
        label = self.labels_df.label_idx[idx]

        if self.transform:
            img = self.transform(img)
        return img, label
```

定义一些超参数：

```
IMG_SIZE = 224 # resnet50的输入是224的所以需要将图片统一大小
BATCH_SIZE= 256 #这个批次大小需要占用4.6-5g的显存，如果不够的化可以改下批次，如果内存超过10G可以改为512
IMG_MEAN = [0.485, 0.456, 0.406]
IMG_STD = [0.229, 0.224, 0.225]
CUDA=torch.cuda.is_available()
DEVICE = torch.device("cuda" if CUDA else "cpu")
```

定义训练和验证数据的图片变换规则：

```
train_transforms = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.RandomResizedCrop(IMG_SIZE),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(30),
    transforms.ToTensor(),
    transforms.Normalize(IMG_MEAN, IMG_STD)
])

val_transforms = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.CenterCrop(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(IMG_MEAN, IMG_STD)
])
```

我们这里只分割 10% 的数据作为训练时的验证数据：

```
dataset_names = ['train', 'valid']
stratified_split = StratifiedShuffleSplit(n_splits=1, test_size=0.1, random_state=0)
train_split_idx, val_split_idx = next(iter(stratified_split.split(all_labels_df.id, all_labels_df.breed)))
train_df = all_labels_df.iloc[train_split_idx].reset_index()
val_df = all_labels_df.iloc[val_split_idx].reset_index()
print(len(train_df))
print(len(val_df))
```

使用官方的 dataloader 载入数据：

```
image_transforms = {'train':train_transforms, 'valid':val_transforms}

train_dataset = DogDataset(train_df, os.path.join(DATA_ROOT,'train'), transform=image_transforms['train'])
val_dataset = DogDataset(val_df, os.path.join(DATA_ROOT,'train'), transform=image_transforms['valid'])
image_dataset = {'train':train_dataset, 'valid':val_dataset}

image_dataloader = {x:DataLoader(image_dataset[x],batch_size=BATCH_SIZE,shuffle=True,num_workers=0) for x in dataset_names}
dataset_sizes = {x:len(image_dataset[x]) for x in dataset_names}
```

开始配置网络，由于 ImageNet 是识别 1000 个物体，我们的狗的分类一共只有 120，所以需要对模型的最后一层全连接层进行微调，将输出从 1000 改为 120：

```
model_ft = models.resnet50(pretrained=True) # 这里自动下载官方的预训练模型，并且
# 将所有的参数层进行冻结
for param in model_ft.parameters():
    param.requires_grad = False
# 这里打印下全连接层的信息
print(model_ft.fc)
num_fc_ftr = model_ft.fc.in_features #获取到fc层的输入
model_ft.fc = nn.Linear(num_fc_ftr, len(breeds)) # 定义一个新的FC层
model_ft=model_ft.to(DEVICE)# 放到设备中
print(model_ft) # 最后再打印一下新的模型
```

```
Linear(in_features=2048, out_features=1000, bias=True)
ResNet(
  (conv1): Conv2d(3, 64, kernel_size=(7, 7), stride=(2, 2), padding=(3, 3), bias=False)
  (bn1): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
  (relu): ReLU(inplace)
  (maxpool): MaxPool2d(kernel_size=3, stride=2, padding=1, dilation=1, ceil_mode=False)
  (layer1): Sequential(
    (0): Bottleneck(
      (conv1): Conv2d(64, 64, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(64, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
      (downsample): Sequential(
        (0): Conv2d(64, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
        (1): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      )
    )
    (1): Bottleneck(
      (conv1): Conv2d(256, 64, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(64, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
    (2): Bottleneck(
      (conv1): Conv2d(256, 64, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(64, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
  )
  (layer2): Sequential(
    (0): Bottleneck(
      (conv1): Conv2d(256, 128, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(128, 128, kernel_size=(3, 3), stride=(2, 2), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(128, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
      (downsample): Sequential(
        (0): Conv2d(256, 512, kernel_size=(1, 1), stride=(2, 2), bias=False)
        (1): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      )
    )
    (1): Bottleneck(
      (conv1): Conv2d(512, 128, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(128, 128, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(128, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
    (2): Bottleneck(
      (conv1): Conv2d(512, 128, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(128, 128, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(128, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
    (3): Bottleneck(
      (conv1): Conv2d(512, 128, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(128, 128, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(128, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
  )
  (layer3): Sequential(
    (0): Bottleneck(
      (conv1): Conv2d(512, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(256, 256, kernel_size=(3, 3), stride=(2, 2), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(256, 1024, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(1024, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
      (downsample): Sequential(
        (0): Conv2d(512, 1024, kernel_size=(1, 1), stride=(2, 2), bias=False)
        (1): BatchNorm2d(1024, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      )
    )
    (1): Bottleneck(
      (conv1): Conv2d(1024, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(256, 1024, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(1024, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
    (2): Bottleneck(
      (conv1): Conv2d(1024, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(256, 1024, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(1024, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
    (3): Bottleneck(
      (conv1): Conv2d(1024, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(256, 1024, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(1024, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
    (4): Bottleneck(
      (conv1): Conv2d(1024, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(256, 1024, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(1024, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
    (5): Bottleneck(
      (conv1): Conv2d(1024, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(256, 1024, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(1024, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
  )
  (layer4): Sequential(
    (0): Bottleneck(
      (conv1): Conv2d(1024, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(512, 512, kernel_size=(3, 3), stride=(2, 2), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(512, 2048, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(2048, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
      (downsample): Sequential(
        (0): Conv2d(1024, 2048, kernel_size=(1, 1), stride=(2, 2), bias=False)
        (1): BatchNorm2d(2048, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      )
    )
    (1): Bottleneck(
      (conv1): Conv2d(2048, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(512, 2048, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(2048, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
    (2): Bottleneck(
      (conv1): Conv2d(2048, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv2): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
      (bn2): BatchNorm2d(512, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (conv3): Conv2d(512, 2048, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(2048, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      (relu): ReLU(inplace)
    )
  )
  (avgpool): AvgPool2d(kernel_size=7, stride=1, padding=0)
  (fc): Linear(in_features=2048, out_features=120, bias=True)
)
```

设置训练参数：

```
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam([
    {'params':model_ft.fc.parameters()}
], lr=0.001)#指定 新加的fc层的学习率
```

定义训练函数：

```
def train(model,device, train_loader, epoch):
    model.train()
    for batch_idx, data in enumerate(train_loader):
        x,y= data
        x=x.to(device)
        y=y.to(device)
        optimizer.zero_grad()
        y_hat= model(x)
        loss = criterion(y_hat, y)
        loss.backward()
        optimizer.step()
    print ('Train Epoch: {}\t Loss: {:.6f}'.format(epoch,loss.item()))
```

定义测试函数：

```
def test(model, device, test_loader):
    model.eval()
    test_loss = 0
    correct = 0
    with torch.no_grad():
        for i,data in enumerate(test_loader):          
            x,y= data
            x=x.to(device)
            y=y.to(device)
            optimizer.zero_grad()
            y_hat = model(x)
            test_loss += criterion(y_hat, y).item() # sum up batch loss
            pred = y_hat.max(1, keepdim=True)[1] # get the index of the max log-probability
            correct += pred.eq(y.view_as(pred)).sum().item()
    test_loss /= len(test_loader.dataset)
    print('\nTest set: Average loss: {:.4f}, Accuracy: {}/{} ({:.0f}%)\n'.format(
        test_loss, correct, len(val_dataset),
        100. * correct / len(val_dataset)))
```

训练 9 次，看看效果：

```
for epoch in range(1, 10):
    %time train(model=model_ft,device=DEVICE, train_loader=image_dataloader["train"],epoch=epoch)
    test(model=model_ft, device=DEVICE, test_loader=image_dataloader["valid"])
```

```
Train Epoch: 1   Loss: 2.775527
Wall time: 1min 13s

Test set: Average loss: 0.0079, Accuracy: 700/1023 (68%)

Train Epoch: 2   Loss: 1.965775
Wall time: 56.5 s

Test set: Average loss: 0.0047, Accuracy: 779/1023 (76%)

Train Epoch: 3   Loss: 1.798122
Wall time: 56.4 s

Test set: Average loss: 0.0037, Accuracy: 790/1023 (77%)

Train Epoch: 4   Loss: 1.596331
Wall time: 57.1 s

Test set: Average loss: 0.0031, Accuracy: 814/1023 (80%)

Train Epoch: 5   Loss: 1.502677
Wall time: 56.3 s

Test set: Average loss: 0.0029, Accuracy: 822/1023 (80%)

Train Epoch: 6   Loss: 1.430908
Wall time: 56.4 s

Test set: Average loss: 0.0028, Accuracy: 815/1023 (80%)

Train Epoch: 7   Loss: 1.466642
Wall time: 56.4 s

Test set: Average loss: 0.0028, Accuracy: 824/1023 (81%)

Train Epoch: 8   Loss: 1.368286
Wall time: 56.9 s

Test set: Average loss: 0.0025, Accuracy: 840/1023 (82%)

Train Epoch: 9   Loss: 1.348546
Wall time: 56.9 s

Test set: Average loss: 0.0027, Accuracy: 814/1023 (80%)
```

我们看到只训练了 9 次就达到了 80% 的准确率，效果还是可以的。

但是每次训练都需要将一张图片在全部网络中进行计算，而且计算的结果每次都是一样的，这样浪费了很多计算的资源。 下面我们就将这些不进行反向传播或者说不更新网络权重参数层的计算结果保存下来，这样我们以后使用的时候就可以直接将这些结果输入到 FC 层或者以这些结果构建新的网络层，省去了计算的时间，并且这样如果只训练全连接层，CPU 就可以完成了。

## 4.1.4 固定层的向量导出

[PyTorch 论坛](https://discuss.pytorch.org/t/can-i-get-the-middle-layers-output-if-i-use-the-sequential-module/7070)中说到可以使用自己手动实现模型中的 forward 参数，这样看起来是很简便的，但是这样处理起来很麻烦，不建议这样使用。

这里我们就要采用 PyTorch 比较高级的 API，hook 来处理了，我们要先定义一个 hook 函数

```
in_list= [] # 这里存放所有的输出
def hook(module, input, output):
    #input是一个tuple代表顺序代表每一个输入项，我们这里只有一项，所以直接获取
    #需要全部的参数信息可以使用这个打印
    #for val in input:
    #    print("input val:",val)
    for i in range(input[0].size(0)):
        in_list.append(input[0][i].cpu().numpy())
```

在相应的层注册 hook 函数，保证函数能够正常工作，我们这里直接 hook 全连接层前面的 pool 层，获取 pool 层的输入数据，这样会获得更多的特征：

```
model_ft.avgpool.register_forward_hook(hook)
```

```
<torch.utils.hooks.RemovableHandle at 0x24812a5e978>
```

开始获取输出，这里我们因为不需要反向传播，所以直接可以使用 no_grad 嵌套：

```
%%time
with torch.no_grad():
    for batch_idx, data in enumerate(image_dataloader["train"]):
        x,y= data
        x=x.to(DEVICE)
        y=y.to(DEVICE)
        y_hat = model_ft(x)
```

```
Wall time: 1min 23s
```

```
features=np.array(in_list)
np.save("features",features)
```

这样再训练时我们只需将这个数组读出来，然后可以直接使用这个数组再输入到 linear 或者我们前面讲到的 sigmod 层就可以了。

我们在这里在 pool 层前获取了更多的特征，可以将这些特征使用更高级的分类器，例如 SVM，树型的分类器进行分类。

以上就是针对于计算机视觉方向的微调介绍，对于 NLP 方向来讲 fastai 的创始人 Jeremy 在今年出发布了 ULMFiT 可以作为很好的参考。  
具体请看这个链接：

[Universal Language Model Fine-tuning for Text Classification](http://nlp.fast.ai/classification/2018/05/15/introducting-ulmfit.html)