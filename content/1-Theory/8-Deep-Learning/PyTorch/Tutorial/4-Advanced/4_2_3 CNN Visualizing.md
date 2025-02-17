---
url: https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/4_2_3_cnn-visualizing/
title: 4.2.3 CNN Visualizing - PyTorch Tutorial
date: 2023-04-12 20:16:36
tag: 
summary:
---
```
%load_ext autoreload
%autoreload 2
import torch
import numpy as np
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from torchvision import models,datasets
import matplotlib.pyplot as plt
torch.__version__
```

```
'1.0.0'
```

在上一节中我们已经通过一个预训练的 VGG16 模型对一张图片进行了分类，下面我们粘贴上一节的代码：

```
cat_img=Image.open('img/1280px-Felis_silvestris_catus_lying_on_rice_straw.jpg')
transform_224= transforms.Compose([
    transforms.Resize(224), 
    transforms.CenterCrop((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225])
])

cat_img_224=transform_224(cat_img)
```

上面的代码是我们读取了一张图片，并对图片进行了一些预处理，下面我们来创建 vgg16 的预训练好网络模型：

```
net = models.vgg16(pretrained=True)# 修改这里可以更换其他与训练的模型
inputs=cat_img_224[np.newaxis] #这两个方法都可以cat_img_224[None,::]
```

进行一次前向的传播，看看得到了什么结果：

```
out = net(inputs)
_, preds = torch.max(out.data, 1)
preds
label=preds.numpy()[0]
label
```

我们看到了，这里返回的是 285，代码几乎一样，但是返回的结果与上一节的样例有差别，这是什么原因呢？ 首先我们先看一下这个数字的含义，我们使用的是通过 imagenet 来作为预训练的模型，imagenet 里面有 1000 个分类，我们如何去找这个含义呢？ 有好心人已经给我们准备好了 [这个连接](https://gist.githubusercontent.com/yrevar/942d3a0ac09ec9e5eb3a/raw/c2c91c8e767d04621020c30ed31192724b863041/imagenet1000_clsid_to_human.txt) 我们找一下 285: 'Egyptian cat', 说明识别出了是一只猫，种类还是埃及猫，应该还是比较准确的，但是这张图片是我特意寻找的，里面包含了很多隐藏的细节，这里就不多介绍了，大家如果有兴趣，可以换一个模型，或者修改下 transforms 方法，看看模型都会识别出来是什么类别。

注：不同的预训练权重也会出现不同的结果，我测试出现过 277，282，287 等结果

下面我们开始进入正题，卷积神经网络的可视化。

## 背景

CNN 模型虽然在图像处理上表现出非常良好的性能和准确性，但一直以来都被认为是一个黑盒模型，人们无法了解里面的工作机制。 针对这个问题，研究人员除了从理论层面去寻找解释外，也提出了一些可视化的方法直观地理解 CNN 的内部机理，毕竟眼见为实，看到了大家就相信了。 这里介绍两类方法，一种是基于 Deconvolution, 另一种则是基于反向传播的方法。我们主要使用代码实现基于反向传播的方法的可视化。

## 基于 Deconvolution 的方法

[Visualizing and Understanding Convolutional Networks](https://arxiv.org/abs/1311.2901) 主要是将激活函数的特征映射回像素空间，来揭示什么样的输入模式能够产生特定的输出, 因为网络是有层级关系的，所以越靠近输出的层级学到的特征越抽象，与实际任务越相关，这里就不多介绍了，[这里](https://github.com/saketd403/Visualizing-and-Understanding-Convolutional-neural-networks)有一个使用 keras 的实现，有兴趣的可以看看。

另外一类的实现就是基于 Backpropagation 的方法，这里我们主要进行介绍，在介绍之前，我们首先要引用一下别人写的代码 [pytorch-cnn-visualizations](https://github.com/utkuozbulak/pytorch-cnn-visualizations) , 将这个代码的 src 目录放到与这个 notebook 同级别目录下，我们后面会直接调用他的代码进行演示操作。

首先，我们做一些准备工作：

```
import sys
sys.path.insert(0, './src/')
def rgb2gray(rgb):
    return np.dot(rgb[...,:3], [0.299, 0.587, 0.114])
def rescale_grads(map,gradtype="all"):
    if(gradtype=="pos"):    
        map = (np.maximum(0, map) / map.max())
    elif gradtype=="neg":
        map = (np.maximum(0, -map) / -map.min())
    else:
        map = map - map.min()
        map /= map.max()
    return map
```

### Guided-Backpropagation

这个方法来自于 ICLR-2015 的文章[《Striving for Simplicity: The All Convolutional Net》](https://arxiv.org/abs/1412.6806)，文中提出了使用 stride convolution 替代 pooling 操作，这样整个结构都只有卷积操作。作者为了研究这种结构的有效性，提出了 guided-backpropagation 的方法。

大致的方法为：选择某一种输出模式，然后通过反向传播计算输出对输入的梯度。这种方式与上一种 deconvnet 的方式的唯一区别在于对 ReLU 梯度的处理。

ReLU 在反向传播的计算采用的前向传播的特征作为门阀，而 deconvnet 采用的是梯度值，guided-backpropagation 则将两者组合在一起使用，这样有助于得到的重构都是正数。

这段话可能有点绕，具体细节还是看论文吧, 我们这里只关注如何实现。

```
inputs.requires_grad=True # 这句话必须要有，否则会报错
from guided_backprop import GuidedBackprop #这里直接引用写好的方法，在src，目录找想对应的文件
GB=GuidedBackprop(net)
gp_grads=GB.generate_gradients(inputs, label)
gp_grads=np.moveaxis(gp_grads,0,-1)
#我们分别计算三类的gp
ag=rescale_grads(gp_grads,gradtype="all")
pg=rescale_grads(gp_grads,gradtype="pos")
ng=rescale_grads(gp_grads,gradtype="neg")
```

下面我们使用 matplotlib 看看结果：

```
plt.imshow(cat_img)
```

```
<matplotlib.image.AxesImage at 0x23d840392e8>
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/4_2_3_cnn-visualizing_15_1.png)

```
plt.imshow(ag)
```

```
<matplotlib.image.AxesImage at 0x23d8441c7f0>
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/4_2_3_cnn-visualizing_16_1.png)

```
plt.imshow(ng)
```

```
<matplotlib.image.AxesImage at 0x23d84487080>
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/4_2_3_cnn-visualizing_17_1.png)

```
plt.imshow(ag)
```

```
<matplotlib.image.AxesImage at 0x23d854b44e0>
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/4_2_3_cnn-visualizing_18_1.png)

上面三张图是 rbg 三个通道的展示结果，下面我们合并成一个通道再看一下：

```
gag=rgb2gray(ag)
plt.imshow(gag)
```

```
<matplotlib.image.AxesImage at 0x23d8550fe80>
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/4_2_3_cnn-visualizing_20_1.png)

```
gpg=rgb2gray(pg)
plt.imshow(gpg)
```

```
<matplotlib.image.AxesImage at 0x23d85576710>
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/4_2_3_cnn-visualizing_21_1.png)

```
gng=rgb2gray(ng)
plt.imshow(gng)
```

```
<matplotlib.image.AxesImage at 0x23d855d4fd0>
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/4_2_3_cnn-visualizing_22_1.png)

### CAM（Class Activation Map）

这个方法严格来说不是基于梯度的，但是后面我们会将反向传播与 CAM 整合，所以简单的对 CAM 做个说明。

CAM 来自 CVPR 2016 [《Learning Deep Features for Discriminative Localization》](https://arxiv.org/abs/1512.04150)，作者在研究 global average pooling（GAP）时，发现 GAP 不止作为一种正则，减轻过拟合，在稍加改进后，可以使得 CNN 具有定位的能力，CAM（class activation map）是指输入中的什么区域能够指示 CNN 进行正确的识别。

通常特征图上每个位置的值在存在其感知野里面某种模式时被激活，最后的 class activation map 是这些模式的线性组合，我们可以通过上采样，将 class activation map 还原到与原图一样的大小，通过叠加，我们就可以知道哪些区域是与最后分类结果息息相关的部分。

这里就不介绍了。

### Grad-CAM

[Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization](https://arxiv.org/abs/1610.02391)

顾名思义 Grad-CAM 的加权系数是通过反向传播得到的，而 CAM 的特征加权系数是分类器的权值。

Grad-CAM 与 CAM 相比，它的优点是适用的范围更广，Grad-CAM 对各类结构，各种任务都可以使用。这两种方法也可以应用于进行弱监督下的目标检测，后续也有相关工作基于它们进行改进来做弱监督目标检测。

```
import math
from gradcam import GradCam
from guided_gradcam import guided_grad_cam
from guided_backprop import GuidedBackprop
nlayers=len(net.features._modules.items())-1
print(nlayers) # 打印一下一共有多少层
cam_list=[]
#下面我们循环每一层

for layer in range(nlayers):
 #GradCam
    grad_cam = GradCam(net,target_layer=layer)
    cam = grad_cam.generate_cam(inputs, label)
 #GuidedBackprop
    GBP = GuidedBackprop(net)
    guided_grads = GBP.generate_gradients(inputs, label)
 # Guided Grad cam
    cam_gb = guided_grad_cam(cam, guided_grads)
    cam_list.append(rgb2gray(np.moveaxis(cam_gb,0,-1)))
```

我们选个图，看看效果：

```
plt.imshow(cam_list[0])
```

```
<matplotlib.image.AxesImage at 0x23d858b7588>
```

![](https://pytorch-tutorial.readthedocs.io/en/latest/tutorial/chapter04_advanced/img/4_2_3_cnn-visualizing_27_1.png)

在 Visualizing and Understanding Convolutional Networks 中作者还给出了其他不同的方法，这里就不详细说明了。

需要注意的是，在使用 Visualizing and Understanding Convolutional Networks 的时候，对网络模型是有要求的，要求网络将模型包含名为 features 的组合层，这部分是代码中写死的，所以在 pytorch 的内置模型中，vgg、alexnet、densenet、squeezenet 是可以直接使用的，inception(googlenet) 和 resnet 没有名为 features 的组合层，如果要使用的话是需要对代码进行修改的。