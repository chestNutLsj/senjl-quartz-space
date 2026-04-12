---
title: "Einsum Is All You Need"
author:
  - "Tim Rocktaschel"
published: 2018-04-30
date: "2026-02-26T14:26:12+08:00"
description: "A practical guide to Einstein summation (einsum) for deep learning tensors."
tags:
  - "clippings"
---
> 本文截取自互联网博客并做一定修改：https://rockt.ai/2018/04/30/einsum

When talking to colleagues I realized that not everyone knows about *einsum*, my favorite function for developing deep learning models. This post is trying to change that once and for all!:) Einstein summation (einsum) is implemented in [numpy](https://docs.scipy.org/doc/numpy/reference/generated/numpy.einsum.html), as well as deep learning libraries such as [TensorFlow](https://www.tensorflow.org/api_docs/python/tf/einsum) and, thanks to [Thomas Viehmann](https://github.com/pytorch/pytorch/pull/6307), recently also [PyTorch](http://pytorch.org/docs/master/torch.html?highlight=torch%20max#torch.einsum). For background reading on einsum, I recommend the excellent blog posts by [Olexa Bilaniuk](https://obilaniu6266h16.wordpress.com/2016/02/04/einstein-summation-in-numpy/) and [Alex Riley](http://ajcr.net/Basic-guide-to-einsum/). While their posts discuss einsum in the context of numpy, I am going to illustrate how einsum is extremely useful for writing elegant PyTorch/TensorFlow models.

## 1 Einsum Notation

If you are anything like me, you find it difficult to remember the names and signatures of all the different functions in PyTorch/TensorFlow for calculating dot products, outer products, transposes and matrix-vector or matrix-matrix multiplications. Einsum notation is an elegant way to express all of these, as well as complex operations on tensors, using essentially a domain-specific language. This has benefits beyond not having to memorize or regularly looking up specific library functions. Once you understand and make use of einsum, you will be able to write more concise and efficient code more quickly. When not using einsum it is easy to introduce unnecessary reshaping and transposing of tensors, as well as intermediate tensors that could be omitted. Furthermore, domain-specific languages like einsum can sometimes be compiled to high-performing code, and an einsum-like domain-specific language is in fact the basis for the recently introduced [Tensor Comprehensions](http://pytorch.org/2018/03/05/tensor-comprehensions.html) in PyTorch which automatically generate GPU code and auto-tune that code for specific input sizes. In addition, projects like [opt einsum](https://github.com/dgasmith/opt_einsum) and [tf einsum opt](https://github.com/Bihaqo/tf_einsum_opt) can be used to optimize tensor contraction order of einsum expressions.

Let's say we want to multiply two matrices ${\color{red}\mathbf{A}}\in\mathbb{R}^{I\,\times\,K}$ and ${\color{blue}\mathbf{B}}\in\mathbb{R}^{K\,\times\,J}$ followed by calculating the sum of each column resulting in a vector ${\color{green}\mathbf{c}}\in\mathbb{R}^{J}$. Using Einstein summation notation, we can write this as 
$$
 {\color{green}c_j} = \sum_i\sum_k {\color{red}A_{ik}}{\color{blue}B_{kj}} = {\color{red}A_{ik}}{\color{blue}B_{kj}} 
$$
 which specifies how all individual elements ${\color{green}c_i}$ in $\color{green}\mathbf{c}$ are calculated from multiplying values in the column vectors $\color{red}\mathbf{A}_{i:}$ and row vectors $\color{blue}\mathbf{B}_{:j}$ and summing them up. Note that for Einstein notation, the summation Sigmas can be dropped as we implicitly sum over repeated indices ($k$ in this example) and indices not mentioned in the output specification ($i$ in this example). So far so good, but we can also express more basic operations using einsum. For instance, calculating the dot product of two vectors ${\color{red}\mathbf{a}},{\color{blue}\mathbf{b}}\in\mathbb{R}^I$ can be written as 
$$
 {\color{green}c} = \sum_i {\color{red}a_i}{\color{blue}b_i} = {\color{red}a_i}{\color{blue}b_i}. 
$$
 A problem that I encounter often in deep learning is applying a transformation to vectors in a higher-order tensor. For example, I might have a tensor that contains $T$-long sequences of $K$-dimensional word vectors for $N$ training examples in a batch and I want to project the word vectors to a different dimension $Q$. Let ${\color{red}\mathcal{T}}\in\mathbb{R}^{N\,\times\,T\times\,K}$ be an order-3 tensor where the first dimension corresponds to the batch, the second dimension to the sequence length, and the last dimension to the word vectors. In addition, let ${\color{blue}\mathbf{W}}\in\mathbb{R}^{K\,\times\,Q}$ be a projection matrix. The desired computation can be expressed using einsum 
$$
 {\color{green}C_{ntq}} = \sum_k {\color{red}T_{ntk}}{\color{blue}W_{kq}} = {\color{red}T_{ntk}}{\color{blue}W_{kq}}. 
$$
 As a final example, say you are given an order-4 tensor ${\color{red}\mathcal{T}}\in\mathbb{R}^{N\,\times\,T\times\,K\,\times\,M}$ and you are supposed to project vectors in the 3rd dimension to $Q$ using the projection matrix from before. However, let's say I also ask you to sum over the 2nd dimension and transpose the first and last dimension in the result, yielding a tensor ${\color{green}\mathcal{C}}\in\mathbb{R}^{M\,\times,Q\times\,N}$. Einsum to the rescue! 
$$
 {\color{green}C_{mqn}} = \sum_t\sum_k {\color{red}T_{ntkm}}{\color{blue}W_{kq}} = {\color{red}T_{ntkm}}{\color{blue}W_{kq}}. 
$$
 Note that transposing the result of the tensor contraction is achieved by swapping $n$ with $m$ (${\color{green}C_{mqn}}$ instead of ${\color{green}C_{nqm}}$).

## 2 All you Need: Einsum in numpy, PyTorch, and TensorFlow

Einsum is implemented in [numpy](https://docs.scipy.org/doc/numpy/reference/generated/numpy.einsum.html) via `np.einsum`, in [PyTorch](http://pytorch.org/docs/master/torch.html?highlight=torch%20max#torch.einsum) via `torch.einsum`, and in [TensorFlow](https://www.tensorflow.org/api_docs/python/tf/einsum) via `tf.einsum`. All three einsum functions share the same signature `einsum(equation,operands)` where `equation` is a string representing the Einstein summation and `operands` is a sequence of tensors.The examples above can all be written using an equation string. For instance, our first example ${\color{green}c_j} = \sum_i\sum_k {\color{red}A_{ik}}{\color{blue}B_{kj}}$ can be written as the equation string "${\color{red}ik},{\color{blue}kj}$ -> ${\color{green}j}$". Note that the naming of the indices ($i$, $j$, $k$) is arbitrary but it needs to be used consistently.

What's great about having einsum not only in numpy but also in PyTorch and TensorFlow is that it can be used in arbitrary computation graphs for neural network architectures and that we can backpropagate through it. A typical call to einsum has the following form 
$$
 {\color{green}\textbf{result}} = \text{einsum}("{\color{red}\square\square},{\color{purple}\square\square\square},{\color{blue}\square\square}\,\text{->}\,{\color{green}\square\square}", {\color{red}\text{arg1}}, {\color{purple}\text{arg2}}, {\color{blue}\text{arg3}}) 
$$
 where $\square$ is a placeholder for a character identifying a tensor dimension. From this equation string we can infer that ${\color{red}\text{arg1}}$ and ${\color{blue}\text{arg3}}$ are matrices, ${\color{purple}\text{arg2}}$ is an order-3 tensor, and that the ${\color{green}\textbf{result}}$ of this einsum operation is a matrix. Note that einsum works with a variable number of inputs. In the example above, einsum specifies an operation on three arguments, but it can also be used for operations involving one, two or more than three arguments. Einsum is best learned by studying examples, so let's go through some examples for einsum in PyTorch that correspond to library functions which are used in many deep learning models.

### 2.1 Matrix Transpose


$$
{\color{green}B_{ji}} = {\color{red}A_{ij}}
$$


```
import torch
a = torch.arange(6).reshape(2, 3)
torch.einsum('ij->ji', [a])
```

```
tensor([[ 0.,  3.],
        [ 1.,  4.],
        [ 2.,  5.]])
```

### 2.2 Sum


$$
{\color{green}b} = \sum_i\sum_j {\color{red}A_{ij}} = {\color{red}A_{ij}}
$$


```
a = torch.arange(6).reshape(2, 3)
torch.einsum('ij->', [a])
```

```
tensor(15.)
```

### 2.3 Column Sum


$$
{\color{green}b_j} = \sum_i {\color{red}A_{ij}} = {\color{red}A_{ij}}
$$


```
a = torch.arange(6).reshape(2, 3)
torch.einsum('ij->j', [a])
```

```
tensor([ 3.,  5.,  7.])
```

### 2.4 Row Sum


$$
{\color{green}b_i} = \sum_j {\color{red}A_{ij}} = {\color{red}A_{ij}}
$$


```
a = torch.arange(6).reshape(2, 3)
torch.einsum('ij->i', [a])
```

```
tensor([  3.,  12.])
```

### 2.5 Matrix-Vector Multiplication


$$
{\color{green}c_i} = \sum_k {\color{red}A_{ik}}{\color{blue}b_k} = {\color{red}A_{ik}}{\color{blue}b_k}
$$


```
a = torch.arange(6).reshape(2, 3)
b = torch.arange(3)
torch.einsum('ik,k->i', [a, b])
```

```
tensor([  5.,  14.])
```

### 2.6 Matrix-Matrix Multiplication


$$
{\color{green}C_{ij}} = \sum_k {\color{red}A_{ik}}{\color{blue}B_{kj}} = {\color{red}A_{ik}}{\color{blue}B_{kj}}
$$


```
a = torch.arange(6).reshape(2, 3)
b = torch.arange(15).reshape(3, 5)
torch.einsum('ik,kj->ij', [a, b])
```

```
tensor([[  25.,   28.,   31.,   34.,   37.],
        [  70.,   82.,   94.,  106.,  118.]])
```

### 2.7 Dot Product

Vector: 
$$
{\color{green}c} = \sum_i {\color{red}a_i\color{blue}b_i} = {\color{red}a_i\color{blue}b_i}
$$


```
a = torch.arange(3)
b = torch.arange(3,6)  # -- a vector of length 3 containing [3, 4, 5]
torch.einsum('i,i->', [a, b])
```

```
tensor(14.)
```

Matrix: 
$$
{\color{green}c} = \sum_i\sum_j {\color{red}A_{ij}\color{blue}B_{ij}} = {\color{red}A_{ij}\color{blue}B_{ij}}
$$


```
a = torch.arange(6).reshape(2, 3)
b = torch.arange(6,12).reshape(2, 3)
torch.einsum('ij,ij->', [a, b])
```

```
tensor(145.)
```

### 2.8 Hadamard Product


$$
{\color{green}C_{ij}} = {\color{red}A_{ij}\color{blue}B_{ij}}
$$


```
a = torch.arange(6).reshape(2, 3)
b = torch.arange(6,12).reshape(2, 3)
torch.einsum('ij,ij->ij', [a, b])
```

```
tensor([[  0.,   7.,  16.],
        [ 27.,  40.,  55.]])
```

### 2.9 Outer Product


$$
{\color{green}C_{ij}} = {\color{red}a_i\color{blue}b_j}
$$


```
a = torch.arange(3)
b = torch.arange(3,7)  # -- a vector of length 4 containing [3, 4, 5, 6]
torch.einsum('i,j->ij', [a, b])
```

```
tensor([[  0.,   0.,   0.,   0.],
        [  3.,   4.,   5.,   6.],
        [  6.,   8.,  10.,  12.]])
```

### 2.10 Batch Matrix Multiplication


$$
{\color{green}C_{ijl}} = \sum_k{\color{red}A_{ijk}\color{blue}B_{ikl}} = {\color{red}A_{ijk}\color{blue}B_{ikl}}
$$


```
a = torch.randn(3,2,5)
b = torch.randn(3,5,3)
torch.einsum('ijk,ikl->ijl', [a, b])
```

```
tensor([[[ 1.0886,  0.0214,  1.0690],
         [ 2.0626,  3.2655, -0.1465]],

        [[-6.9294,  0.7499,  1.2976],
         [ 4.2226, -4.5774, -4.8947]],

        [[-2.4289, -0.7804,  5.1385],
         [ 0.8003,  2.9425,  1.7338]]])
```

### 2.11 Tensor Contraction

Batch matrix multiplication is a special case of a [tensor contraction](https://en.wikipedia.org/wiki/Tensor_contraction). Let's say we have two tensors, an order-$n$ tensor ${\color{red}\mathcal{A}}\in\mathbb{R}^{I_1\,\times\,\cdots\,\times\,I_n}$ and an order-$m$ tensor ${\color{blue}\mathcal{B}}\in\mathbb{R}^{J_1\,\times\,\cdots\,\times\,I_m}$. As an example, take $n=4$, $m=5$ and assume that $I_2 = J_3$ and $I_3=J_5$. We can multiply the two tensors in these two dimensions ($2$ and $3$ for $\color{red}\mathcal{A}$ and $3$ and $5$ for $\color{blue}\mathcal{B}$) resulting in a new tensor ${\color{green}\mathcal{C}}\in\mathbb{R}^{I_1\,\times\,I_4\,\times\,J_1\,\times\,J_2\,\times\,J_4}$ as follows 
$$
{\color{green}C_{pstuv}} = \sum_q\sum_r{\color{red}A_{pqrs}\color{blue}B_{tuqvr}} = {\color{red}A_{pqrs}\color{blue}B_{tuqvr}}
$$


```
a = torch.randn(2,3,5,7)
b = torch.randn(11,13,3,17,5)
torch.einsum('pqrs,tuqvr->pstuv', [a, b]).shape
```

```
torch.Size([2, 7, 11, 13, 17])
```

### 2.12 Bilinear Transformation

As mentioned earlier, einsum can operate on more than two tensors. One example where this is used is [bilinear transformation](http://pytorch.org/docs/master/nn.html#torch.nn.Bilinear). 
$$
{\color{green}D_{ij}} = \sum_k\sum_l{\color{red}A_{ik}}{\color{purple}B_{jkl}}{\color{blue}C_{il}} = {\color{red}A_{ik}}{\color{purple}B_{jkl}}{\color{blue}C_{il}}
$$


```
a = torch.randn(2,3)
b = torch.randn(5,3,7)
c = torch.randn(2,7)
torch.einsum('ik,jkl,il->ij', [a, b, c])
```

```
tensor([[ 3.8471,  4.7059, -3.0674, -3.2075, -5.2435],
        [-3.5961, -5.2622, -4.1195,  5.5899,  0.4632]])
```

## 3 Case Studies

### 3.1 TreeQN

An example where I used einsum in the past is implementing equation 6 in . Given a low-dimensional state representation $\mathbf{z}_l$ at layer $l$ and a transition function $\mathbf{W}^a$ per action $a$, we want to calculate all next-state representations $\mathbf{z}^a_{l+1}$ using a residual connection.
$$
 \mathbf{z}^a_{l+1} = \mathbf{z}_l + \tanh(\mathbf{W}^a\mathbf{z}_l) 
$$
 In practice, we want to do this efficiently for a batch $B$ of $K$-dimensional state representations $\mathbf{Z}\in\mathbb{R}^{B\,\times\,K}$ and for all transition functions (*i.e.* for all actions $A$) at the same time. We can arrange these transition functions in a tensor $\mathcal{W}\in\mathbb{R}^{A\,\times\,K\,\times\,K}$ and calculate the next-state representations efficiently using einsum.

```
import torch.nn.functional as F

def random_tensors(shape, num=1, requires_grad=False):
  tensors = [torch.randn(shape, requires_grad=requires_grad) for i in range(0, num)]
  return tensors[0] if num == 1 else tensors

# Parameters
# -- [num_actions x hidden_dimension]
b = random_tensors([5, 3], requires_grad=True)
# -- [num_actions x hidden_dimension x hidden_dimension]
W = random_tensors([5, 3, 3], requires_grad=True)

def transition(zl):
  # -- [batch_size x num_actions x hidden_dimension]
  return zl.unsqueeze(1) + F.tanh(torch.einsum("bk,aki->bai", [zl, W]) + b)

# Sampled dummy inputs
# -- [batch_size x hidden_dimension]
zl = random_tensors([2, 3])

transition(zl)
```

```
tensor([[[ 0.9986,  1.9339,  1.4650],
         [-0.6965,  0.2384, -0.3514],
         [-0.8682,  1.8449,  1.5787],
         [-0.8050,  0.7277,  0.1155],
         [ 1.0204,  1.7439, -0.1679]],

        [[ 0.2334,  0.6767,  0.5646],
         [-0.1398,  0.7524, -0.9820],
         [-0.8377,  0.4516, -0.3306],
         [ 0.4742,  1.1055,  0.1824],
         [ 0.8868,  0.2930,  0.1579]]])
```

### 3.2 Attention

Another real-world example for using einsum is the word-by-word attention mechanism defined in equations 11 to 13 in .

$$
\begin{align*}
\mathbf{M}_t &= \tanh(\mathbf{W}^y\mathbf{Y}+(\mathbf{W}^h\mathbf{h}_t+\mathbf{W}^r\mathbf{r}_{t-1})\otimes \mathbf{e}_L) & \mathbf{M}_t &\in\mathbb{R}^{k\times L}\\
\alpha_t &= \text{softmax}(\mathbf{w}^T\mathbf{M}_t)&\alpha_t&\in\mathbb{R}^L\\
\mathbf{r}_t &= \mathbf{Y}\alpha^T_t + \tanh(\mathbf{W}^t\mathbf{r}_{t-1})&\mathbf{r}_t&\in\mathbb{R}^k
\end{align*}
$$

This is not trivial to implement, particularly if we care about a batched implementation. Einsum to the rescue!

```
# Parameters
# -- [hidden_dimension]
bM, br, w = random_tensors([7], num=3, requires_grad=True)
# -- [hidden_dimension x hidden_dimension]
WY, Wh, Wr, Wt = random_tensors([7, 7], num=4, requires_grad=True)

# Single application of attention mechanism 
def attention(Y, ht, rt1):
  # -- [batch_size x hidden_dimension] 
  tmp = torch.einsum("ik,kl->il", [ht, Wh]) + torch.einsum("ik,kl->il", [rt1, Wr])
  Mt = F.tanh(torch.einsum("ijk,kl->ijl", [Y, WY]) + tmp.unsqueeze(1).expand_as(Y) + bM)
  # -- [batch_size x sequence_length]
  at = F.softmax(torch.einsum("ijk,k->ij", [Mt, w])) 
  # -- [batch_size x hidden_dimension]
  rt = torch.einsum("ijk,ij->ik", [Y, at]) + F.tanh(torch.einsum("ij,jk->ik", [rt1, Wt]) + br)
  # -- [batch_size x hidden_dimension], [batch_size x sequence_dimension]
  return rt, at

# Sampled dummy inputs
# -- [batch_size x sequence_length x hidden_dimension]
Y = random_tensors([3, 5, 7])
# -- [batch_size x hidden_dimension]
ht, rt1 = random_tensors([3, 7], num=2)

rt, at = attention(Y, ht, rt1)
at  # -- print attention weights
```

```
tensor([[ 0.1150,  0.0971,  0.5670,  0.1149,  0.1060],
        [ 0.0496,  0.0470,  0.3465,  0.1513,  0.4057],
        [ 0.0483,  0.5700,  0.0524,  0.2481,  0.0813]])
```

## 4 Summary

Einsum is *one function to rule them all*. It's your Swiss Army knife for all kinds of tensor operations. That said, "einsum is all you need" is obviously an overstatement. If you look at the case studies above, we still need to apply non-linearities and construct extra dimensions (`unsqueeze`). Similarly, for splitting, concatenating or indexing of tensors you still have to employ other library functions. Moreover, einsum in PyTorch currently does not support diagonal elements, so the following throws an error: `torch.einsum('ii->i', [torch.randn(3, 3)])`.

One thing that can become annoying when working with einsum is that you have to instantiate parameters manually, take care of their initialization, and registering them with modules. Still, I strongly encourage you to look out for situations where you can use einsum in your models.

## Footnotes:

<sup><a href="#fnr.1">1</a></sup>

My examples use PyTorch, but translating them to TensorFlow is trivial.

<sup><a href="#fnr.2">2</a></sup>

The first version of this post was incorrectly using a summation Sigma which is not Einstein notation but classical notation. Thanks to [Christian Wolf](https://twitter.com/chriswolfvision/status/990967989473300481) and [reddit/ML](https://www.reddit.com/r/MachineLearning/comments/8g1q4n/d_einsum_is_all_you_need_einstein_summation_in/dy89k1e/) for pointing this out.

<sup><a href="#fnr.3">3</a></sup>

Vasilache, Zinenko, Theodoridis, Goyal, DeVito, Moses, Verdoolaege, Adams and Cohen. **Tensor Comprehensions: Framework-Agnostic High-Performance Machine Learning Abstractions**. *arXiv preprint arXiv:1802.04730*. 2018

<sup><a href="#fnr.4">4</a></sup>

Thanks to [Stephan Hoyer](https://twitter.com/shoyer/status/990990806419881984) and [Alexander Novikov](https://twitter.com/SashaVNovikov/status/991034793533075457) for the pointers.

<sup><a href="#fnr.5">5</a></sup>

Thanks to [Blammar](https://www.reddit.com/r/MachineLearning/comments/8g1q4n/d_einsum_is_all_you_need_einstein_summation_in/dy89k1e/) for pointing out a previous error.

<sup><a href="#fnr.6">6</a></sup>

Thanks to [Martin Trapp](https://twitter.com/martin_trapp/status/990983285022117888) for pointing out that there is also a [Julia](https://github.com/ahwillia/Einsum.jl) implementation.

<sup><a href="#fnr.7">7</a></sup>

In numpy and TensorFlow, operands can be a variable-length argument list whereas in PyTorch it needs to be a list.

<sup><a href="#fnr.8">8</a></sup>

Farquhar, Rocktäschel, Igl and Whiteson. **TreeQN and ATreeC: Differentiable Tree-Structured Models for Deep Reinforcement Learning**. *in: International Conference on Learning Representations (ICLR)*. 2018

<sup><a href="#fnr.9">9</a></sup>

He, Zhang, Ren and Sun. **Deep Residual Learning for Image Recognition**. *in: 2016 IEEE Conference on Computer Vision and Pattern Recognition, CVPR*. 2016

<sup><a href="#fnr.10">10</a></sup>

Rocktäschel, Grefenstette, Hermann, Kocisky and Blunsom. **Reasoning about Entailment with Neural Attention**. *in: International Conference on Learning Representations (ICLR)*. 2016
