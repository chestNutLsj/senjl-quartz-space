# Introduction to Neural Networks: Perceptron

## [Pre-lecture quiz](https://red-field-0a6ddfd03.1.azurestaticapps.net/quiz/103)

One of the first attempts to implement something similar to a modern neural network was done by Frank Rosenblatt from Cornell Aeronautical Laboratory in 1957. It was a hardware implementation called "Mark-1", designed to recognize primitive geometric figures, such as triangles, squares and circles.

|      |      |
|--------------|-----------|
|<img src='images/Rosenblatt-wikipedia.jpg' alt='Frank Rosenblatt'/> | <img src='images/Mark_I_perceptron_wikipedia.jpg' alt='The Mark 1 Perceptron' />|

> Images [from Wikipedia](https://en.wikipedia.org/wiki/Perceptron)

An input image was represented by 20x20 photocell array, so the neural network had 400 inputs and one binary output. A simple network contained one neuron, also called a **threshold logic unit**. Neural network weights acted like potentiometers that required manual adjustment during the training phase.

> ✅ A potentiometer is a device that allows the user to adjust the resistance of a circuit.

> The New York Times wrote about perceptron at that time: *the embryo of an electronic computer that [the Navy] expects will be able to walk, talk, see, write, reproduce itself and be conscious of its existence.*

## Perceptron Model

Suppose we have N features in our model, in which case the input vector would be a vector of size N. A perceptron is a **binary classification** model, i.e. it can distinguish between two classes of input data. We will assume that for each input vector x the output of our perceptron would be either +1 or -1, depending on the class. The output will be computed using the formula:

y(x) = f(w<sup>T</sup>x)

where f is a step activation function

<!-- img src="http://www.sciweavers.org/tex2img.php?eq=f%28x%29%20%3D%20%5Cbegin%7Bcases%7D%0A%20%20%20%20%20%20%20%20%20%2B1%20%26%20x%20%5Cgeq%200%20%5C%5C%0A%20%20%20%20%20%20%20%20%20-1%20%26%20x%20%3C%200%0A%20%20%20%20%20%20%20%5Cend%7Bcases%7D%20%5C%5C%0A&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=0" align="center" border="0" alt="f(x) = \begin{cases} +1 & x \geq 0 \\ -1 & x < 0 \end{cases} \\" width="154" height="50" / -->
<img src="images/activation-func.png"/>

## Training the Perceptron

To train a perceptron we need to find a weights vector w that classifies most of the values correctly, i.e. results in the smallest **error**. This error is defined by **perceptron criterion** in the following manner:

E(w) = -&sum;w<sup>T</sup>x<sub>i</sub>t<sub>i</sub>

where:

* the sum is taken on those training data points i that result in the wrong classification
* x<sub>i</sub> is the input data, and t<sub>i</sub> is either -1 or +1 for negative and positive examples accordingly.

This criteria is considered as a function of weights w, and we need to minimize it. Often, a method called **gradient descent** is used, in which we start with some initial weights w<sup>(0)</sup>, and then at each step update the weights according to the formula:

w<sup>(t+1)</sup> = w<sup>(t)</sup> - &eta;&nabla;E(w)

Here &eta; is the so-called **learning rate**, and &nabla;E(w) denotes the **gradient** of E. After we calculate the gradient, we end up with

w<sup>(t+1)</sup> = w<sup>(t)</sup> + &sum;&eta;x<sub>i</sub>t<sub>i</sub>

The algorithm in Python looks like this:

```python
def train(positive_examples, negative_examples, num_iterations = 100, eta = 1):

    weights = [0,0,0] # Initialize weights (almost randomly :)
        
    for i in range(num_iterations):
        pos = random.choice(positive_examples)
        neg = random.choice(negative_examples)

        z = np.dot(pos, weights) # compute perceptron output
        if z < 0: # positive example classified as negative
            weights = weights + eta*weights.shape

        z  = np.dot(neg, weights)
        if z >= 0: # negative example classified as positive
            weights = weights - eta*weights.shape

    return weights
```

## Conclusion

In this lesson, you learned about a perceptron, which is a binary classification model, and how to train it by using a weights vector.

## 🚀 Challenge

If you'd like to try to build your own perceptron, try [this lab on Microsoft Learn](https://docs.microsoft.com/en-us/azure/machine-learning/component-reference/two-class-averaged-perceptron?WT.mc_id=academic-77998-cacaste) which uses the [Azure ML designer](https://docs.microsoft.com/en-us/azure/machine-learning/concept-designer?WT.mc_id=academic-77998-cacaste).

## [Post-lecture quiz](https://red-field-0a6ddfd03.1.azurestaticapps.net/quiz/203)

## Review & Self Study

To see how we can use perceptron to solve a toy problem as well as real-life problems, and to continue learning - go to [Perceptron](Perceptron.ipynb) notebook.

Here's an interesting [article about perceptrons](https://towardsdatascience.com/what-is-a-perceptron-basics-of-neural-networks-c4cfea20c590
) as well.

## [Assignment](lab/README.md)

In this lesson, we have implemented a perceptron for binary classification task, and we have used it to classify between two handwritten digits. In this lab, you are asked to solve the problem of digit classification entirely, i.e. determine which digit is most likely to correspond to a given image.

* [Instructions](lab/README.md)
* [Notebook](lab/PerceptronMultiClass.ipynb)
