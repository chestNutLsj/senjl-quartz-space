## How to deal with overfitting using regularization

![](https://miro.medium.com/v2/resize:fit:770/1*7S6lwTgY129EFhBIKQVYUg.png)

In my last [post](https://towardsdatascience.com/logistic-regression-from-scratch-in-r-b5b122fd8e83), I only used two features (**_x_1, _x_2**) and the decision boundary is a straight line on a 2D coordinate. In most of the real world cases, the data set will have many more features and the decision boundary is more complicated. With so many features, we often overfit the data. Overfitting is a modeling error in a function that is closely fit to a data set. It captures the noise in the data set, and may not fit new incoming data.

To overcome this issue, we mainly have two choices: 1) remove less useful features, 2) use regularization. We will focus on regularization here.

The data we will be classifying is created below:

The data is generated such that it cannot be classified by a linear equation, so we have to add higher order terms as features. However, more features will allow the model pick up noise in the data.

![](https://miro.medium.com/v2/resize:fit:770/1*O3lyMCmTzlorO6G_h4VP3Q.png)

Previously, to predict the logit (log of odds), we use the following relationship:

As we add more features, the **_RHS_** of the equation becomes more complex. Regularization is used to reduce the complexity of the prediction function by imposing a penalty. In the case of the linear relationship, regularization adds the following term to the cost fuction:

where **_D_** is the dimension of features. It penalizes the coefficients of the features (not including the bias term). Now the cost function becomes:

With our prior knowledge of [logistic regression](https://towardsdatascience.com/logistic-regression-from-scratch-in-r-b5b122fd8e83), we can start construction of the model with regularization now.

Again, we need to create some helper functions first. Note `%*%` is the dot product in **R**. If you want to know more details of the model, you can read my previous article [here](https://towardsdatascience.com/logistic-regression-from-scratch-in-r-b5b122fd8e83).

The Logistic regression function, which originally takes training data **_X_**, and label **_y_** as input, now needs to add one more input: the strength of regularization **_λ_**_._

Since we want to use an example of many features to demonstrate the concept of overfitting and regularization, we need to expand the feature matrix by including the polynomial terms.

Now, we can define the prediction functions same as previously.

Next, let’s train the model on the data set above. I used a polynomial feature matrix up to the 6th power. Lowering the power with also help with overfitting. Effectively, we are removing unnecessary features.

First, no regularization is used (**_λ_**=0) and the result is as below. The model clearly overfits the data and falsely classified the region at 11 o’clock. Another model is trained with regularization (**_λ_**=5) and it’s more representative to the general trend.

![](https://miro.medium.com/v2/resize:fit:770/1*7S6lwTgY129EFhBIKQVYUg.png)

Left: no regularization; right: model with regularization.

Regularization is very useful in overcoming overfitting. It allows us to retain even slightly useful features and automatically reduces the coefficient of those features.

You may visit my github for [original code in R](https://github.com/JunWorks/Understanding-Regularization-in-Machine-Learning). There is also a [Python version](https://github.com/JunWorks/ML-Algorithm-with-Python/blob/master/logistic_regression/logistic_regression.ipynb) for same topic.