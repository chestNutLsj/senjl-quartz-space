
A **hidden Markov model** (**HMM**) is a Markov model in which the observations are dependent on a latent (or "hidden") Markov process (referred to as $\displaystyle X$). An HMM requires that there be an observable process ${\displaystyle Y}$ whose outcomes depend on the outcomes of ${\displaystyle X}$ in a known way. Since $\displaystyle X$ cannot be observed directly, the goal is to learn about state of  $\displaystyle X$ by observing  $\displaystyle Y$ By definition of being a Markov model, an HMM has an additional requirement that the outcome of $\displaystyle Y$ at time $t=t_0$ must be "influenced" exclusively by the outcome of  $\displaystyle X$ at $t=t_0$ and that the outcomes of  $\displaystyle X$ and  $\displaystyle Y$ at  ![{\displaystyle t<t_{0}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/112ff019aeabac599ad8c97e3cbe65e491c5c7e7) must be conditionally independent of  $\displaystyle Y$ at $t=t_0$ given  $\displaystyle X$ at time  ![{\displaystyle t=t_{0}.}](https://wikimedia.org/api/rest_v1/media/math/ren$t=t_0$ihood. For linear chain HMMs, the Baum–Welch algorithm can be used to estimate the parameters.

Hidden Markov models are known for their applications to thermodynamics, statistical mechanics, physics, chemistry, economics, finance, signal processing, information theory, pattern recognition—such as speech, handwriting, gesture recognition, part-of-speech tagging, musical score following, partial discharges and bioinformatics.

Definition
----------

Let  ![{\displaystyle X_{n}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/72a8564cedc659cf2f95ae68bc5de2f5207a3285) and  ![{\displaystyle Y_{n}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/f19a1b3bf39298aacb7e2daeab9320130a986fb0) be discrete-time stochastic processes and  ![{\displaystyle n\geq 1}](https://wikimedia.org/api/rest_v1/media/math/render/svg/d8ce9ce38d06f6bf5a3fe063118c09c2b6202bfe). The pair  ![{\displaystyle (X_{n},Y_{n})}](https://wikimedia.org/api/rest_v1/media/math/render/svg/d52ed98685e48f1bab92be87c5cdd638e058116b) is a _hidden Markov model_ if

*    ![{\displaystyle X_{n}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/72a8564cedc659cf2f95ae68bc5de2f5207a3285) is a Markov process whose behavior is not directly observable ("hidden");
*    ![{\displaystyle \operatorname {\mathbf {P} } {\bigl (}Y_{n}\in A\ {\bigl |}\ X_{1}=x_{1},\ldots ,X_{n}=x_{n}{\bigr )}=\operatorname {\mathbf {P} } {\bigl (}Y_{n}\in A\ {\bigl |}\ X_{n}=x_{n}{\bigr )},}](https://wikimedia.org/api/rest_v1/media/math/render/svg/9e059b412dd575786c2565eb0b89ea602e37298d)

for every  ![{\displaystyle n\geq 1,}](https://wikimedia.org/api/rest_v1/media/math/render/svg/cc38ec6af7dd11fdc9baa67365f23906d76da4bb)  ![{\displaystyle x_{1},\ldots ,x_{n},}](https://wikimedia.org/api/rest_v1/media/math/render/svg/8fb4ea72660b223c376e371c2301215a39e53a55) and every Borel set  ![{\displaystyle A}](https://wikimedia.org/api/rest_v1/media/math/render/svg/7daff47fa58cdfd29dc333def748ff5fa4c923e3).

Let  ![{\displaystyle X_{t}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/82120d04dfb3cbadc4912951dd12b5568c9cd8f3) and  ![{\displaystyle Y_{t}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/95734a78eb8407939c3496cbfd92763ced1e41e1) be continuous-time stochastic processes. The pair  ![{\displaystyle (X_{t},Y_{t})}](https://wikimedia.org/api/rest_v1/media/math/render/svg/43551e8342244761a48fcb11ae300d3a1f299722) is a _hidden Markov model_ if

*    ![{\displaystyle X_{t}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/82120d04dfb3cbadc4912951dd12b5568c9cd8f3) is a Markov process whose behavior is not directly observable ("hidden");
*    ![{\displaystyle \operatorname {\mathbf {P} } (Y_{t_{0}}\in A\mid \{X_{t}\in B_{t}\}_{t\leq t_{0}})=\operatorname {\mathbf {P} } (Y_{t_{0}}\in A\mid X_{t_{0}}\in B_{t_{0}})}](https://wikimedia.org/api/rest_v1/media/math/render/svg/8f5faf9bf8284f377417ed5da47b13c9e84c388b),

for every  ![{\displaystyle t_{0},}](https://wikimedia.org/api/rest_v1/media/math/render/svg/950eb6be65c21a0a4e3b432a2469dcd42fc8a908) every Borel set  ![{\displaystyle A,}](https://wikimedia.org/api/rest_v1/media/math/render/svg/2746026864cc5896e3e52443a1c917be2df9d8ea) and every family of Borel sets  ![{\displaystyle \{B_{t}\}_{t\leq t_{0}}.}](https://wikimedia.org/api/rest_v1/media/math/render/svg/0e299f1f9dff053498c3a598ac5c59aae3e02d9c)

### Terminology

The states of the process  ![{\displaystyle X_{n}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/72a8564cedc659cf2f95ae68bc5de2f5207a3285) (resp.  ![{\displaystyle X_{t})}](https://wikimedia.org/api/rest_v1/media/math/render/svg/9ca8defb232945c28630136118eb55cf0892f3dc) are called _hidden states_, and  ![{\displaystyle \operatorname {\mathbf {P} } {\bigl (}Y_{n}\in A\mid X_{n}=x_{n}{\bigr )}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/e99a011d0f67e99b6bd3f45638dcc4dc48a65a0b) (resp.  ![{\displaystyle \operatorname {\mathbf {P} } {\bigl (}Y_{t}\in A\mid X_{t}\in B_{t}{\bigr )})}](https://wikimedia.org/api/rest_v1/media/math/render/svg/5a9f1d7ee383ebd16313eaf22e52bfce46c67304) is called _emission probability_ or _output probability_.

Examples
--------

### Drawing balls from hidden urns

![](//upload.wikimedia.org/wikipedia/commons/thumb/8/8a/HiddenMarkovModel.svg/300px-HiddenMarkovModel.svg.png)Figure 1. Probabilistic parameters of a hidden Markov model (example)  
_X_ — states  
_y_ — possible observations  
_a_ — state transition probabilities  
_b_ — output probabilities

In its discrete form, a hidden Markov process can be visualized as a generalization of the urn problem with replacement (where each item from the urn is returned to the original urn before the next step). Consider this example: in a room that is not visible to an observer there is a genie. The room contains urns X1, X2, X3, ... each of which contains a known mix of balls, each ball labeled y1, y2, y3, ... . The genie chooses an urn in that room and randomly draws a ball from that urn. It then puts the ball onto a conveyor belt, where the observer can observe the sequence of the balls but not the sequence of urns from which they were drawn. The genie has some procedure to choose urns; the choice of the urn for the _n_-th ball depends only upon a random number and the choice of the urn for the (_n_ − 1)-th ball. The choice of urn does not directly depend on the urns chosen before this single previous urn; therefore, this is called a Markov process. It can be described by the upper part of Figure 1.

The Markov process itself cannot be observed, only the sequence of labeled balls, thus this arrangement is called a "hidden Markov process". This is illustrated by the lower part of the diagram shown in Figure 1, where one can see that balls y1, y2, y3, y4 can be drawn at each state. Even if the observer knows the composition of the urns and has just observed a sequence of three balls, _e.g._ y1, y2 and y3 on the conveyor belt, the observer still cannot be _sure_ which urn (_i.e._, at which state) the genie has drawn the third ball from. However, the observer can work out other information, such as the likelihood that the third ball came from each of the urns.

### Weather guessing game

Consider two friends, Alice and Bob, who live far apart from each other and who talk together daily over the telephone about what they did that day. Bob is only interested in three activities: walking in the park, shopping, and cleaning his apartment. The choice of what to do is determined exclusively by the weather on a given day. Alice has no definite information about the weather, but she knows general trends. Based on what Bob tells her he did each day, Alice tries to guess what the weather must have been like.

Alice believes that the weather operates as a discrete Markov chain. There are two states, "Rainy" and "Sunny", but she cannot observe them directly, that is, they are _hidden_ from her. On each day, there is a certain chance that Bob will perform one of the following activities, depending on the weather: "walk", "shop", or "clean". Since Bob tells Alice about his activities, those are the _observations_. The entire system is that of a hidden Markov model (HMM).

Alice knows the general weather trends in the area, and what Bob likes to do on average. In other words, the parameters of the HMM are known. They can be represented as follows in Python:

```
states = ("Rainy", "Sunny")

observations = ("walk", "shop", "clean")

start_probability = {"Rainy": 0.6, "Sunny": 0.4}

transition_probability = {
    "Rainy": {"Rainy": 0.7, "Sunny": 0.3},
    "Sunny": {"Rainy": 0.4, "Sunny": 0.6},
}

emission_probability = {
    "Rainy": {"walk": 0.1, "shop": 0.4, "clean": 0.5},
    "Sunny": {"walk": 0.6, "shop": 0.3, "clean": 0.1},
}

```

In this piece of code, `start_probability` represents Alice's belief about which state the HMM is in when Bob first calls her (all she knows is that it tends to be rainy on average). The particular probability distribution used here is not the equilibrium one, which is (given the transition probabilities) approximately `{'Rainy': 0.57, 'Sunny': 0.43}`. The `transition_probability` represents the change of the weather in the underlying Markov chain. In this example, there is only a 30% chance that tomorrow will be sunny if today is rainy. The `emission_probability` represents how likely Bob is to perform a certain activity on each day. If it is rainy, there is a 50% chance that he is cleaning his apartment; if it is sunny, there is a 60% chance that he is outside for a walk.

![Graphical representation of the given HMM](//upload.wikimedia.org/wikipedia/commons/thumb/4/43/HMMGraph.svg/400px-HMMGraph.svg.png) Graphical representation of the given HMM

_A similar example is further elaborated in the Viterbi algorithm page._

Structural architecture
-----------------------

The diagram below shows the general architecture of an instantiated HMM. Each oval shape represents a random variable that can adopt any of a number of values. The random variable _x_(_t_) is the hidden state at time t (with the model from the above diagram, _x_(_t_) ∈ { _x_1, _x_2, _x_3 }). The random variable _y_(_t_) is the observation at time t (with _y_(_t_) ∈ { _y_1, _y_2, _y_3, _y_4 }). The arrows in the diagram (often called a trellis diagram) denote conditional dependencies.

From the diagram, it is clear that the conditional probability distribution of the hidden variable _x_(_t_) at time t, given the values of the hidden variable x at all times, depends _only_ on the value of the hidden variable _x_(_t_ − 1); the values at time _t_ − 2 and before have no influence. This is called the Markov property. Similarly, the value of the observed variable _y_(_t_) only depends on the value of the hidden variable _x_(_t_) (both at time t).

In the standard type of hidden Markov model considered here, the state space of the hidden variables is discrete, while the observations themselves can either be discrete (typically generated from a categorical distribution) or continuous (typically from a Gaussian distribution). The parameters of a hidden Markov model are of two types, _transition probabilities_ and _emission probabilities_ (also known as _output probabilities_). The transition probabilities control the way the hidden state at time t is chosen given the hidden state at time  ![{\displaystyle t-1}](https://wikimedia.org/api/rest_v1/media/math/render/svg/a215d9553945bb84b3b5a79cc796fb7d6e0629f0).

The hidden state space is assumed to consist of one of N possible values, modelled as a categorical distribution. (See the section below on extensions for other possibilities.) This means that for each of the N possible states that a hidden variable at time t can be in, there is a transition probability from this state to each of the N possible states of the hidden variable at time  ![{\displaystyle t+1}](https://wikimedia.org/api/rest_v1/media/math/render/svg/ab2785d8415d6902b0c93efe1419c4bc3ce4643d), for a total of  ![{\displaystyle N^{2}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/fe131b76af8a2bc86e01b14a7ba843db69c1a164) transition probabilities. Note that the set of transition probabilities for transitions from any given state must sum to 1. Thus, the  ![{\displaystyle N\times N}](https://wikimedia.org/api/rest_v1/media/math/render/svg/99a86c5231bb3cbb863d9d428ebe9ac8db8d4ffb) matrix of transition probabilities is a Markov matrix. Because any transition probability can be determined once the others are known, there are a total of  ![{\displaystyle N(N-1)}](https://wikimedia.org/api/rest_v1/media/math/render/svg/2f1fee54b95983b9c3f7403047c1cfc4af3d43c5) transition parameters.

In addition, for each of the N possible states, there is a set of emission probabilities governing the distribution of the observed variable at a particular time given the state of the hidden variable at that time. The size of this set depends on the nature of the observed variable. For example, if the observed variable is discrete with M possible values, governed by a categorical distribution, there will be  ![{\displaystyle M-1}](https://wikimedia.org/api/rest_v1/media/math/render/svg/a0ff0c82e48914e34b3c3bd227cf4d09a2fb5eb7) separate parameters, for a total of  ![{\displaystyle N(M-1)}](https://wikimedia.org/api/rest_v1/media/math/render/svg/53e1437b1c4092d3415c638d73fbcecc74a4df3d) emission parameters over all hidden states. On the other hand, if the observed variable is an M-dimensional vector distributed according to an arbitrary multivariate Gaussian distribution, there will be M parameters controlling the means and  ![{\displaystyle {\frac {M(M+1)}{2}}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/18dcc1b051fcb4bfe62daa4696df064d873905dd) parameters controlling the covariance matrix, for a total of  ![{\displaystyle N\left(M+{\frac {M(M+1)}{2}}\right)={\frac {NM(M+3)}{2}}=O(NM^{2})}](https://wikimedia.org/api/rest_v1/media/math/render/svg/fea9b108de1b00ed6a13b5dee407a894798ea7c0) emission parameters. (In such a case, unless the value of M is small, it may be more practical to restrict the nature of the covariances between individual elements of the observation vector, e.g. by assuming that the elements are independent of each other, or less restrictively, are independent of all but a fixed number of adjacent elements.)

![Temporal evolution of a hidden Markov model](//upload.wikimedia.org/wikipedia/commons/thumb/8/83/Hmm_temporal_bayesian_net.svg/500px-Hmm_temporal_bayesian_net.svg.png) Temporal evolution of a hidden Markov model

Inference
---------

![](//upload.wikimedia.org/wikipedia/commons/thumb/1/13/HMMsequence.svg/400px-HMMsequence.svg.png)The state transition and output probabilities of an HMM are indicated by the line opacity in the upper part of the diagram. Given that we have observed the output sequence in the lower part of the diagram, we may be interested in the most likely sequence of states that could have produced it. Based on the arrows that are present in the diagram, the following state sequences are candidates:  
5 3 2 5 3 2  
4 3 2 5 3 2  
3 1 2 5 3 2  
We can find the most likely sequence by evaluating the joint probability of both the state sequence and the observations for each case (simply by multiplying the probability values, which here correspond to the opacities of the arrows involved). In general, this type of problem (i.e. finding the most likely explanation for an observation sequence) can be solved efficiently using the Viterbi algorithm.

Several inference problems are associated with hidden Markov models, as outlined below.

### Probability of an observed sequence

The task is to compute in a best way, given the parameters of the model, the probability of a particular output sequence. This requires summation over all possible state sequences:

The probability of observing a sequence

 ![{\displaystyle Y=y(0),y(1),\dots ,y(L-1)\,}](https://wikimedia.org/api/rest_v1/media/math/render/svg/a4b513af58f26432a7d7a0356e4ec571270c2873)

of length _L_ is given by

 ![{\displaystyle P(Y)=\sum _{X}P(Y\mid X)P(X),\,}](https://wikimedia.org/api/rest_v1/media/math/render/svg/62433038e2fa335317993d8deb20c0be53b416c4)

where the sum runs over all possible hidden-node sequences

 ![{\displaystyle X=x(0),x(1),\dots ,x(L-1).\,}](https://wikimedia.org/api/rest_v1/media/math/render/svg/04ddfb5ccab85138570048a2b8ad576cfbd2d4d8)

Applying the principle of dynamic programming, this problem, too, can be handled efficiently using the forward algorithm.

### Probability of the latent variables

A number of related tasks ask about the probability of one or more of the latent variables, given the model's parameters and a sequence of observations  ![{\displaystyle y(1),\dots ,y(t).}](https://wikimedia.org/api/rest_v1/media/math/render/svg/a535986e8c88ca6726fd000c129a7b5b83f946bb)

#### Filtering

The task is to compute, given the model's parameters and a sequence of observations, the distribution over hidden states of the last latent variable at the end of the sequence, i.e. to compute  ![{\displaystyle P(x(t)\ |\ y(1),\dots ,y(t))}](https://wikimedia.org/api/rest_v1/media/math/render/svg/84c378ce7388d8acfb81dedc1d76763fd8a8a06a). This task is used when the sequence of latent variables is thought of as the underlying states that a process moves through at a sequence of points in time, with corresponding observations at each point. Then, it is natural to ask about the state of the process at the end.

This problem can be handled efficiently using the forward algorithm. An example is when the algorithm is applied to a Hidden Markov Network to determine  ![{\displaystyle \mathrm {P} {\big (}h_{t}\ |v_{1:t}{\big )}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/c8b274905a16198bf03ad596492956b345b0919a).

#### Smoothing

This is similar to filtering but asks about the distribution of a latent variable somewhere in the middle of a sequence, i.e. to compute  ![{\displaystyle P(x(k)\ |\ y(1),\dots ,y(t))}](https://wikimedia.org/api/rest_v1/media/math/render/svg/4861e645dc5e7cbca8e87e703ab7ff35e93a37aa) for some  ![{\displaystyle k<t}](https://wikimedia.org/api/rest_v1/media/math/render/svg/7ca1a3ea2d76668acdda69e481b958420402d408). From the perspective described above, this can be thought of as the probability distribution over hidden states for a point in time _k_ in the past, relative to time _t_.

The forward-backward algorithm is a good method for computing the smoothed values for all hidden state variables.

#### Most likely explanation

The task, unlike the previous two, asks about the joint probability of the _entire_ sequence of hidden states that generated a particular sequence of observations (see illustration on the right). This task is generally applicable when HMM's are applied to different sorts of problems from those for which the tasks of filtering and smoothing are applicable. An example is part-of-speech tagging, where the hidden states represent the underlying parts of speech corresponding to an observed sequence of words. In this case, what is of interest is the entire sequence of parts of speech, rather than simply the part of speech for a single word, as filtering or smoothing would compute.

This task requires finding a maximum over all possible state sequences, and can be solved efficiently by the Viterbi algorithm.

### Statistical significance

For some of the above problems, it may also be interesting to ask about statistical significance. What is the probability that a sequence drawn from some null distribution will have an HMM probability (in the case of the forward algorithm) or a maximum state sequence probability (in the case of the Viterbi algorithm) at least as large as that of a particular output sequence? When an HMM is used to evaluate the relevance of a hypothesis for a particular output sequence, the statistical significance indicates the false positive rate associated with failing to reject the hypothesis for the output sequence.

Learning
--------

The parameter learning task in HMMs is to find, given an output sequence or a set of such sequences, the best set of state transition and emission probabilities. The task is usually to derive the maximum likelihood estimate of the parameters of the HMM given the set of output sequences. No tractable algorithm is known for solving this problem exactly, but a local maximum likelihood can be derived efficiently using the Baum–Welch algorithm or the Baldi–Chauvin algorithm. The Baum–Welch algorithm is a special case of the expectation-maximization algorithm.

If the HMMs are used for time series prediction, more sophisticated Bayesian inference methods, like Markov chain Monte Carlo (MCMC) sampling are proven to be favorable over finding a single maximum likelihood model both in terms of accuracy and stability. Since MCMC imposes significant computational burden, in cases where computational scalability is also of interest, one may alternatively resort to variational approximations to Bayesian inference, e.g. Indeed, approximate variational inference offers computational efficiency comparable to expectation-maximization, while yielding an accuracy profile only slightly inferior to exact MCMC-type Bayesian inference.

Applications
------------

![](//upload.wikimedia.org/wikipedia/commons/thumb/7/71/A_profile_HMM_modelling_a_multiple_sequence_alignment.png/220px-A_profile_HMM_modelling_a_multiple_sequence_alignment.png)A profile HMM modelling a multiple sequence alignment of proteins in Pfam

HMMs can be applied in many fields where the goal is to recover a data sequence that is not immediately observable (but other data that depend on the sequence are). Applications include:

*   Computational finance
*   Single-molecule kinetic analysis
*   Neuroscience
*   Cryptanalysis
*   Speech recognition, including Siri
*   Speech synthesis
*   Part-of-speech tagging
*   Document separation in scanning solutions
*   Machine translation
*   Partial discharge
*   Gene prediction
*   Handwriting recognition
*   Alignment of bio-sequences
*   Time series analysis
*   Activity recognition
*   Protein folding
*   Sequence classification
*   Metamorphic virus detection
*   Sequence motif discovery (DNA and proteins)
*   DNA hybridization kinetics
*   Chromatin state discovery
*   Transportation forecasting
*   Solar irradiance variability

History
-------

Hidden Markov models were described in a series of statistical papers by Leonard E. Baum and other authors in the second half of the 1960s. One of the first applications of HMMs was speech recognition, starting in the mid-1970s.

In the second half of the 1980s, HMMs began to be applied to the analysis of biological sequences, in particular DNA. Since then, they have become ubiquitous in the field of bioinformatics.

Extensions
----------

In the hidden Markov models considered above, the state space of the hidden variables is discrete, while the observations themselves can either be discrete (typically generated from a categorical distribution) or continuous (typically from a Gaussian distribution). Hidden Markov models can also be generalized to allow continuous state spaces. Examples of such models are those where the Markov process over hidden variables is a linear dynamical system, with a linear relationship among related variables and where all hidden and observed variables follow a Gaussian distribution. In simple cases, such as the linear dynamical system just mentioned, exact inference is tractable (in this case, using the Kalman filter); however, in general, exact inference in HMMs with continuous latent variables is infeasible, and approximate methods must be used, such as the extended Kalman filter or the particle filter.

Hidden Markov models are generative models, in which the joint distribution of observations and hidden states, or equivalently both the prior distribution of hidden states (the _transition probabilities_) and conditional distribution of observations given states (the _emission probabilities_), is modeled. The above algorithms implicitly assume a uniform prior distribution over the transition probabilities. However, it is also possible to create hidden Markov models with other types of prior distributions. An obvious candidate, given the categorical distribution of the transition probabilities, is the Dirichlet distribution, which is the conjugate prior distribution of the categorical distribution. Typically, a symmetric Dirichlet distribution is chosen, reflecting ignorance about which states are inherently more likely than others. The single parameter of this distribution (termed the _concentration parameter_) controls the relative density or sparseness of the resulting transition matrix. A choice of 1 yields a uniform distribution. Values greater than 1 produce a dense matrix, in which the transition probabilities between pairs of states are likely to be nearly equal. Values less than 1 result in a sparse matrix in which, for each given source state, only a small number of destination states have non-negligible transition probabilities. It is also possible to use a two-level prior Dirichlet distribution, in which one Dirichlet distribution (the upper distribution) governs the parameters of another Dirichlet distribution (the lower distribution), which in turn governs the transition probabilities. The upper distribution governs the overall distribution of states, determining how likely each state is to occur; its concentration parameter determines the density or sparseness of states. Such a two-level prior distribution, where both concentration parameters are set to produce sparse distributions, might be useful for example in unsupervised part-of-speech tagging, where some parts of speech occur much more commonly than others; learning algorithms that assume a uniform prior distribution generally perform poorly on this task. The parameters of models of this sort, with non-uniform prior distributions, can be learned using Gibbs sampling or extended versions of the expectation-maximization algorithm.

An extension of the previously described hidden Markov models with Dirichlet priors uses a Dirichlet process in place of a Dirichlet distribution. This type of model allows for an unknown and potentially infinite number of states. It is common to use a two-level Dirichlet process, similar to the previously described model with two levels of Dirichlet distributions. Such a model is called a _hierarchical Dirichlet process hidden Markov model_, or _HDP-HMM_ for short. It was originally described under the name "Infinite Hidden Markov Model" and was further formalized in "Hierarchical Dirichlet Processes".

A different type of extension uses a discriminative model in place of the generative model of standard HMMs. This type of model directly models the conditional distribution of the hidden states given the observations, rather than modeling the joint distribution. An example of this model is the so-called _maximum entropy Markov model_ (MEMM), which models the conditional distribution of the states using logistic regression (also known as a "maximum entropy model"). The advantage of this type of model is that arbitrary features (i.e. functions) of the observations can be modeled, allowing domain-specific knowledge of the problem at hand to be injected into the model. Models of this sort are not limited to modeling direct dependencies between a hidden state and its associated observation; rather, features of nearby observations, of combinations of the associated observation and nearby observations, or in fact of arbitrary observations at any distance from a given hidden state can be included in the process used to determine the value of a hidden state. Furthermore, there is no need for these features to be statistically independent of each other, as would be the case if such features were used in a generative model. Finally, arbitrary features over pairs of adjacent hidden states can be used rather than simple transition probabilities. The disadvantages of such models are: (1) The types of prior distributions that can be placed on hidden states are severely limited; (2) It is not possible to predict the probability of seeing an arbitrary observation. This second limitation is often not an issue in practice, since many common usages of HMM's do not require such predictive probabilities.

A variant of the previously described discriminative model is the linear-chain conditional random field. This uses an undirected graphical model (aka Markov random field) rather than the directed graphical models of MEMM's and similar models. The advantage of this type of model is that it does not suffer from the so-called _label bias_ problem of MEMM's, and thus may make more accurate predictions. The disadvantage is that training can be slower than for MEMM's.

Yet another variant is the _factorial hidden Markov model_, which allows for a single observation to be conditioned on the corresponding hidden variables of a set of  ![{\displaystyle K}](https://wikimedia.org/api/rest_v1/media/math/render/svg/2b76fce82a62ed5461908f0dc8f037de4e3686b0) independent Markov chains, rather than a single Markov chain. It is equivalent to a single HMM, with  ![{\displaystyle N^{K}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/4cda0a35f9eb8276d799071a218a515391019a42) states (assuming there are  ![{\displaystyle N}](https://wikimedia.org/api/rest_v1/media/math/render/svg/f5e3890c981ae85503089652feb48b191b57aae3) states for each chain), and therefore, learning in such a model is difficult: for a sequence of length  ![{\displaystyle T}](https://wikimedia.org/api/rest_v1/media/math/render/svg/ec7200acd984a1d3a3d7dc455e262fbe54f7f6e0), a straightforward Viterbi algorithm has complexity  ![{\displaystyle O(N^{2K}\,T)}](https://wikimedia.org/api/rest_v1/media/math/render/svg/b874841ca8bf26f386805f273a4d87d43c1cc867). To find an exact solution, a junction tree algorithm could be used, but it results in an  ![{\displaystyle O(N^{K+1}\,K\,T)}](https://wikimedia.org/api/rest_v1/media/math/render/svg/830574b6e885441d00387d772cbaea341d85c3cd) complexity. In practice, approximate techniques, such as variational approaches, could be used.

All of the above models can be extended to allow for more distant dependencies among hidden states, e.g. allowing for a given state to be dependent on the previous two or three states rather than a single previous state; i.e. the transition probabilities are extended to encompass sets of three or four adjacent states (or in general  ![{\displaystyle K}](https://wikimedia.org/api/rest_v1/media/math/render/svg/2b76fce82a62ed5461908f0dc8f037de4e3686b0) adjacent states). The disadvantage of such models is that dynamic-programming algorithms for training them have an  ![{\displaystyle O(N^{K}\,T)}](https://wikimedia.org/api/rest_v1/media/math/render/svg/60f4bf98121cb8c500aad219064d7e98930c8282) running time, for  ![{\displaystyle K}](https://wikimedia.org/api/rest_v1/media/math/render/svg/2b76fce82a62ed5461908f0dc8f037de4e3686b0) adjacent states and  ![{\displaystyle T}](https://wikimedia.org/api/rest_v1/media/math/render/svg/ec7200acd984a1d3a3d7dc455e262fbe54f7f6e0) total observations (i.e. a length-  ![{\displaystyle T}](https://wikimedia.org/api/rest_v1/media/math/render/svg/ec7200acd984a1d3a3d7dc455e262fbe54f7f6e0) Markov chain).

Another recent extension is the _triplet Markov model_, in which an auxiliary underlying process is added to model some data specificities. Many variants of this model have been proposed. One should also mention the interesting link that has been established between the _theory of evidence_ and the _triplet Markov models_ and which allows to fuse data in Markovian context and to model nonstationary data. Note that alternative multi-stream data fusion strategies have also been proposed in the recent literature, e.g.

Finally, a different rationale towards addressing the problem of modeling nonstationary data by means of hidden Markov models was suggested in 2012. It consists in employing a small recurrent neural network (RNN), specifically a reservoir network, to capture the evolution of the temporal dynamics in the observed data. This information, encoded in the form of a high-dimensional vector, is used as a conditioning variable of the HMM state transition probabilities. Under such a setup, we eventually obtain a nonstationary HMM the transition probabilities of which evolve over time in a manner that is inferred from the data itself, as opposed to some unrealistic ad-hoc model of temporal evolution.

In 2023, two innovative algorithms were introduced for the Hidden Markov Model. These algorithms enable the computation of the posterior distribution of the HMM without the necessity of explicitly modeling the joint distribution, utilizing only the conditional distributions. Unlike traditional methods such as the Forward-Backward and Viterbi algorithms, which require knowledge of the joint law of the HMM and can be computationally intensive to learn, the Discriminative Forward-Backward and Discriminative Viterbi algorithms circumvent the need for the observation's law. This breakthrough allows the HMM to be applied as a discriminative model, offering a more efficient and versatile approach to leveraging Hidden Markov Models in various applications.

The model suitable in the context of longitudinal data is named latent Markov model. The basic version of this model has been extended to include individual covariates, random effects and to model more complex data structures such as multilevel data. A complete overview of the latent Markov models, with special attention to the model assumptions and to their practical use is provided in

Measure theory
--------------

See also: Subshift of finite type ![](//upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Blackwell_HMM_example.png/150px-Blackwell_HMM_example.png)The hidden part of a hidden Markov model, whose observable states is non-Markovian.

Given a Markov transition matrix and an invariant distribution on the states, we can impose a probability measure on the set of subshifts. For example, consider the Markov chain given on the left on the states  ![{\displaystyle A,B_{1},B_{2}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/66bcb87b5ee597ea7be6ddda729da7cc78db4b1c), with invariant distribution  ![{\displaystyle \pi =(2/7,4/7,1/7)}](https://wikimedia.org/api/rest_v1/media/math/render/svg/03c9841d0e49379ee53d899e665a7e8999f464c8). If we "forget" the distinction between  ![{\displaystyle B_{1},B_{2}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/c773f341a6a6e72f195fbb73c87dc781482a521c), we project this space of subshifts on  ![{\displaystyle A,B_{1},B_{2}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/66bcb87b5ee597ea7be6ddda729da7cc78db4b1c) into another space of subshifts on  ![{\displaystyle A,B}](https://wikimedia.org/api/rest_v1/media/math/render/svg/96c3298ea9aa77c226be56a7d8515baaa517b90b), and this projection also projects the probability measure down to a probability measure on the subshifts on  ![{\displaystyle A,B}](https://wikimedia.org/api/rest_v1/media/math/render/svg/96c3298ea9aa77c226be56a7d8515baaa517b90b).

The curious thing is that the probability measure on the subshifts on  ![{\displaystyle A,B}](https://wikimedia.org/api/rest_v1/media/math/render/svg/96c3298ea9aa77c226be56a7d8515baaa517b90b) is not created by a Markov chain on  ![{\displaystyle A,B}](https://wikimedia.org/api/rest_v1/media/math/render/svg/96c3298ea9aa77c226be56a7d8515baaa517b90b), not even multiple orders. Intuitively, this is because if one observes a long sequence of  ![{\displaystyle B^{n}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/7cc008f3b356b77d960b4b7e4586d20a1dd9dfe4), then one would become increasingly sure that the  ![{\displaystyle Pr(A|B^{n})\to {\frac {2}{3}}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/271f46a0a5aedef3039b59d53906268d2d6a87d6), meaning that the observable part of the system can be affected by something infinitely in the past.

Conversely, there exists a space of subshifts on 6 symbols, projected to subshifts on 2 symbols, such that any Markov measure on the smaller subshift has a preimage measure that is not Markov of any order (Example 2.6 ).

See also
--------

*   Andrey Markov
*   Baum–Welch algorithm
*   Bayesian inference
*   Bayesian programming
*   Richard James Boys
*   Conditional random field
*   Estimation theory
*   HHpred / HHsearch free server and software for protein sequence searching
*   HMMER, a free hidden Markov model program for protein sequence analysis
*   Hidden Bernoulli model
*   Hidden semi-Markov model
*   Hierarchical hidden Markov model
*   Layered hidden Markov model
*   Sequential dynamical system
*   Stochastic context-free grammar
*   Time Series Analysis
*   Variable-order Markov model
*   Viterbi algorithm

References
----------

1.  **^**
2.  **^** Thad Starner, Alex Pentland. Real-Time American Sign Language Visual Recognition From Video Using Hidden Markov Models. Master's Thesis, MIT, Feb 1995, Program in Media Arts
3.  **^** B. Pardo and W. Birmingham. Modeling Form for On-line Following of Musical Performances Archived 2012-02-06 at the Wayback Machine. AAAI-05 Proc., July 2005.
4.  **^** Satish L, Gururaj BI (April 2003). "Use of hidden Markov models for partial discharge pattern classification". _IEEE Transactions on Dielectrics and Electrical Insulation_.
5.  **^** Li, N; Stephens, M (December 2003). "Modeling linkage disequilibrium and identifying recombination hotspots using single-nucleotide polymorphism data". _Genetics_. **165** (4): 2213–33. doi: 10.1093/genetics/165.4.2213. PMC 1462870. PMID 14704198.
6.  **^** Ernst, Jason; Kellis, Manolis (March 2012). "ChromHMM: automating chromatin-state discovery and characterization". _Nature Methods_. **9** (3): 215–216. doi: 10.1038/nmeth. 1906. PMC 3577932. PMID 22373907.
7.  **^** Lawrence R. Rabiner (February 1989). "A tutorial on Hidden Markov Models and selected applications in speech recognition" (PDF). _Proceedings of the IEEE_. **77** (2): 257–286. CiteSeerX 10.1.1.381.3454. doi: 10.1109/5.18626. S2CID 13618539. [1]
8.  **^** Newberg, L. (2009). "Error statistics of hidden Markov model and hidden Boltzmann model results". _BMC Bioinformatics_. **10**: 212. doi: 10.1186/1471-2105-10-212. PMC 2722652. PMID 19589158. ![Open access icon](//upload.wikimedia.org/wikipedia/commons/thumb/7/77/Open_Access_logo_PLoS_transparent.svg/9px-Open_Access_logo_PLoS_transparent.svg.png)
9.  **^** Sipos, I. Róbert. _Parallel stratified MCMC sampling of AR-HMMs for stochastic time series prediction_. In: Proceedings, 4th Stochastic Modeling Techniques and Data Analysis International Conference with Demographics Workshop (SMTDA2016), pp. 295-306. Valletta, 2016. PDF
10.  **^** Chatzis, Sotirios P.; Kosmopoulos, Dimitrios I. (2011). "A variational Bayesian methodology for hidden Markov models utilizing Student's-t mixtures" (PDF). _Pattern Recognition_. **44** (2): 295–306. Bibcode: 2011PatRe.. 44.. 295C. CiteSeerX 10.1.1.629.6275. doi: 10.1016/j.patcog. 2010.09.001. Archived from the original (PDF) on 2011-04-01. Retrieved 2018-03-11.
11.  **^** Sipos, I. Róbert; Ceffer, Attila; Levendovszky, János (2016). "Parallel Optimization of Sparse Portfolios with AR-HMMs". _Computational Economics_. **49** (4): 563–578. doi: 10.1007/s10614-016-9579-y. S2CID 61882456.
12.  **^** Petropoulos, Anastasios; Chatzis, Sotirios P.; Xanthopoulos, Stylianos (2016). "A novel corporate credit rating system based on Student's-t hidden Markov models". _Expert Systems with Applications_. **53**: 87–105. doi: 10.1016/j.eswa. 2016.01.015.
13.  **^** NICOLAI, CHRISTOPHER (2013). "SOLVING ION CHANNEL KINETICS WITH THE QuB SOFTWARE". _Biophysical Reviews and Letters_. **8** (3n04): 191–211. doi: 10.1142/S1793048013300053.
14.  **^** Higgins, Cameron; Vidaurre, Diego; Kolling, Nils; Liu, Yunzhe; Behrens, Tim; Woolrich, Mark (2022). "Spatiotemporally Resolved Multivariate Pattern Analysis for M/EEG". _Human Brain Mapping_. **43** (10): 3062–3085. doi: 10.1002/hbm. 25835. PMC 9188977. PMID 35302683.
15.  **^** Diomedi, S.; Vaccari, F. E.; Galletti, C.; Hadjidimitrakis, K.; Fattori, P. (2021-10-01). "Motor-like neural dynamics in two parietal areas during arm reaching". _Progress in Neurobiology_. **205**: 102116. doi: 10.1016/j.pneurobio. 2021.102116. hdl: 11585/834094. ISSN 0301-0082. PMID 34217822. S2CID 235703641.
16.  **^** Domingos, Pedro (2015). The Master Algorithm: How the Quest for the Ultimate Learning Machine Will Remake Our World. Basic Books. p. 37. ISBN 9780465061921.
17.  **^** Kundu, Amlan, Yang He, and Paramvir Bahl. "Recognition of handwritten word: first and second order hidden Markov model based approach[_dead link_]." Pattern recognition 22.3 (1989): 283-297.
18.  **^** Stigler, J.; Ziegler, F.; Gieseke, A.; Gebhardt, J. C. M.; Rief, M. (2011). "The Complex Folding Network of Single Calmodulin Molecules". _Science_. **334** (6055): 512–516. Bibcode: 2011Sci... 334.. 512S. doi: 10.1126/science. 1207598. PMID 22034433. S2CID 5502662.
19.  **^** Blasiak, S.; Rangwala, H. (2011). "A Hidden Markov Model Variant for Sequence Classification". _IJCAI Proceedings-International Joint Conference on Artificial Intelligence_. **22**: 1192.
20.  **^** Wong, W.; Stamp, M. (2006). "Hunting for metamorphic engines". _Journal in Computer Virology_. **2** (3): 211–229. doi: 10.1007/s11416-006-0028-7. S2CID 8116065.
21.  **^** Wong, K. -C.; Chan, T. -M.; Peng, C.; Li, Y.; Zhang, Z. (2013). "DNA motif elucidation using belief propagation". _Nucleic Acids Research_. **41** (16): e153. doi: 10.1093/nar/gkt574. PMC 3763557. PMID 23814189.
22.  **^** Shah, Shalin; Dubey, Abhishek K.; Reif, John (2019-05-17). "Improved Optical Multiplexing with Temporal DNA Barcodes". _ACS Synthetic Biology_. **8** (5): 1100–1111. doi: 10.1021/acssynbio. 9b00010. PMID 30951289. S2CID 96448257.
23.  **^** Shah, Shalin; Dubey, Abhishek K.; Reif, John (2019-04-10). "Programming Temporal DNA Barcodes for Single-Molecule Fingerprinting". _Nano Letters_. **19** (4): 2668–2673. Bibcode: 2019NanoL.. 19.2668S. doi: 10.1021/acs. nanolett. 9b00590. ISSN 1530-6984. PMID 30896178. S2CID 84841635.
24.  **^** "ChromHMM: Chromatin state discovery and characterization". _compbio. mit. edu_. Retrieved 2018-08-01.
25.  **^** El Zarwi, Feraz (May 2011). "Modeling and Forecasting the Evolution of Preferences over Time: A Hidden Markov Model of Travel Behavior". arXiv: 1707.09133 [stat. AP].
26.  **^** Morf, H. (Feb 1998). "The stochastic two-state solar irradiance model (STSIM)". _Solar Energy_. **62** (2): 101–112. Bibcode: 1998SoEn... 62.. 101M. doi: 10.1016/S0038-092X (98) 00004-8.
27.  **^** Munkhammar, J.; Widén, J. (Aug 2018). "A Markov-chain probability distribution mixture approach to the clear-sky index". _Solar Energy_. **170**: 174–183. Bibcode: 2018SoEn.. 170.. 174M. doi: 10.1016/j.solener. 2018.05.055. S2CID 125867684.
28.  **^** Munkhammar, J.; Widén, J. (Oct 2018). "An N-state Markov-chain mixture distribution model of the clear-sky index". _Solar Energy_. **173**: 487–495. Bibcode: 2018SoEn.. 173.. 487M. doi: 10.1016/j.solener. 2018.07.056. S2CID 125538244.
29.  **^** Baum, L. E.; Petrie, T. (1966). "Statistical Inference for Probabilistic Functions of Finite State Markov Chains". _The Annals of Mathematical Statistics_. **37** (6): 1554–1563. doi: 10.1214/aoms/1177699147.
30.  **^** Baum, L. E.; Eagon, J. A. (1967). "An inequality with applications to statistical estimation for probabilistic functions of Markov processes and to a model for ecology". _Bulletin of the American Mathematical Society_. **73** (3): 360. doi: 10.1090/S0002-9904-1967-11751-8. Zbl 0157.11101.
31.  **^** Baum, L. E.; Sell, G. R. (1968). "Growth transformations for functions on manifolds". _Pacific Journal of Mathematics_. **27** (2): 211–227. doi: 10.2140/pjm. 1968.27.211.
32.  **^** Baum, L. E.; Petrie, T.; Soules, G.; Weiss, N. (1970). "A Maximization Technique Occurring in the Statistical Analysis of Probabilistic Functions of Markov Chains". _The Annals of Mathematical Statistics_. **41** (1): 164–171. doi: 10.1214/aoms/1177697196. JSTOR 2239727. MR 0287613. Zbl 0188.49603.
33.  **^** Baum, L.E. (1972). "An Inequality and Associated Maximization Technique in Statistical Estimation of Probabilistic Functions of a Markov Process". _Inequalities_. **3**: 1–8.
34.  **^** Baker, J. (1975). "The DRAGON system—An overview". _IEEE Transactions on Acoustics, Speech, and Signal Processing_. **23**: 24–29. doi: 10.1109/TASSP. 1975.1162650.
35.  **^** Jelinek, F.; Bahl, L.; Mercer, R. (1975). "Design of a linguistic statistical decoder for the recognition of continuous speech". _IEEE Transactions on Information Theory_. **21** (3): 250. doi: 10.1109/TIT. 1975.1055384.
36.  **^** Xuedong Huang; M. Jack; Y. Ariki (1990). _Hidden Markov Models for Speech Recognition_. Edinburgh University Press. ISBN 978-0-7486-0162-2.
37.  **^** Xuedong Huang; Alex Acero; Hsiao-Wuen Hon (2001). _Spoken Language Processing_. Prentice Hall. ISBN 978-0-13-022616-7.
38.  **^** M. Bishop and E. Thompson (1986). "Maximum Likelihood Alignment of DNA Sequences". _Journal of Molecular Biology_. **190** (2): 159–165. doi: 10.1016/0022-2836 (86) 90289-5. PMID 3641921. (subscription required) ![Closed access icon](//upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Closed_Access_logo_transparent.svg/9px-Closed_Access_logo_transparent.svg.png)
39.  **^** Durbin, Richard M.; Eddy, Sean R.; Krogh, Anders; Mitchison, Graeme (1998). Biological Sequence Analysis: Probabilistic Models of Proteins and Nucleic Acids (1st ed.). Cambridge, New York: Cambridge University Press. ISBN 0-521-62971-3. OCLC 593254083.
40.  **^** Beal, Matthew J., Zoubin Ghahramani, and Carl Edward Rasmussen. "The infinite hidden Markov model." Advances in neural information processing systems 14 (2002): 577-584.
41.  **^** Teh, Yee Whye, et al. "Hierarchical dirichlet processes." Journal of the American Statistical Association 101.476 (2006).
42.  **^** Ghahramani, Zoubin; Jordan, Michael I. (1997). "Factorial Hidden Markov Models". _Machine Learning_. **29** (2/3): 245–273. doi: 10.1023/A: 1007425814087.
43.  **^** Pieczynski, Wojciech (2002). "Chaı̂nes de Markov Triplet" (PDF). _Comptes Rendus Mathématique_. **335** (3): 275–278. doi: 10.1016/S1631-073X (02) 02462-7.
44.  **^** Pieczynski, Wojciech (2007). "Multisensor triplet Markov chains and theory of evidence". _International Journal of Approximate Reasoning_. **45**: 1–16. doi: 10.1016/j.ijar. 2006.05.001.
45.  **^** Boudaren et al. Archived 2014-03-11 at the Wayback Machine, M. Y. Boudaren, E. Monfrini, W. Pieczynski, and A. Aissani, Dempster-Shafer fusion of multisensor signals in nonstationary Markovian context, EURASIP Journal on Advances in Signal Processing, No. 134, 2012.
46.  **^** Lanchantin et al., P. Lanchantin and W. Pieczynski, Unsupervised restoration of hidden non stationary Markov chain using evidential priors, IEEE Transactions on Signal Processing, Vol. 53, No. 8, pp. 3091-3098, 2005.
47.  **^** Boudaren et al., M. Y. Boudaren, E. Monfrini, and W. Pieczynski, Unsupervised segmentation of random discrete data hidden with switching noise distributions, IEEE Signal Processing Letters, Vol. 19, No. 10, pp. 619-622, October 2012.
48.  **^** Sotirios P. Chatzis, Dimitrios Kosmopoulos, "Visual Workflow Recognition Using a Variational Bayesian Treatment of Multistream Fused Hidden Markov Models," IEEE Transactions on Circuits and Systems for Video Technology, vol. 22, no. 7, pp. 1076-1086, July 2012.
49.  **^** Chatzis, Sotirios P.; Demiris, Yiannis (2012). "A Reservoir-Driven Non-Stationary Hidden Markov Model". _Pattern Recognition_. **45** (11): 3985–3996. Bibcode: 2012PatRe.. 45.3985C. doi: 10.1016/j.patcog. 2012.04.018. hdl: 10044/1/12611.
50.  **^** M. Lukosevicius, H. Jaeger (2009) Reservoir computing approaches to recurrent neural network training, Computer Science Review **3**: 127–149.
51.  **^** Azeraf, E., Monfrini, E., & Pieczynski, W. (2023). Equivalence between LC-CRF and HMM, and Discriminative Computing of HMM-Based MPM and MAP. Algorithms, 16 (3), 173.
52.  **^** Azeraf, E., Monfrini, E., Vignon, E., & Pieczynski, W. (2020). Hidden markov chains, entropic forward-backward, and part-of-speech tagging. arXiv preprint arXiv: 2005.10629.
53.  **^** Azeraf, E., Monfrini, E., & Pieczynski, W. (2022). Deriving discriminative classifiers from generative models. arXiv preprint arXiv: 2201.00844.
54.  **^** Ng, A., & Jordan, M. (2001). On discriminative vs. generative classifiers: A comparison of logistic regression and naive bayes. Advances in neural information processing systems, 14.
55.  **^** Wiggins, L. M. (1973). _Panel Analysis: Latent Probability Models for Attitude and Behaviour Processes_. Amsterdam: Elsevier.
56.  **^** Bartolucci, F.; Farcomeni, A.; Pennoni, F. (2013). Latent Markov models for longitudinal data. Boca Raton: Chapman and Hall/CRC. ISBN 978-14-3981-708-7.
57.  **^** _Sofic Measures: Characterizations of Hidden Markov Chains by Linear Algebra, Formal Languages, and Symbolic Dynamics_ - Karl Petersen, Mathematics 210, Spring 2006, University of North Carolina at Chapel Hill
58.  ^ Jump up to: a b Boyle, Mike; Petersen, Karl (2010-01-13), _Hidden Markov processes in the context of symbolic dynamics_, arXiv: 0907.1858

External links
--------------

### Concepts

*   Teif, V. B.; Rippe, K. (2010). "Statistical–mechanical lattice models for protein–DNA binding in chromatin". _J. Phys.: Condens. Matter_. **22** (41): 414105. arXiv: 1004.5514. Bibcode: 2010JPCM... 22O4105T. doi: 10.1088/0953-8984/22/41/414105. PMID 21386588. S2CID 103345.
*   A Revealing Introduction to Hidden Markov Models by Mark Stamp, San Jose State University.
*   Fitting HMM's with expectation-maximization – complete derivation
*   A step-by-step tutorial on HMMs Archived 2017-08-13 at the Wayback Machine _(University of Leeds)_
*   Hidden Markov Models _(an exposition using basic mathematics)_
*   Hidden Markov Models _(by Narada Warakagoda)_
*   Hidden Markov Models: Fundamentals and Applications Part 1, Part 2 _(by V. Petrushin)_
*   Lecture on a Spreadsheet by Jason Eisner, Video and interactive spreadsheet

*   Bernoulli process
*   Branching process
*   Chinese restaurant process
*   Galton–Watson process
*   Independent and identically distributed random variables
*   Markov chain
*   Moran process
*   Random walk
    *   Loop-erased
    *   Self-avoiding
    *   Biased
    *   Maximal entropy

Continuous time

*   Additive process
*   Bessel process
*   Birth–death process
    *   pure birth
*   Brownian motion
    *   Bridge
    *   Excursion
    *   Fractional
    *   Geometric
    *   Meander
*   Cauchy process
*   Contact process
*   Continuous-time random walk
*   Cox process
*   Diffusion process
*   Dyson Brownian motion
*   Empirical process
*   Feller process
*   Fleming–Viot process
*   Gamma process
*   Geometric process
*   Hawkes process
*   Hunt process
*   Interacting particle systems
*   Itô diffusion
*   Itô process
*   Jump diffusion
*   Jump process
*   Lévy process
*   Local time
*   Markov additive process
*   McKean–Vlasov process
*   Ornstein–Uhlenbeck process
*   Poisson process
    *   Compound
    *   Non-homogeneous
*   Schramm–Loewner evolution
*   Semimartingale
*   Sigma-martingale
*   Stable process
*   Superprocess
*   Telegraph process
*   Variance gamma process
*   Wiener process
*   Wiener sausage

Both

*   Branching process
*   Galves–Löcherbach model
*   Gaussian process
*   Hidden Markov model (HMM)
*   Markov process
*   Martingale
    *   Differences
    *   Local
    *   Sub-
    *   Super-
*   Random dynamical system
*   Regenerative process
*   Renewal process
*   Stochastic chains with memory of variable length
*   White noise

Fields and other

*   Dirichlet process
*   Gaussian random field
*   Gibbs measure
*   Hopfield model
*   Ising model
    *   Potts model
    *   Boolean network
*   Markov random field
*   Percolation
*   Pitman–Yor process
*   Point process
    *   Cox
    *   Poisson
*   Random field
*   Random graph

Time series models

*   Autoregressive conditional heteroskedasticity (ARCH) model
*   Autoregressive integrated moving average (ARIMA) model
*   Autoregressive (AR) model
*   Autoregressive–moving-average (ARMA) model
*   Generalized autoregressive conditional heteroskedasticity (GARCH) model
*   Moving-average (MA) model

Financial models

*   Binomial options pricing model
*   Black–Derman–Toy
*   Black–Karasinski
*   Black–Scholes
*   Chan–Karolyi–Longstaff–Sanders (CKLS)
*   Chen
*   Constant elasticity of variance (CEV)
*   Cox–Ingersoll–Ross (CIR)
*   Garman–Kohlhagen
*   Heath–Jarrow–Morton (HJM)
*   Heston
*   Ho–Lee
*   Hull–White
*   Korn-Kreer-Lenssen
*   LIBOR market
*   Rendleman–Bartter
*   SABR volatility
*   Vašíček
*   Wilkie

Actuarial models

*   Bühlmann
*   Cramér–Lundberg
*   Risk process
*   Sparre–Anderson

Queueing models

*   Bulk
*   Fluid
*   Generalized queueing network
*   M/G/1
*   M/M/1
*   M/M/c

Properties

*   Càdlàg paths
*   Continuous
*   Continuous paths
*   Ergodic
*   Exchangeable
*   Feller-continuous
*   Gauss–Markov
*   Markov
*   Mixing
*   Piecewise-deterministic
*   Predictable
*   Progressively measurable
*   Self-similar
*   Stationary
*   Time-reversible

Limit theorems

*   Central limit theorem
*   Donsker's theorem
*   Doob's martingale convergence theorems
*   Ergodic theorem
*   Fisher–Tippett–Gnedenko theorem
*   Large deviation principle
*   Law of large numbers (weak/strong)
*   Law of the iterated logarithm
*   Maximal ergodic theorem
*   Sanov's theorem
*   Zero–one laws (Blumenthal, Borel–Cantelli, Engelbert–Schmidt, Hewitt–Savage, Kolmogorov, Lévy)

Inequalities

*   Burkholder–Davis–Gundy
*   Doob's martingale
*   Doob's upcrossing
*   Kunita–Watanabe
*   Marcinkiewicz–Zygmund

Tools

*   Cameron–Martin formula
*   Convergence of random variables
*   Doléans-Dade exponential
*   Doob decomposition theorem
*   Doob–Meyer decomposition theorem
*   Doob's optional stopping theorem
*   Dynkin's formula
*   Feynman–Kac formula
*   Filtration
*   Girsanov theorem
*   Infinitesimal generator
*   Itô integral
*   Itô's lemma
*   Karhunen–Loève theorem
*   Kolmogorov continuity theorem
*   Kolmogorov extension theorem
*   Lévy–Prokhorov metric
*   Malliavin calculus
*   Martingale representation theorem
*   Optional stopping theorem
*   Prokhorov's theorem
*   Quadratic variation
*   Reflection principle
*   Skorokhod integral
*   Skorokhod's representation theorem
*   Skorokhod space
*   Snell envelope
*   Stochastic differential equation
    *   Tanaka
*   Stopping time
*   Stratonovich integral
*   Uniform integrability
*   Usual hypotheses
*   Wiener space
    *   Classical
    *   Abstract

Disciplines

*   Actuarial mathematics
*   Control theory
*   Econometrics
*   Ergodic theory
*   Extreme value theory (EVT)
*   Large deviations theory
*   Mathematical finance
*   Mathematical statistics
*   Probability theory
*   Queueing theory
*   Renewal theory
*   Ruin theory
*   Signal processing
*   Statistics
*   Stochastic analysis
*   Time series analysis
*   Machine learning

*   List of topics
*   Category

*   Germany
*   Israel
*   United States