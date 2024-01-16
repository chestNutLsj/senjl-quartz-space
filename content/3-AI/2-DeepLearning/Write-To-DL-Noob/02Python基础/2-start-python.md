```python
# Import Declaration
from varname import nameof

```

## 1. Variable and Type


```python
# Python is a dynamically typed language,
# which variables are declared when they are substituted for values,
# without having to declare the type.

# Data types that can be brought directly into a variable are called embedded types, as follows.
# Other data types can be implemented using third-party libraries like Numpy.
a_int = 123
b_float = 123.456
c_string = "Hello, world!"
d_boolean = True
e_list = [1,2,3]

print("The type of {} is: {}".format(nameof(a_int).ljust(10),type(a_int)))
print("The type of {} is: {}".format(nameof(b_float).ljust(10),type(b_float)))
print("The type of {} is: {}".format(nameof(c_string).ljust(10),type(c_string)))
print("The type of {} is: {}".format(nameof(d_boolean).ljust(10),type(d_boolean)))
print("The type of {} is: {}".format(nameof(e_list).ljust(10),type(e_list)))

```

    The type of a_int      is: <class 'int'>
    The type of b_float    is: <class 'float'>
    The type of c_string   is: <class 'str'>
    The type of d_boolean  is: <class 'bool'>
    The type of e_list     is: <class 'list'>


### Note:
1. 可以使用字符串的ljust()方法使其左对齐，传入参数为对字符串格式化后的长度，不足长处用空格space补齐；
2. 推荐在print中使用.format方法对输出进行格式化，而不是%(python2 时代的眼泪)


```python
# Boolean type can correspond directly to the value 1 or 0, and they can be operated directly.
# Use ; can declare multiple variables
a_true=True;b_false=False
print(a_true+b_false)
print(bool(a_true+b_false))
print(bool(a_true or b_false))
print(bool(a_true*b_false))
print(bool(a_true and b_false))

# Scientific notation for exponents
c_sci = 1.2e4
d_sci = 1.2e-4
print(c_sci)
print(d_sci)
```

    1
    True
    True
    False
    False
    12000.0
    0.00012


## 2. Operator


```python
a=3;b=4
c=[3,4,b]

# Arithmetic operations
print("The {} result of {} is: {}".format("addition".ljust(30),"a+b".ljust(4),a+b))
print("The {} result of {} is: {}".format("subtraction".ljust(30),"a-b".ljust(4),a-b))
print("The {} result of {} is: {}".format("multiplication".ljust(30),"a*b".ljust(4),a*b))
print("The {} result of {} is: {}".format("division(with decimal)".ljust(30),"a/b".ljust(4),a/b))
print("The {} result of {} is: {}".format("floor division(with integer)".ljust(30),"a//b".ljust(4),a//b))
print("The {} result of {} is: {}".format("modulus".ljust(30),"a%b".ljust(4),a%b))
print("The {} result of {} is: {}".format("exponentiation".ljust(30),"a**b".ljust(4),a**b))

# Comparison operations
print("\nThe result of {} is: {}".format("a<b",a<b)) # other operators are >, <=, >=, ==, !=

# Logical operations
print("\nThe result of {} is: {}".format("whether a belong to c",a in c))
print("The result of {} is: {}".format("a and b",a and b))
print("The result of {} is: {}".format("a or b",a or b))
print("The result of {} is: {}".format("3<4 and 4<3", 3 < 4 and 4 < 3))
print("The result of {} is: {}".format("3<4 or 4<3",3 < 4 or 4 < 3))
print("The result of {} is: {}".format("not a",not a))
```

    The addition                       result of a+b  is: 7
    The subtraction                    result of a-b  is: -1
    The multiplication                 result of a*b  is: 12
    The division(with decimal)         result of a/b  is: 0.75
    The floor division(with integer)   result of a//b is: 0
    The modulus                        result of a%b  is: 3
    The exponentiation                 result of a**b is: 81
    
    The result of a<b is: True
    
    The result of whether a belong to c is: True
    The result of a and b is: 4
    The result of a or b is: 3
    The result of 3<4 and 4<3 is: False
    The result of 3<4 or 4<3 is: True
    The result of not a is: False


Note:
1. 更详细的python运算符文档：[Python Operators](https://www.w3schools.com/python/python_operators.asp);
2. 逻辑运算中直接对两个数进行and、or操作，得到的结果有些奇怪，这是因为发生了短路现象，具体解释是这样：
- 对于表达式 a and b，如果 a 为假（即 0，None，空字符串，空列表等），那么结果就是 a，因为无论 b 的值是什么，and 表达式都将为假。如果 a 为真，那么结果就是 b，因为 b 的值决定了 and 表达式的真假。所以例子中，a and b 的结果是 4，因为 a 是 3，它是真值，所以结果是 b，即 4。
- 对于表达式 a or b，如果 a 为真，那么结果就是 a，因为无论 b 的值是什么，or 表达式都将为真。如果 a 为假，那么结果就是 b，因为 b 的值决定了 or 表达式的真假。所以例子中，a or b 的结果是 3，因为 a 是 3，它是真值，所以结果是 a，即 3。


```python
# Addition operator can also be used in the merge of strings and lists.
a = "Hello"+"World"
b = [1,2,3]+[4,5,6]

print(a)
print(b)
```

    HelloWorld
    [1, 2, 3, 4, 5, 6]


## 3. List

- 列表类型是在处理多个数值时使用的类型，列表全体元素使用`[]`包围，元素之间用`,`分隔。
- 列表中可以包含任意类型的数据，甚至列表对象，并且不要求列表中所有元素类型一致。
- 列表元素的访问和操作都通过索引定位。
- More Documents: [Python List](https://www.w3schools.com/python/python_lists.asp)


```python
a = [1,2,3,4,5]

print("The value of the element in the list whose index value is: {}".format(a[2]))

a.append(6) # other operation: del
print("Append an element at the trail of list a: {}".format(a))

a[3] = 7
print("Replace the index 3 element with 7: {}".format(a))
```

    The value of the element in the list whose index value is: 3
    Append an element at the trail of list a: [1, 2, 3, 4, 5, 6]
    Replace the index 3 element with 7: [1, 2, 3, 7, 5, 6]


## 4. Tuple

- 元组类型也是在处理多个数值时使用的类型，元组全体元素使用`()`包围，元素之间用`,`分隔。
- 与列表的区别是，元组一经初始化，就不可以再对元素增删改。
- 即使只有一个元素，也要在元素末尾添加`,`
- 元组和列表都可以用以对多个变量同时赋值（数量不匹配就会报错）


```python
a = (1,2,3,4,5)
b = (3,)

print("The value of the element in the tuple whose index value is: {}".format(a[2]))
print("The content of {} tuple is: {}".format(nameof(b),b))

## Addition
print("The addition operation between tuples is: {}".format(a+(6,7,9)))
## Assignments
a1,a2,a3,a4,a5 = a
print("Tuple items can be assigned to variables:a1={},a2={},a3={},a4={},a5={}".format(a1,a2,a3,a4,a5))
```

    The value of the element in the tuple whose index value is: 3
    The content of b tuple is: (3,)
    The addition operation between tuples is: (1, 2, 3, 4, 5, 6, 7, 9)
    Tuple items can be assigned to variables:a1=1,a2=2,a3=3,a4=4,a5=5


## 5. Dictionary

- 字典是将键名与数值组合存储的数据类型
- Python支持数值、字符串、元组等对象作为键名


```python
a = {"Apple":3,"Banana":4}

print("The value corresponding to the key name `Apple` is: {}".format(a["Apple"]))

a["Banana"] = 6
print("Replace the value of key name `Banana` is: {}".format(a["Banana"]))

a["Cherry"] = 8
print("Add a item: {}".format(a))
```

    The value corresponding to the key name `Apple` is: 3
    Replace the value of key name `Banana` is: 6
    Add a item: {'Apple': 3, 'Banana': 6, 'Cherry': 8}


## 6. Judgement Branch - if

- if ... elif ... else ... 依次判断是否满足，满足就执行对应语句，否则跳过进行下一条判断
- Python中以四个半角空格表示缩进，相同缩进表示代码块的同一局部域


```python
current_time = 15

if current_time < 7:
    print("Good Morning!")
elif current_time > 14:
    print("Good Afternoon!")
elif current_time > 20:
    print("Good Evening!")
else:
    print("Good Night!")
```

    Good Afternoon!


## 7. Circular Branch - for

- for 语句可以指定对语句循环执行，使用range或列表指定循环范围


```python
for a in [7,8,9]:
    print(a)

for a in range(3):
    print(a)
```

    7
    8
    9
    0
    1
    2


## 8. Circular Branch - while

- while 可以实现在满足特定条件的区间内对代码进行循环执行


```python
a = 0
while a<3:
    print(a)
    a += 1
```

    0
    1
    2


## 9. Closure

- Python闭包语法的一般概念：在一个内部函数中，对外部作用域的变量进行引用，并且一般外部函数的返回值为内部函数，那么内部函数就被认为是闭包
- 闭包可以用来实现通过对列表元素的操作，以创建一个新的列表，一般语法是： `new_list = [item_operation for item in list]`


```python
a_clo = [1,2,3,4,5]
b_op = [c**2 for c in a_clo ]
c_if = [c**2 for c in a_clo if c>3]

print(b_op)
print(c_if)
```

    [1, 4, 9, 16, 25]
    [16, 25]


## 10. Function

- Python 函数的返回值可以是函数对象本身
- 函数参数可以指定缺省值
- 使用*可以将元组一次性赋值到函数参数中


```python
def startAt(x):
    def incrementBy(y=1,z=2):
        return x+y+z
    return incrementBy

a = startAt(1)
b = (2,3)
print('function: ',a)
print('result: ',a(*b))
```

    function:  <function startAt.<locals>.incrementBy at 0x7fd73da13280>
    result:  6


Note:
- 这里a是函数incrementBy，而不是一个数值，这也是闭包的概念；

## 11. Variable Scope

- 函数内部定义的变量为局部变量，外部定义的变量为全局变量
- 局部变量只能在函数内部访问；全局变量可以在任何地方使用
- 如果在函数内部对全局变量进行赋值操作，则会将全局变量当作局部变量处理，但原全局变量的值不变；如果要对其进行更改，则要使用global或nonlocal关键字修饰


```python
a_global = 123
def showNum():
    a_global = 1234
    b_local = 456
    print("Local a is:{},\nb is:{}".format(a_global,b_local))
    # global a_global
    # a_global = 12345
    # print("Modify global a is:{}".format(a_global))

showNum()
print("Global a is: {}".format(a_global))
try:
    print("Local b can't be output: {}".format(b_local))
except:
    print("Local b can't be output")
```

    Local a is:1234,
    b is:456
    Global a is: 123
    Local b can't be output


## 12. Class

- Python是一种面向对象的语言，可以定义类及其实例
- 类的内部可以实现一些方法，用以实例使用或子类继承
- 类成员方法可以使用self接收参数，使用self关键字可以对实例的变量进行访问（实例变量指在通过对类的实例化生成的对象中可访问的变量）
- `__init__`是每个类都要有的特殊方法，称为构造函数，可以对类的实例进行初始化操作
- `add`和`multiply`是具体的方法，用来实现类的功能
- 类可以被继承，由此分为父类和子类，子类可以使用或实现父类中的方法，也可以定义自己的方法


```python
class Calc:
    def __init__(self,a):
        self.a = a

    def add(self, b):
        return self.a+b

    def multiply(self,b):
        return self.a*b

calc = Calc(5)
print(calc.add(3))
print(calc.multiply(3))

class CalcPlus(Calc):
    def subtract(self,b):
        return self.a-b
    def divide(self,b):
        return self.a/b
calc_p = CalcPlus(1)
print(calc_p.add(2))
print(calc_p.subtract(2))
print(calc_p.multiply(2))
print(calc_p.divide(2))
```

    8
    15
    3
    -1
    2
    0.5



```python

```
