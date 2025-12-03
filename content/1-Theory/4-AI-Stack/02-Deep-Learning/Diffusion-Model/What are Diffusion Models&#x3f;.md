---
title: What are Diffusion Models?
author:
  - "[[Lilian Weng]]"
published: 2021-07-11
date: 2025-11-27T15:04:44+08:00
description: "[Updated on 2021-09-19: Highly recommend this blog post on score-based generative modeling by Yang Song (author of several key papers in the references)].[Updated on 2022-08-27: Added classifier-free guidance, GLIDE, unCLIP and Imagen.[Updated on 2022-08-31: Added latent diffusion model.[Updated on 2024-04-13: Added progressive distillation, consistency models, and the Model Architecture section."
tags:
---
> 本文截取自互联网博客并做一定修改：

\[Updated on 2021-09-19: Highly recommend this blog post on [score-based generative modeling](https://yang-song.github.io/blog/2021/score/) by Yang Song (author of several key papers in the references)\].  
\[Updated on 2022-08-27: Added [classifier-free guidance](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#classifier-free-guidance), [GLIDE](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#glide), [unCLIP](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#unclip) and [Imagen](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#imagen).  
\[Updated on 2022-08-31: Added [latent diffusion model](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#ldm).  
\[Updated on 2024-04-13: Added [progressive distillation](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#prog-distll), [consistency models](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#consistency), and the [Model Architecture section](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#model-architecture).

So far, I’ve written about three types of generative models, [GAN](https://lilianweng.github.io/posts/2017-08-20-gan/), [VAE](https://lilianweng.github.io/posts/2018-08-12-vae/), and [Flow-based](https://lilianweng.github.io/posts/2018-10-13-flow-models/) models. They have shown great success in generating high-quality samples, but each has some limitations of its own. GAN models are known for potentially unstable training and less diversity in generation due to their adversarial training nature. VAE relies on a surrogate loss. Flow models have to use specialized architectures to construct reversible transform.

Diffusion models are inspired by non-equilibrium thermodynamics. They define a Markov chain of diffusion steps to slowly add random noise to data and then learn to reverse the diffusion process to construct desired data samples from the noise. Unlike VAE or flow models, diffusion models are learned with a fixed procedure and the latent variable has high dimensionality (same as the original data).

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/generative-overview.png)

Overview of different types of generative models.

Several diffusion-based generative models have been proposed with similar ideas underneath, including *diffusion probabilistic models* ([Sohl-Dickstein et al., 2015](https://arxiv.org/abs/1503.03585)), *noise-conditioned score network* (**NCSN**; [Yang & Ermon, 2019](https://arxiv.org/abs/1907.05600)), and *denoising diffusion probabilistic models* (**DDPM**; [Ho et al. 2020](https://arxiv.org/abs/2006.11239)).

## Forward diffusion process

Given a data point sampled from a real data distribution $x0∼q(x)$ , let us define a *forward diffusion process* in which we add small amount of Gaussian noise to the sample in $T$ steps, producing a sequence of noisy samples $x1,…,xT$ . The step sizes are controlled by a variance schedule ${βt∈(0,1)}t=1T$ .

$$
q(xt|xt−1)=N(xt;1−βtxt−1,βtI)q(x1:T|x0)=∏t=1Tq(xt|xt−1)
$$

The data sample $x0$ gradually loses its distinguishable features as the step $t$ becomes larger. Eventually when $T→∞$ , $xT$ is equivalent to an isotropic Gaussian distribution.

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/DDPM.png)

The Markov chain of forward (reverse) diffusion process of generating a sample by slowly adding (removing) noise. (Image source: Ho et al. 2020 with a few additional annotations)

A nice property of the above process is that we can sample $xt$ at any arbitrary time step $t$ in a closed form using [reparameterization trick](https://lilianweng.github.io/posts/2018-08-12-vae/#reparameterization-trick). Let $αt=1−βt$ and $α¯t=∏i=1tαi$ :

$$
xt=αtxt−1+1−αtϵt−1 ;where ϵt−1,ϵt−2,⋯∼N(0,I)=αtαt−1xt−2+1−αtαt−1ϵ¯t−2 ;where ϵ¯t−2 merges two Gaussians (*).=…=α¯tx0+1−α¯tϵq(xt|x0)=N(xt;α¯tx0,(1−α¯t)I)
$$

(\*) Recall that when we merge two Gaussians with different variance, $N(0,σ12I)$ and $N(0,σ22I)$ , the new distribution is $N(0,(σ12+σ22)I)$ . Here the merged standard deviation is $(1−αt)+αt(1−αt−1)=1−αtαt−1$ .

Usually, we can afford a larger update step when the sample gets noisier, so $β1<β2<⋯<βT$ and therefore $α¯1>⋯>α¯T$ .

### Connection with stochastic gradient Langevin dynamics

Langevin dynamics is a concept from physics, developed for statistically modeling molecular systems. Combined with stochastic gradient descent, *stochastic gradient Langevin dynamics* ([Welling & Teh 2011](https://www.stats.ox.ac.uk/~teh/research/compstats/WelTeh2011a.pdf)) can produce samples from a probability density $p(x)$ using only the gradients $∇xlog⁡p(x)$ in a Markov chain of updates:

$$
xt=xt−1+δ2∇xlog⁡p(xt−1)+δϵt,where ϵt∼N(0,I)
$$

where $δ$ is the step size. When $T→∞,ϵ→0$ , $xT$ equals to the true probability density $p(x)$ .

Compared to standard SGD, stochastic gradient Langevin dynamics injects Gaussian noise into the parameter updates to avoid collapses into local minima.

## Reverse diffusion process

If we can reverse the above process and sample from $q(xt−1|xt)$ , we will be able to recreate the true sample from a Gaussian noise input, $xT∼N(0,I)$ . Note that if $βt$ is small enough, $q(xt−1|xt)$ will also be Gaussian. Unfortunately, we cannot easily estimate $q(xt−1|xt)$ because it needs to use the entire dataset and therefore we need to learn a model $pθ$ to approximate these conditional probabilities in order to run the *reverse diffusion process*.

$$
pθ(x0:T)=p(xT)∏t=1Tpθ(xt−1|xt)pθ(xt−1|xt)=N(xt−1;μθ(xt,t),Σθ(xt,t))
$$
![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/diffusion-example.png)

An example of training a diffusion model for modeling a 2D swiss roll data. (Image source: Sohl-Dickstein et al., 2015 )

It is noteworthy that the reverse conditional probability is tractable when conditioned on $x0$ :

$$
q(xt−1|xt,x0)=N(xt−1;μ~(xt,x0),β~tI)
$$

Using Bayes’ rule, we have:

$$
q(xt−1|xt,x0)=q(xt|xt−1,x0)q(xt−1|x0)q(xt|x0)∝exp⁡(−12((xt−αtxt−1)2βt+(xt−1−α¯t−1x0)21−α¯t−1−(xt−α¯tx0)21−α¯t))=exp⁡(−12(xt2−2αtxtxt−1+αtxt−12βt+xt−12−2α¯t−1x0xt−1+α¯t−1x021−α¯t−1−(xt−α¯tx0)21−α¯t))=exp⁡(−12((αtβt+11−α¯t−1)xt−12−(2αtβtxt+2α¯t−11−α¯t−1x0)xt−1+C(xt,x0)))
$$

where $C(xt,x0)$ is some function not involving $xt−1$ and details are omitted. Following the standard Gaussian density function, the mean and variance can be parameterized as follows (recall that $αt=1−βt$ and $α¯t=∏i=1tαi$ ):

$$
β~t=1/(αtβt+11−α¯t−1)=1/(αt−α¯t+βtβt(1−α¯t−1))=1−α¯t−11−α¯t⋅βtμ~t(xt,x0)=(αtβtxt+α¯t−11−α¯t−1x0)/(αtβt+11−α¯t−1)=(αtβtxt+α¯t−11−α¯t−1x0)1−α¯t−11−α¯t⋅βt=αt(1−α¯t−1)1−α¯txt+α¯t−1βt1−α¯tx0
$$

Thanks to the [nice property](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#nice), we can represent $x0=1α¯t(xt−1−α¯tϵt)$ and plug it into the above equation and obtain:

$$
μ~t=αt(1−α¯t−1)1−α¯txt+α¯t−1βt1−α¯t1α¯t(xt−1−α¯tϵt)=1αt(xt−1−αt1−α¯tϵt)
$$

As demonstrated in Fig. 2., such a setup is very similar to [VAE](https://lilianweng.github.io/posts/2018-08-12-vae/) and thus we can use the variational lower bound to optimize the negative log-likelihood.

$$
−log⁡pθ(x0)≤−log⁡pθ(x0)+DKL(q(x1:T|x0)‖pθ(x1:T|x0)); KL is non-negative=−log⁡pθ(x0)+Ex1:T∼q(x1:T|x0)[log⁡q(x1:T|x0)pθ(x0:T)/pθ(x0)]=−log⁡pθ(x0)+Eq[log⁡q(x1:T|x0)pθ(x0:T)+log⁡pθ(x0)]=Eq[log⁡q(x1:T|x0)pθ(x0:T)]Let LVLB=Eq(x0:T)[log⁡q(x1:T|x0)pθ(x0:T)]≥−Eq(x0)log⁡pθ(x0)
$$

It is also straightforward to get the same result using Jensen’s inequality. Say we want to minimize the cross entropy as the learning objective,

$$
LCE=−Eq(x0)log⁡pθ(x0)=−Eq(x0)log⁡(∫pθ(x0:T)dx1:T)=−Eq(x0)log⁡(∫q(x1:T|x0)pθ(x0:T)q(x1:T|x0)dx1:T)=−Eq(x0)log⁡(Eq(x1:T|x0)pθ(x0:T)q(x1:T|x0))≤−Eq(x0:T)log⁡pθ(x0:T)q(x1:T|x0)=Eq(x0:T)[log⁡q(x1:T|x0)pθ(x0:T)]=LVLB
$$

To convert each term in the equation to be analytically computable, the objective can be further rewritten to be a combination of several KL-divergence and entropy terms (See the detailed step-by-step process in Appendix B in [Sohl-Dickstein et al., 2015](https://arxiv.org/abs/1503.03585)):

$$
LVLB=Eq(x0:T)[log⁡q(x1:T|x0)pθ(x0:T)]=Eq[log⁡∏t=1Tq(xt|xt−1)pθ(xT)∏t=1Tpθ(xt−1|xt)]=Eq[−log⁡pθ(xT)+∑t=1Tlog⁡q(xt|xt−1)pθ(xt−1|xt)]=Eq[−log⁡pθ(xT)+∑t=2Tlog⁡q(xt|xt−1)pθ(xt−1|xt)+log⁡q(x1|x0)pθ(x0|x1)]=Eq[−log⁡pθ(xT)+∑t=2Tlog⁡(q(xt−1|xt,x0)pθ(xt−1|xt)⋅q(xt|x0)q(xt−1|x0))+log⁡q(x1|x0)pθ(x0|x1)]=Eq[−log⁡pθ(xT)+∑t=2Tlog⁡q(xt−1|xt,x0)pθ(xt−1|xt)+∑t=2Tlog⁡q(xt|x0)q(xt−1|x0)+log⁡q(x1|x0)pθ(x0|x1)]=Eq[−log⁡pθ(xT)+∑t=2Tlog⁡q(xt−1|xt,x0)pθ(xt−1|xt)+log⁡q(xT|x0)q(x1|x0)+log⁡q(x1|x0)pθ(x0|x1)]=Eq[log⁡q(xT|x0)pθ(xT)+∑t=2Tlog⁡q(xt−1|xt,x0)pθ(xt−1|xt)−log⁡pθ(x0|x1)]=Eq[DKL(q(xT|x0)∥pθ(xT))⏟LT+∑t=2TDKL(q(xt−1|xt,x0)∥pθ(xt−1|xt))⏟Lt−1−log⁡pθ(x0|x1)⏟L0]
$$

Let’s label each component in the variational lower bound loss separately:

$$
LVLB=LT+LT−1+⋯+L0where LT=DKL(q(xT|x0)∥pθ(xT))Lt=DKL(q(xt|xt+1,x0)∥pθ(xt|xt+1)) for 1≤t≤T−1L0=−log⁡pθ(x0|x1)
$$

Every KL term in $LVLB$ (except for $L0$ ) compares two Gaussian distributions and therefore they can be computed in [closed form](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence#Multivariate_normal_distributions). $LT$ is constant and can be ignored during training because $q$ has no learnable parameters and $xT$ is a Gaussian noise. [Ho et al. 2020](https://arxiv.org/abs/2006.11239) models $L0$ using a separate discrete decoder derived from $N(x0;μθ(x1,1),Σθ(x1,1))$ .

## Parameterization of Lt for Training Loss

Recall that we need to learn a neural network to approximate the conditioned probability distributions in the reverse diffusion process, $pθ(xt−1|xt)=N(xt−1;μθ(xt,t),Σθ(xt,t))$ . We would like to train $μθ$ to predict $μ~t=1αt(xt−1−αt1−α¯tϵt)$ . Because $xt$ is available as input at training time, we can reparameterize the Gaussian noise term instead to make it predict $ϵt$ from the input $xt$ at time step $t$ :

$$
μθ(xt,t)=1αt(xt−1−αt1−α¯tϵθ(xt,t))Thus xt−1=N(xt−1;1αt(xt−1−αt1−α¯tϵθ(xt,t)),Σθ(xt,t))
$$

The loss term $Lt$ is parameterized to minimize the difference from $μ~$ :

$$
Lt=Ex0,ϵ[12‖Σθ(xt,t)‖22‖μ~t(xt,x0)−μθ(xt,t)‖2]=Ex0,ϵ[12‖Σθ‖22‖1αt(xt−1−αt1−α¯tϵt)−1αt(xt−1−αt1−α¯tϵθ(xt,t))‖2]=Ex0,ϵ[(1−αt)22αt(1−α¯t)‖Σθ‖22‖ϵt−ϵθ(xt,t)‖2]=Ex0,ϵ[(1−αt)22αt(1−α¯t)‖Σθ‖22‖ϵt−ϵθ(α¯tx0+1−α¯tϵt,t)‖2]
$$

### Simplification

Empirically, [Ho et al. (2020)](https://arxiv.org/abs/2006.11239) found that training the diffusion model works better with a simplified objective that ignores the weighting term:

$$
Ltsimple=Et∼[1,T],x0,ϵt[‖ϵt−ϵθ(xt,t)‖2]=Et∼[1,T],x0,ϵt[‖ϵt−ϵθ(α¯tx0+1−α¯tϵt,t)‖2]
$$

The final simple objective is:

$$
Lsimple=Ltsimple+C
$$

where $C$ is a constant not depending on $θ$ .

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/DDPM-algo.png)

The training and sampling algorithms in DDPM (Image source: Ho et al. 2020 )

### Connection with noise-conditioned score networks (NCSN)

[Song & Ermon (2019)](https://arxiv.org/abs/1907.05600) proposed a score-based generative modeling method where samples are produced via [Langevin dynamics](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#connection-with-stochastic-gradient-langevin-dynamics) using gradients of the data distribution estimated with score matching. The score of each sample $x$ ’s density probability is defined as its gradient $∇xlog⁡q(x)$ . A score network $sθ:RD→RD$ is trained to estimate it, $sθ(x)≈∇xlog⁡q(x)$ .

To make it scalable with high-dimensional data in the deep learning setting, they proposed to use either *denoising score matching* ([Vincent, 2011](http://www.iro.umontreal.ca/~vincentp/Publications/smdae_techreport.pdf)) or *sliced score matching* (use random projections; [Song et al., 2019](https://arxiv.org/abs/1905.07088)). Denosing score matching adds a pre-specified small noise to the data $q(x~|x)$ and estimates $q(x~)$ with score matching.

Recall that Langevin dynamics can sample data points from a probability density distribution using only the score $∇xlog⁡q(x)$ in an iterative process.

However, according to the manifold hypothesis, most of the data is expected to concentrate in a low dimensional manifold, even though the observed data might look only arbitrarily high-dimensional. It brings a negative effect on score estimation since the data points cannot cover the whole space. In regions where data density is low, the score estimation is less reliable. After adding a small Gaussian noise to make the perturbed data distribution cover the full space $RD$ , the training of the score estimator network becomes more stable. [Song & Ermon (2019)](https://arxiv.org/abs/1907.05600) improved it by perturbing the data with the noise of *different levels* and train a noise-conditioned score network to *jointly* estimate the scores of all the perturbed data at different noise levels.

The schedule of increasing noise levels resembles the forward diffusion process. If we use the diffusion process annotation, the score approximates $sθ(xt,t)≈∇xtlog⁡q(xt)$ . Given a Gaussian distribution $x∼N(μ,σ2I)$ , we can write the derivative of the logarithm of its density function as $∇xlog⁡p(x)=∇x(−12σ2(x−μ)2)=−x−μσ2=−ϵσ$ where $ϵ∼N(0,I)$ . [Recall](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#nice) that $q(xt|x0)∼N(α¯tx0,(1−α¯t)I)$ and therefore,

$$
sθ(xt,t)≈∇xtlog⁡q(xt)=Eq(x0)[∇xtlog⁡q(xt|x0)]=Eq(x0)[−ϵθ(xt,t)1−α¯t]=−ϵθ(xt,t)1−α¯t
$$

## Parameterization of βt

The forward variances are set to be a sequence of linearly increasing constants in [Ho et al. (2020)](https://arxiv.org/abs/2006.11239), from $β1=10−4$ to $βT=0.02$ . They are relatively small compared to the normalized image pixel values between $[−1,1]$ . Diffusion models in their experiments showed high-quality samples but still could not achieve competitive model log-likelihood as other generative models.

[Nichol & Dhariwal (2021)](https://arxiv.org/abs/2102.09672) proposed several improvement techniques to help diffusion models to obtain lower NLL. One of the improvements is to use a cosine-based variance schedule. The choice of the scheduling function can be arbitrary, as long as it provides a near-linear drop in the middle of the training process and subtle changes around $t=0$ and $t=T$ .

$$
βt=clip(1−α¯tα¯t−1,0.999)α¯t=f(t)f(0)where f(t)=cos⁡(t/T+s1+s⋅π2)2
$$

where the small offset $s$ is to prevent $βt$ from being too small when close to $t=0$ .

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/diffusion-beta.png)

Comparison of linear and cosine-based scheduling of β \_ t during training. (Image source: Nichol & Dhariwal, 2021 )

## Parameterization of reverse process variance Σθ

[Ho et al. (2020)](https://arxiv.org/abs/2006.11239) chose to fix $βt$ as constants instead of making them learnable and set $Σθ(xt,t)=σt2I$ , where $σt$ is not learned but set to $βt$ or $β~t=1−α¯t−11−α¯t⋅βt$ . Because they found that learning a diagonal variance $Σθ$ leads to unstable training and poorer sample quality.

[Nichol & Dhariwal (2021)](https://arxiv.org/abs/2102.09672) proposed to learn $Σθ(xt,t)$ as an interpolation between $βt$ and $β~t$ by model predicting a mixing vector $v$ :

$$
Σθ(xt,t)=exp⁡(vlog⁡βt+(1−v)log⁡β~t)
$$

However, the simple objective $Lsimple$ does not depend on $Σθ$ . To add the dependency, they constructed a hybrid objective $Lhybrid=Lsimple+λLVLB$ where $λ=0.001$ is small and stop gradient on $μθ$ in the $LVLB$ term such that $LVLB$ only guides the learning of $Σθ$ . Empirically they observed that $LVLB$ is pretty challenging to optimize likely due to noisy gradients, so they proposed to use a time-averaging smoothed version of $LVLB$ with importance sampling.

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/improved-DDPM-nll.png)

Comparison of negative log-likelihood of improved DDPM with other likelihood-based generative models. NLL is reported in the unit of bits/dim. (Image source: Nichol & Dhariwal, 2021 )

## Conditioned Generation

While training generative models on images with conditioning information such as ImageNet dataset, it is common to generate samples conditioned on class labels or a piece of descriptive text.

## Classifier Guided Diffusion

To explicit incorporate class information into the diffusion process, [Dhariwal & Nichol (2021)](https://arxiv.org/abs/2105.05233) trained a classifier $fϕ(y|xt,t)$ on noisy image $xt$ and use gradients $∇xlog⁡fϕ(y|xt)$ to guide the diffusion sampling process toward the conditioning information $y$ (e.g. a target class label) by altering the noise prediction.[Recall](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#score) that $∇xtlog⁡q(xt)=−11−α¯tϵθ(xt,t)$ and we can write the score function for the joint distribution $q(xt,y)$ as following,

$$
∇xtlog⁡q(xt,y)=∇xtlog⁡q(xt)+∇xtlog⁡q(y|xt)≈−11−α¯tϵθ(xt,t)+∇xtlog⁡fϕ(y|xt)=−11−α¯t(ϵθ(xt,t)−1−α¯t∇xtlog⁡fϕ(y|xt))
$$

Thus, a new classifier-guided predictor $ϵ¯θ$ would take the form as following,

$$
ϵ¯θ(xt,t)=ϵθ(xt,t)−1−α¯t∇xtlog⁡fϕ(y|xt)
$$

To control the strength of the classifier guidance, we can add a weight $w$ to the delta part,

$$
ϵ¯θ(xt,t)=ϵθ(xt,t)−1−α¯tw∇xtlog⁡fϕ(y|xt)
$$

The resulting *ablated diffusion model* (**ADM**) and the one with additional classifier guidance (**ADM-G**) are able to achieve better results than SOTA generative models (e.g. BigGAN).

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/conditioned-DDPM.png)

The algorithms use guidance from a classifier to run conditioned generation with DDPM and DDIM. (Image source: Dhariwal & Nichol, 2021 \])

Additionally with some modifications on the U-Net architecture, [Dhariwal & Nichol (2021)](https://arxiv.org/abs/2105.05233) showed performance better than GAN with diffusion models. The architecture modifications include larger model depth/width, more attention heads, multi-resolution attention, BigGAN residual blocks for up/downsampling, residual connection rescale by $1/2$ and adaptive group normalization (AdaGN).

## Classifier-Free Guidance

Without an independent classifier $fϕ$ , it is still possible to run conditional diffusion steps by incorporating the scores from a conditional and an unconditional diffusion model ([Ho & Salimans, 2021](https://openreview.net/forum?id=qw8AKxfYbI)). Let unconditional denoising diffusion model $pθ(x)$ parameterized through a score estimator $ϵθ(xt,t)$ and the conditional model $pθ(x|y)$ parameterized through $ϵθ(xt,t,y)$ . These two models can be learned via a single neural network. Precisely, a conditional diffusion model $pθ(x|y)$ is trained on paired data $(x,y)$ , where the conditioning information $y$ gets discarded periodically at random such that the model knows how to generate images unconditionally as well, i.e. $ϵθ(xt,t)=ϵθ(xt,t,y=∅)$ .

The gradient of an implicit classifier can be represented with conditional and unconditional score estimators. Once plugged into the classifier-guided modified score, the score contains no dependency on a separate classifier.

$$
∇xtlog⁡p(y|xt)=∇xtlog⁡p(xt|y)−∇xtlog⁡p(xt)=−11−α¯t(ϵθ(xt,t,y)−ϵθ(xt,t))ϵ¯θ(xt,t,y)=ϵθ(xt,t,y)−1−α¯tw∇xtlog⁡p(y|xt)=ϵθ(xt,t,y)+w(ϵθ(xt,t,y)−ϵθ(xt,t))=(w+1)ϵθ(xt,t,y)−wϵθ(xt,t)
$$

Their experiments showed that classifier-free guidance can achieve a good balance between FID (distinguish between synthetic and generated images) and IS (quality and diversity).

The guided diffusion model, GLIDE ([Nichol, Dhariwal & Ramesh, et al. 2022](https://arxiv.org/abs/2112.10741)), explored both guiding strategies, CLIP guidance and classifier-free guidance, and found that the latter is more preferred. They hypothesized that it is because CLIP guidance exploits the model with adversarial examples towards the CLIP model, rather than optimize the better matched images generation.

## Speed up Diffusion Models

It is very slow to generate a sample from DDPM by following the Markov chain of the reverse diffusion process, as $T$ can be up to one or a few thousand steps. One data point from [Song et al. (2020)](https://arxiv.org/abs/2010.02502): “For example, it takes around 20 hours to sample 50k images of size 32 × 32 from a DDPM, but less than a minute to do so from a GAN on an Nvidia 2080 Ti GPU.”

## Fewer Sampling Steps & Distillation

One simple way is to run a strided sampling schedule ([Nichol & Dhariwal, 2021](https://arxiv.org/abs/2102.09672)) by taking the sampling update every $⌈T/S⌉$ steps to reduce the process from $T$ to $S$ steps. The new sampling schedule for generation is ${τ1,…,τS}$ where $τ1<τ2<⋯<τS∈[1,T]$ and $S<T$ .

For another approach, let’s rewrite $qσ(xt−1|xt,x0)$ to be parameterized by a desired standard deviation $σt$ according to the [nice property](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#nice):

$$
xt−1=α¯t−1x0+1−α¯t−1ϵt−1=α¯t−1x0+1−α¯t−1−σt2ϵt+σtϵ=α¯t−1(xt−1−α¯tϵθ(t)(xt)α¯t)+1−α¯t−1−σt2ϵθ(t)(xt)+σtϵqσ(xt−1|xt,x0)=N(xt−1;α¯t−1(xt−1−α¯tϵθ(t)(xt)α¯t)+1−α¯t−1−σt2ϵθ(t)(xt),σt2I)
$$

where the model $ϵθ(t)(.)$ predicts the $ϵt$ from $xt$ .

Recall that in $q(xt−1|xt,x0)=N(xt−1;μ~(xt,x0),β~tI)$ , therefore we have:

$$
β~t=σt2=1−α¯t−11−α¯t⋅βt
$$

Let $σt2=η⋅β~t$ such that we can adjust $η∈R+$ as a hyperparameter to control the sampling stochasticity. The special case of $η=0$ makes the sampling process *deterministic*. Such a model is named the *denoising diffusion implicit model* (**DDIM**; [Song et al., 2020](https://arxiv.org/abs/2010.02502)). DDIM has the same marginal noise distribution but deterministically maps noise back to the original data samples.

During generation, we don’t have to follow the whole chain $t=1,…,T$ , but rather a subset of steps. Let’s denote $s<t$ as two steps in this accelerated trajectory. The DDIM update step is:

$$
qσ,s<t(xs|xt,x0)=N(xs;α¯s(xt−1−α¯tϵθ(t)(xt)α¯t)+1−α¯s−σt2ϵθ(t)(xt),σt2I)
$$

While all the models are trained with $T=1000$ diffusion steps in the experiments, they observed that DDIM ( $η=0$ ) can produce the best quality samples when $S$ is small, while DDPM ( $η=1$ ) performs much worse on small $S$ . DDPM does perform better when we can afford to run the full reverse Markov diffusion steps ( $S=T=1000$ ). With DDIM, it is possible to train the diffusion model up to any arbitrary number of forward steps but only sample from a subset of steps in the generative process.

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/DDIM-results.png)

FID scores on CIFAR10 and CelebA datasets by diffusion models of different settings, including DDIM ( η = 0 ) and DDPM σ ^ ). (Image source: Song et al., 2020 )

Compared to DDPM, DDIM is able to:

1. Generate higher-quality samples using a much fewer number of steps.
2. Have “consistency” property since the generative process is deterministic, meaning that multiple samples conditioned on the same latent variable should have similar high-level features.
3. Because of the consistency, DDIM can do semantically meaningful interpolation in the latent variable.
![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/progressive-distillation.png)

Progressive distillation can reduce the diffusion sampling steps by half in each iteration. (Image source: Salimans & Ho, 2022 )

**Progressive Distillation** ([Salimans & Ho, 2022](https://arxiv.org/abs/2202.00512)) is a method for distilling trained deterministic samplers into new models of halved sampling steps. The student model is initialized from the teacher model and denoises towards a target where one student DDIM step matches 2 teacher steps, instead of using the original sample $x0$ as the denoise target. In every progressive distillation iteration, we can half the sampling steps.

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/progressive-distillation-algo.png)

Comparison of Algorithm 1 (diffusion model training) and Algorithm 2 (progressive distillation) side-by-side, where the relative changes in progressive distillation are highlighted in green. (Image source: Salimans & Ho, 2022 )

**Consistency Models** ([Song et al. 2023](https://arxiv.org/abs/2303.01469)) learns to map any intermediate noisy data points $xt,t>0$ on the diffusion sampling trajectory back to its origin $x0$ directly. It is named as *consistency* model because of its *self-consistency* property as any data points on the same trajectory is mapped to the same origin.

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/consistency-models.png)

Consistency models learn to map any data point on the trajectory back to its origin. (Image source: Song et al., 2023 )

Given a trajectory ${xt|t∈[ϵ,T]}$ , the *consistency function* $f$ is defined as $f:(xt,t)↦xϵ$ and the equation $f(xt,t)=f(xt′,t′)=xϵ$ holds true for all $t,t′∈[ϵ,T]$ . When $t=ϵ$ , $f$ is an identify function. The model can be parameterized as follows, where $cskip(t)$ and $cout(t)$ functions are designed in a way that $cskip(ϵ)=1,cout(ϵ)=0$ :

$$
fθ(x,t)=cskip(t)x+cout(t)Fθ(x,t)
$$

It is possible for the consistency model to generate samples in a single step, while still maintaining the flexibility of trading computation for better quality following a multi-step sampling process.

The paper introduced two ways to train consistency models:

1. **Consistency Distillation (CD)**: Distill a diffusion model into a consistency model by minimizing the difference between model outputs for pairs generated out of the same trajectory. This enables a much cheaper sampling evaluation. The consistency distillation loss is:
	$$
	LCDN(θ,θ−;ϕ)=E[λ(tn)d(fθ(xtn+1,tn+1),fθ−(x^tnϕ,tn)]x^tnϕ=xtn+1−(tn−tn+1)Φ(xtn+1,tn+1;ϕ)
	$$
	where
	- $Φ(.;ϕ)$ is the update function of a one-step [ODE](https://en.wikipedia.org/wiki/Ordinary_differential_equation) solver;
	- $n∼U[1,N−1]$ , has an uniform distribution over $1,…,N−1$ ;
	- The network parameters $θ−$ is EMA version of $θ$ which greatly stabilizes the training (just like in [DQN](https://lilianweng.github.io/posts/2018-02-19-rl-overview/#deep-q-network) or [momentum](https://lilianweng.github.io/posts/2021-05-31-contrastive/#moco--moco-v2) contrastive learning);
	- $d(.,.)$ is a positive distance metric function that satisfies $∀x,y:d(x,y)≥0$ and $d(x,y)=0$ if and only if $x=y$ such as $ℓ2$ , $ℓ1$ or [LPIPS](https://arxiv.org/abs/1801.03924) (learned perceptual image patch similarity) distance;
	- $λ(.)∈R+$ is a positive weighting function and the paper sets $λ(tn)=1$ .
2. **Consistency Training (CT)**: The other option is to train a consistency model independently. Note that in CD, a pre-trained score model $sϕ(x,t)$ is used to approximate the ground truth score $∇log⁡pt(x)$ but in CT we need a way to estimate this score function and it turns out an unbiased estimator of $∇log⁡pt(x)$ exists as $−xt−xt2$ . The CT loss is defined as follows:
$$
LCTN(θ,θ−;ϕ)=E[λ(tn)d(fθ(x+tn+1z,tn+1),fθ−(x+tnz,tn)] where z∈N(0,I)
$$

According to the experiments in the paper, they found,

- Heun ODE solver works better than Euler’s first-order solver, since higher order ODE solvers have smaller estimation errors with the same $N$ .
- Among different options of the distance metric function $d(.)$ , the LPIPS metric works better than $ℓ1$ and $ℓ2$ distance.
- Smaller $N$ leads to faster convergence but worse samples, whereas larger $N$ leads to slower convergence but better samples upon convergence.
![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/consistency-models-exp.png)

Comparison of consistency models' performance under different configurations. The best configuration for CD is LPIPS distance metric, Heun ODE solver, and N = 18. (Image source: Song et al., 2023 )

## Latent Variable Space

*Latent diffusion model* (**LDM**; [Rombach & Blattmann, et al. 2022](https://arxiv.org/abs/2112.10752)) runs the diffusion process in the latent space instead of pixel space, making training cost lower and inference speed faster. It is motivated by the observation that most bits of an image contribute to perceptual details and the semantic and conceptual composition still remains after aggressive compression. LDM loosely decomposes the perceptual compression and semantic compression with generative modeling learning by first trimming off pixel-level redundancy with autoencoder and then manipulating / generating semantic concepts with diffusion process on learned latent.

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/image-distortion-rate.png)

The plot for tradeoff between compression rate and distortion, illustrating two-stage compressions - perceptual and semantic compression. (Image source: Rombach & Blattmann, et al. 2022 )

The perceptual compression process relies on an autoencoder model. An encoder $E$ is used to compress the input image $x∈RH×W×3$ to a smaller 2D latent vector $z=E(x)∈Rh×w×c$ , where the downsampling rate $f=H/h=W/w=2m,m∈N$ . Then an decoder $D$ reconstructs the images from the latent vector, $x~=D(z)$ . The paper explored two types of regularization in autoencoder training to avoid arbitrarily high-variance in the latent spaces.

- *KL-reg*: A small KL penalty towards a standard normal distribution over the learned latent, similar to [VAE](https://lilianweng.github.io/posts/2018-08-12-vae/).
- *VQ-reg*: Uses a vector quantization layer within the decoder, like [VQVAE](https://lilianweng.github.io/posts/2018-08-12-vae/#vq-vae-and-vq-vae-2) but the quantization layer is absorbed by the decoder.

The diffusion and denoising processes happen on the latent vector $z$ . The denoising model is a time-conditioned U-Net, augmented with the cross-attention mechanism to handle flexible conditioning information for image generation (e.g. class labels, semantic maps, blurred variants of an image). The design is equivalent to fuse representation of different modality into the model with a cross-attention mechanism. Each type of conditioning information is paired with a domain-specific encoder $τθ$ to project the conditioning input $y$ to an intermediate representation that can be mapped into cross-attention component, $τθ(y)∈RM×dτ$ :

$$
Attention(Q,K,V)=softmax(QK⊤d)⋅Vwhere Q=WQ(i)⋅φi(zi),K=WK(i)⋅τθ(y),V=WV(i)⋅τθ(y)and WQ(i)∈Rd×dϵi,WK(i),WV(i)∈Rd×dτ,φi(zi)∈RN×dϵi,τθ(y)∈RM×dτ
$$
![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/latent-diffusion-arch.png)

The architecture of the latent diffusion model (LDM). (Image source: Rombach & Blattmann, et al. 2022 )

## Scale up Generation Resolution and Quality

To generate high-quality images at high resolution, [Ho et al. (2021)](https://arxiv.org/abs/2106.15282) proposed to use a pipeline of multiple diffusion models at increasing resolutions. *Noise conditioning augmentation* between pipeline models is crucial to the final image quality, which is to apply strong data augmentation to the conditioning input $z$ of each super-resolution model $pθ(x|z)$ . The conditioning noise helps reduce compounding error in the pipeline setup. *U-net* is a common choice of model architecture in diffusion modeling for high-resolution image generation.

![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/cascaded-diffusion.png)

A cascaded pipeline of multiple diffusion models at increasing resolutions. (Image source: Ho et al. 2021 \])

They found the most effective noise is to apply Gaussian noise at low resolution and Gaussian blur at high resolution. In addition, they also explored two forms of conditioning augmentation that require small modification to the training process. Note that conditioning noise is only applied to training but not at inference.

- Truncated conditioning augmentation stops the diffusion process early at step $t>0$ for low resolution.
- Non-truncated conditioning augmentation runs the full low resolution reverse process until step 0 but then corrupt it by $zt∼q(xt|x0)$ and then feeds the corrupted $zt$ s into the super-resolution model.

The two-stage diffusion model **unCLIP** ([Ramesh et al. 2022](https://arxiv.org/abs/2204.06125)) heavily utilizes the CLIP text encoder to produce text-guided images at high quality. Given a pretrained CLIP model $c$ and paired training data for the diffusion model, $(x,y)$ , where $x$ is an image and $y$ is the corresponding caption, we can compute the CLIP text and image embedding, $ct(y)$ and $ci(x)$ , respectively. The unCLIP learns two models in parallel:

- A prior model $P(ci|y)$ : outputs CLIP image embedding $ci$ given the text $y$ .
- A decoder $P(x|ci,[y])$ : generates the image $x$ given CLIP image embedding $ci$ and optionally the original text $y$ .

These two models enable conditional generation, because

$$
P(x|y)=P(x,ci|y)⏟ci is deterministic given x=P(x|ci,y)P(ci|y)
$$
![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/unCLIP.png)

The architecture of unCLIP. (Image source: Ramesh et al. 2022 \])

unCLIP follows a two-stage image generation process:

1. Given a text $y$ , a CLIP model is first used to generate a text embedding $ct(y)$ . Using CLIP latent space enables zero-shot image manipulation via text.
2. A diffusion or autoregressive prior $P(ci|y)$ processes this CLIP text embedding to construct an image prior and then a diffusion decoder $P(x|ci,[y])$ generates an image, conditioned on the prior. This decoder can also generate image variations conditioned on an image input, preserving its style and semantics.

Instead of CLIP model, **Imagen** ([Saharia et al. 2022](https://arxiv.org/abs/2205.11487)) uses a pre-trained large LM (i.e. a frozen T5-XXL text encoder) to encode text for image generation. There is a general trend that larger model size can lead to better image quality and text-image alignment. They found that T5-XXL and CLIP text encoder achieve similar performance on MS-COCO, but human evaluation prefers T5-XXL on DrawBench (a collection of prompts covering 11 categories).

When applying classifier-free guidance, increasing $w$ may lead to better image-text alignment but worse image fidelity. They found that it is due to train-test mismatch, that is to say, because training data $x$ stays within the range $[−1,1]$ , the test data should be so too. Two thresholding strategies are introduced:

- Static thresholding: clip $x$ prediction to $[−1,1]$
- Dynamic thresholding: at each sampling step, compute $s$ as a certain percentile absolute pixel value; if $s>1$ , clip the prediction to $[−s,s]$ and divide by $s$ .

Imagen modifies several designs in U-net to make it *efficient U-Net*.

- Shift model parameters from high resolution blocks to low resolution by adding more residual locks for the lower resolutions;
- Scale the skip connections by $1/2$
- Reverse the order of downsampling (move it before convolutions) and upsampling operations (move it after convolution) in order to improve the speed of forward pass.

They found that noise conditioning augmentation, dynamic thresholding and efficient U-Net are critical for image quality, but scaling text encoder size is more important than U-Net size.

## Model Architecture

There are two common backbone architecture choices for diffusion models: U-Net and Transformer.

**U-Net** ([Ronneberger, et al. 2015](https://arxiv.org/abs/1505.04597)) consists of a downsampling stack and an upsampling stack.

- *Downsampling*: Each step consists of the repeated application of two 3x3 convolutions (unpadded convolutions), each followed by a ReLU and a 2x2 max pooling with stride 2. At each downsampling step, the number of feature channels is doubled.
- *Upsampling*: Each step consists of an upsampling of the feature map followed by a 2x2 convolution and each halves the number of feature channels.
- *Shortcuts*: Shortcut connections result in a concatenation with the corresponding layers of the downsampling stack and provide the essential high-resolution features to the upsampling process.
![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/U-net.png)

The U-net architecture. Each blue square is a feature map with the number of channels labeled on top and the height x width dimension labeled on the left bottom side. The gray arrows mark the shortcut connections. (Image source: Ronneberger, 2015 )

To enable image generation conditioned on additional images for composition info like Canny edges, Hough lines, user scribbles, human post skeletons, segmentation maps, depths and normals, **ControlNet** ([Zhang et al. 2023](https://arxiv.org/abs/2302.05543) introduces architectural changes via adding a “sandwiched” zero convolution layers of a trainable copy of the original model weights into each encoder layer of the U-Net. Precisely, given a neural network block $Fθ(.)$ , ControlNet does the following:

1. First, freeze the original parameters $θ$ of the original block
2. Clone it to be a copy with trainable parameters $θc$ and an additional conditioning vector $c$ .
3. Use two zero convolution layers, denoted as $Zθz1(.;.)$ and $Zθz2(.;.)$ , which is 1x1 convo layers with both weights and biases initialized to be zeros, to connect these two blocks. Zero convolutions protect this back-bone by eliminating random noise as gradients in the initial training steps.
4. The final output is: $yc=Fθ(x)+Zθz2(Fθc(x+Zθz1(c)))$
![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/ControlNet.png)

The ControlNet architecture. (Image source: Zhang et al. 2023 )

**Diffusion Transformer** (**DiT**; [Peebles & Xie, 2023](https://arxiv.org/abs/2212.09748)) for diffusion modeling operates on latent patches, using the same design space of [LDM](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/#ldm) (Latent Diffusion Model)\]. DiT has the following setup:

1. Take the latent representation of an input $z$ as input to DiT.
2. “Patchify” the noise latent of size $I×I×C$ into patches of size $p$ and convert it into a sequence of patches of size $(I/p)2$ .
3. Then this sequence of tokens go through Transformer blocks. They are exploring three different designs for how to do generation conditioned on contextual information like timestep $t$ or class label $c$ . Among three designs, *adaLN (Adaptive layer norm)-Zero* works out the best, better than in-context conditioning and cross-attention block. The scale and shift parameters, $γ$ and $β$ , are regressed from the sum of the embedding vectors of $t$ and $c$ . The dimension-wise scaling parameters $α$ is also regressed and applied immediately prior to any residual connections within the DiT block.
4. The transformer decoder outputs noise predictions and an output diagonal covariance prediction.
![](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/DiT.png)

The Diffusion Transformer (DiT) architecture. (Image source: Peebles & Xie, 2023 )

Transformer architecture can be easily scaled up and it is well known for that. This is one of the biggest benefits of DiT as its performance scales up with more compute and larger DiT models are more compute efficient according to the experiments.

## Quick Summary

- **Pros**: Tractability and flexibility are two conflicting objectives in generative modeling. Tractable models can be analytically evaluated and cheaply fit data (e.g. via a Gaussian or Laplace), but they cannot easily describe the structure in rich datasets. Flexible models can fit arbitrary structures in data, but evaluating, training, or sampling from these models is usually expensive. Diffusion models are both analytically tractable and flexible
- **Cons**: Diffusion models rely on a long Markov chain of diffusion steps to generate samples, so it can be quite expensive in terms of time and compute. New methods have been proposed to make the process much faster, but the sampling is still slower than GAN.

## Citation

Cited as:

> Weng, Lilian. (Jul 2021). What are diffusion models? Lil’Log. https://lilianweng.github.io/posts/2021-07-11-diffusion-models/.

Or

```coffeescript
@article{weng2021diffusion,
  title   = "What are diffusion models?",
  author  = "Weng, Lilian",
  journal = "lilianweng.github.io",
  year    = "2021",
  month   = "Jul",
  url     = "https://lilianweng.github.io/posts/2021-07-11-diffusion-models/"
}
```

## References

\[1\] Jascha Sohl-Dickstein et al. [“Deep Unsupervised Learning using Nonequilibrium Thermodynamics.”](https://arxiv.org/abs/1503.03585) ICML 2015.

\[2\] Max Welling & Yee Whye Teh. [“Bayesian learning via stochastic gradient langevin dynamics.”](https://www.stats.ox.ac.uk/~teh/research/compstats/WelTeh2011a.pdf) ICML 2011.

\[3\] Yang Song & Stefano Ermon. [“Generative modeling by estimating gradients of the data distribution.”](https://arxiv.org/abs/1907.05600) NeurIPS 2019.

\[4\] Yang Song & Stefano Ermon. [“Improved techniques for training score-based generative models.”](https://arxiv.org/abs/2006.09011) NeuriPS 2020.

\[5\] Jonathan Ho et al. [“Denoising diffusion probabilistic models.”](https://arxiv.org/abs/2006.11239) arxiv Preprint arxiv:2006.11239 (2020). \[[code](https://github.com/hojonathanho/diffusion)\]

\[6\] Jiaming Song et al. [“Denoising diffusion implicit models.”](https://arxiv.org/abs/2010.02502) arxiv Preprint arxiv:2010.02502 (2020). \[[code](https://github.com/ermongroup/ddim)\]

\[7\] Alex Nichol & Prafulla Dhariwal. [“Improved denoising diffusion probabilistic models”](https://arxiv.org/abs/2102.09672) arxiv Preprint arxiv:2102.09672 (2021). \[[code](https://github.com/openai/improved-diffusion)\]

\[8\] Prafula Dhariwal & Alex Nichol. [“Diffusion Models Beat GANs on Image Synthesis.”](https://arxiv.org/abs/2105.05233) arxiv Preprint arxiv:2105.05233 (2021). \[[code](https://github.com/openai/guided-diffusion)\]

\[9\] Jonathan Ho & Tim Salimans. [“Classifier-Free Diffusion Guidance.”](https://arxiv.org/abs/2207.12598) NeurIPS 2021 Workshop on Deep Generative Models and Downstream Applications.

\[10\] Yang Song, et al. [“Score-Based Generative Modeling through Stochastic Differential Equations.”](https://openreview.net/forum?id=PxTIG12RRHS) ICLR 2021.

\[11\] Alex Nichol, Prafulla Dhariwal & Aditya Ramesh, et al. [“GLIDE: Towards Photorealistic Image Generation and Editing with Text-Guided Diffusion Models.”](https://arxiv.org/abs/2112.10741) ICML 2022.

\[12\] Jonathan Ho, et al. [“Cascaded diffusion models for high fidelity image generation.”](https://arxiv.org/abs/2106.15282) J. Mach. Learn. Res. 23 (2022): 47-1.

\[13\] Aditya Ramesh et al. [“Hierarchical Text-Conditional Image Generation with CLIP Latents.”](https://arxiv.org/abs/2204.06125) arxiv Preprint arxiv:2204.06125 (2022).

\[14\] Chitwan Saharia & William Chan, et al. [“Photorealistic Text-to-Image Diffusion Models with Deep Language Understanding.”](https://arxiv.org/abs/2205.11487) arxiv Preprint arxiv:2205.11487 (2022).

\[15\] Rombach & Blattmann, et al. [“High-Resolution Image Synthesis with Latent Diffusion Models.”](https://arxiv.org/abs/2112.10752) CVPR 2022.[code](https://github.com/CompVis/latent-diffusion)

\[16\] Song et al. [“Consistency Models”](https://arxiv.org/abs/2303.01469) arxiv Preprint arxiv:2303.01469 (2023)

\[17\] Salimans & Ho. [“Progressive Distillation for Fast Sampling of Diffusion Models”](https://arxiv.org/abs/2202.00512) ICLR 2022.

\[18\] Ronneberger, et al. [“U-Net: Convolutional Networks for Biomedical Image Segmentation”](https://arxiv.org/abs/1505.04597) MICCAI 2015.

\[19\] Peebles & Xie. [“Scalable diffusion models with transformers.”](https://arxiv.org/abs/2212.09748) ICCV 2023.

\[20\] Zhang et al. [“Adding Conditional Control to Text-to-Image Diffusion Models.”](https://arxiv.org/abs/2302.05543) arxiv Preprint arxiv:2302.05543 (2023).