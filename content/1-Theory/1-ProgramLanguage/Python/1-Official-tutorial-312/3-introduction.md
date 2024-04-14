# An Informal Introduction to Python

In the following examples, input and output are distinguished by the presence or absence of prompts (`>>>` and `...`): to repeat the example, you must type everything after the prompt, when the prompt appears; lines that do not begin with a prompt are output from the interpreter. Note that a secondary prompt on a line by itself in an example means you must type a blank line; this is used to end a multi-line command.
> 区分解释器中输入行与输出行很简单，有 `>>>` 或 `...` 提示符就是输入行，否则就是输出行。
> 
> 要退出多行语句块，只需要输入一个空行即可。

Many of the examples in this manual, even those entered at the interactive prompt, include comments. Comments in Python start with the hash character, `#`, and extend to the end of the physical line. A comment may appear at the start of a line or following whitespace or code, but not within a string literal. A hash character within a string literal is just a hash character. Since comments are to clarify code and are not interpreted by Python, they may be omitted when typing in examples.
> - 在 Python 中注释以 hash 字符 `#` 开始，并注释掉该字符右边的所有内容（只对单行有效）
> - 注释可以出现在行首、空白处或代码后，但不能出现在字符串内。出现在字符串内的 `#` 字符只是简单的字符罢了（不需要转义字符）
> - 与其它编程语言一样，Python 中的注释也不会被解释器所执行。

Some examples:

```python
# this is the first comment
spam = 1  # and this is the second comment
		  # ... and now a third!
text = "# This is not a comment because it's inside quotes."
```

## Using Python as a Calculator

Let's try some simple Python commands. Start the interpreter and wait for the primary prompt, `>>>`. (It shouldn't take long.)

### Numbers

The interpreter acts as a simple calculator: you can type an expression at it and it will write the value. Expression syntax is straightforward: the operators `+`, `-`, `*` and `/` can be used to perform arithmetic; parentheses `()` can be used for grouping. For example:

```python
>>> 2 + 2
4
>>> 50 - 5*6
20
>>> (50 - 5*6) / 4
5.0
>>> 8 / 5  # division always returns a floating point number
1.6
```

The integer numbers (e.g. `2`, `4`, `20`) have type [`int`](https://docs.python.org/3/library/functions.html#int "int"), the ones with a fractional part (e.g. `5.0`, `1.6`) have type [`float`](https://docs.python.org/3/library/functions.html#float "float"). We will see more about numeric types later in the tutorial.

Division (`/`) always returns a float. To do [floor division](https://docs.python.org/3/glossary.html#term-floor-division) and get an integer result you can use the `//` operator; to calculate the remainder you can use `%`:
> - Python 中 `/` 总是（除非被重载）返回 float 类型的值；
> - 若要实现取下整，则使用 `//` 运算符；
> - 要实现求余数，则使用 `%` 运算符。

```python
>>> 17 / 3  # classic division returns a float
5.666666666666667
>>>
>>> 17 // 3  # floor division discards the fractional part
5
>>> 17 % 3  # the % operator returns the remainder of the division
2
>>> 5 * 3 + 2  # floored quotient * divisor + remainder
17
```

With Python, it is possible to use the `**` operator to calculate powers[^1]:
> `**` 可以用做指数运算。

```
>>> 5 ** 2  # 5 squared
25
>>> 2 ** 7  # 2 to the power of 7
128
```

The equal sign (`=`) is used to assign a value to a variable. Afterwards, no result is displayed before the next interactive prompt:
> `=` 是赋值运算符，并且输入行结束后不会有任何输出结果。

```
>>> width = 20
>>> height = 5 * 9
>>> width * height
900
```

If a variable is not "defined" (assigned a value), trying to use it will give you an error:
> 如果一个变量没有被定义（即未赋值），那么想要使用它时就会报错 `NameError`：

```python
>>> n  # try to access an undefined variable
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'n' is not defined
```

There is full support for floating point; operators with mixed type operands convert the integer operand to floating point:
> python 对浮点数计算有完善地支持。
> 如果计算式中有混合类型的操作数，那么运算符就会将整型数值转换为浮点数值后再计算。

```
>>> 4 * 3.75 - 1
14.0
```

In interactive mode, the last printed expression is assigned to the variable `_`. This means that when you are using Python as a desk calculator, it is somewhat easier to continue calculations, for example:
> 在*交互模式*中，最后输出的表达式会被赋值给变量 `_` 。

```
>>> tax = 12.5 / 100
>>> price = 100.50
>>> price * tax
12.5625
>>> price + _
113.0625
>>> round(_, 2)
113.06
```

This variable should be treated as read-only by the user. Don't explicitly assign a value to it --- you would create an independent local variable with the same name masking the built-in variable with its magic behavior.
> `_` 应当被用户视作只读变量，不要显式地复制给它——否则你会**创建一个独立的同名局部变量**。这个局部变量会覆盖Python 的内置变量 `_` 。

In addition to [`int`](https://docs.python.org/3/library/functions.html#int "int") and [`float`](https://docs.python.org/3/library/functions.html#float "float"), Python supports other types of numbers, such as [`Decimal`](https://docs.python.org/3/library/decimal.html#decimal.Decimal "decimal.Decimal") and [`Fraction`](https://docs.python.org/3/library/fractions.html#fractions.Fraction "fractions.Fraction"). Python also has built-in support for [complex numbers](https://docs.python.org/3/library/stdtypes.html#typesnumeric), and uses the `j` or `J` suffix to indicate the imaginary part (e.g. `3+5j`).
> - 除了 `int` 和 `float`，Python 还支持其它数值类型，例如 `Decimal` 和 `Fraction`
> 	- `Decimal`：用于表示精确的十进制浮点数，用于高精度计算的场景，只需要使用 `from decimal import Decimal` 来引入 `Decimal` 类型即可；并且 `Decimal` 类型由于存储的是十进制数，因此不会存在类似浮点数计算中的舍入误差；
> 	- `Fraction`：用于表示有理数（分数形式）的数值，通过 `from fractions import Fraction` 引入 `Fraction` 类型即可；`Fraction` 会自动将浮点数转换为最简分数表示的形式；`Fraction(3,4)` 表示三分之四；
> - Python 也天然支持复数，并且使用 `j` 或 `J` 作为虚部的后缀

### Text

Python can manipulate text (represented by type `str`, so-called "strings") as well as numbers. This includes characters "`!`", words "`rabbit`", names "`Paris`", sentences "`Got your back.`", etc. "`Yay! :)`". They can be enclosed in single quotes (`'...'`) or double quotes (`"..."`) with the same result[^2].
>Python 可以像数值一样操作文本（其类型是 `str`，意即 strings）。无论符号、单词、名字、句子等等文本都可以作为 `str` 类型，并且无论使用 `''` 还是 `""` 包围都可以，结果一致。

```python
>>> 'spam eggs'  # single quotes
'spam eggs'
>>> "Paris rabbit got your back :)! Yay!"  # double quotes
'Paris rabbit got your back :)! Yay!'
>>> '1975'  # digits and numerals enclosed in quotes are also strings
'1975'
```

To quote a quote, we need to "escape" it, by preceding it with `\`. Alternatively, we can use the other type of quotation marks:
> 在文本中如果有 `'` 或 `"` 等字符，则要使用 `\` 转义，或者使用不同的引用符号。

```
>>> 'doesn\'t'  # use \' to escape the single quote...
"doesn't"
>>> "doesn't"  # ...or use double quotes instead
"doesn't"
>>> '"Yes," they said.'
'"Yes," they said.'
>>> "\"Yes,\" they said."
'"Yes," they said.'
>>> '"Isn\'t," they said.'
'"Isn\'t," they said.'
```

In the Python shell, the string definition and output string can look different. The [`print()`]( https://docs.python.org/3/library/functions.html#print "print") function produces a more readable output, by omitting the enclosing quotes and by printing escaped and special characters:
> 在 Python shell 中，字符串定义和输出可能看起来不同。`print()` 函数会省略引号、并根据转义字符和特殊字符进行打印，使得结果更加易读：

```python
>>> s = 'First line.\nSecond line.'  # \n means newline
>>> s  # without print(), special characters are included in the string
'First line.\nSecond line.'
>>> print(s)  # with print(), special characters are interpreted, so \n produces new line
First line.
Second line.
```

If you don't want characters prefaced by `\` to be interpreted as special characters, you can use *raw strings* by adding an `r` before the first quote:
> 如果不想让转义字符生效，则可以通过在 `print` 中第一个引号前添加 `r` 字符，这将高速 `print` 函数将这个引号内的内容视作 *raw strings* （原始字符串）而完整地打印出来。

```
>>> print('C:\some\name')  # here \n means newline!
C:\some
ame
>>> print(r'C:\some\name')  # note the r before the quote
C:\some\name
```

There is one subtle aspect to raw strings: a raw string may not end in an odd number of `\` characters; see [the FAQ entry](https://docs.python.org/3/faq/programming.html#faq-programming-raw-string-backslash) for more information and workarounds.
> 关于原始字符串有个微小的注意事项：**raw string 不能以奇数个 `\` 字符结尾**，这是因为在原始字符串中，反斜杠 `\` 通常用于转义字符，比如 `\\` 表示一个反斜杠，而 `\'` 表示单引号。如果一个原始字符串以奇数个反斜杠结束，Python 解释器会把它解释为转义字符加在字符串末尾，这可能导致意外的行为或错误。

String literals[^3] can span multiple lines. One way is using triple-quotes: `"""..."""` or `'''...'''`. End of lines are automatically included in the string, but it's possible to prevent this by adding a `\` at the end of the line. The following example:
> 字符串常量可以分解成多个部分，一种办法是使用三个引号 `"""..."""` 或 `'''...'''`。其中换行符 EoL 会自动地包含在字符串中，如果不想包含，则在换行处添加 `\` 转义即可。

```python
print("""\
Usage: thingy [OPTIONS]
	 -h                        Display this usage message
	 -H hostname               Hostname to connect to
""")
```

produces the following output (note that the initial newline is not included):

``` text
Usage: thingy [OPTIONS]
     -h                        Display this usage message
     -H hostname               Hostname to connect to
```

Strings can be concatenated (glued together) with the `+` operator, and repeated with `*`:
> 字符串也可以被拼接起来，只需要使用 `+` 即可。若要重复多次同一个字符串，就使用 `*`。

```python
>>> # 3 times 'un', followed by 'ium'
>>> 3 * 'un' + 'ium'
'unununium'
```

Two or more *string literals* (i.e. the ones enclosed between quotes) next to each other are automatically concatenated. :
> 两个或更多的字符串常量紧邻着摆放，就会被自动拼接。

```python
>>> 'Py' 'thon'
'Python'
```

This feature is particularly useful when you want to break long strings:
> 这样的特点可以用于将长字符串切断成多个短字符串时：

```python
>>> text = ('Put several strings within parentheses '
...         'to have them joined together.')
>>> text
'Put several strings within parentheses to have them joined together.'
```

This only works with two literals though, not with variables or expressions:
> 这个特性只对两个字符串常量起效，而不能是变量或表达式之间。

```python
>>> prefix = 'Py'
>>> prefix 'thon'  # can't concatenate a variable and a string literal
  File "<stdin>", line 1
	prefix 'thon'
		   ^^^^^^
SyntaxError: invalid syntax

>>> ('un' * 3) 'ium'
  File "<stdin>", line 1
	('un' * 3) 'ium'
			   ^^^^^
SyntaxError: invalid syntax
```

If you want to concatenate variables or a variable and a literal, use `+`:
> 如果想要拼接变量和常量，则使用 `+`：

```python
>>> prefix + 'thon'
'Python'
```

Strings can be *indexed* (subscripted), with the first character having index 0. There is no separate character type; a character is simply a string of size one:
> 字符串可以通过数字索引，第一个字符的索引号为 0 。
> 
> 与 C/Cpp 不同，Python 中没有char 类型，单个的字符则被视作长度为 1 的字符串。

```python
>>> word = 'Python'
>>> word[0]  # character in position 0
'P'
>>> word[5]  # character in position 5
'n'
```

Indices[^4] may also be negative numbers, to start counting from the right:
> 索引号也可以是负数，这将会从字符串的右边开始。

```python
>>> word[-1]  # last character
'n'
>>> word[-2]  # second-last character
'o'
>>> word[-6]
'P'
```

Note that since -0 is the same as 0, negative indices start from -1.
> 需要注意 `-0` 索引与 `0` 一致都表示字符串的第一个字符，负数索引从 `-1` 开始。

In addition to indexing, *slicing* is also supported. While indexing is used to obtain individual characters, *slicing* allows you to obtain a substring:
> 字符串还可以切片——获得字符串的子串：

```python
>>> word[0:2]  # characters from position 0 (included) to 2 (excluded)
'Py'
>>> word[2:5]  # characters from position 2 (included) to 5 (excluded)
'tho'
```

Slice indices have useful defaults; an omitted first index defaults to zero, an omitted second index defaults to the size of the string being sliced. :
> 需要注意一些字符串切片的默认事项：
> - 起始索引默认为 `0`，因此也可以省略不写；
> - 结束索引默认是字符串的结尾（该字符串的长度）处；
> - 切片范围是**左闭右开**的区间，即 `[start,end)` 。

```python
>>> word[:2]   # character from the beginning to position 2 (excluded)
'Py'
>>> word[4:]   # characters from position 4 (included) to the end
'on'
>>> word[-2:]  # characters from the second-last (included) to the end
'on'
```

Note how the start is always included, and the end always excluded. This makes sure that `s[:i] + s[i:]` is always equal to `s`:

```python
>>> word[:2] + word[2:]
'Python'
>>> word[:4] + word[4:]
'Python'
```

One way to remember how slices work is to think of the indices as pointing *between* characters, with the left edge of the first character numbered 0. Then the right edge of the last character of a string of *n* characters has index *n*, for example:

```python
+---+---+---+---+---+---+
| P | y | t | h | o | n |
+---+---+---+---+---+---+
0   1   2   3   4   5   6
-6  -5  -4  -3  -2  -1
```

The first row of numbers gives the position of the indices `0...6` in the string; the second row gives the corresponding negative indices. The slice from *i* to *j* consists of all characters between the edges labeled *i* and *j*, respectively.

For non-negative indices, the length of a slice is the difference of the indices, if both are within bounds. For example, the length of `word[1:3]` is 2.
> 对于非负索引，如果两个索引都在界内，片段的长度就是两个索引的差值。

Attempting to use an index that is too large will result in an error:
> 如果尝试引用尚未赋值的区间，则会触发越界错误 `IndexError` 。

```python
>>> word[42]  # the word only has 6 characters
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
IndexError: string index out of range
```

However, out of range slice indexes are handled gracefully when used for slicing:
> 不过，在用于切片时，会对超出范围的切片索引进行优雅处理：

```python
>>> word[4:42]
'on'
>>> word[42:]
''
```

Python strings cannot be changed — they are [immutable](https://docs.python.org/3/glossary.html#term-immutable). Therefore, assigning to an indexed position in the string results in an error:
> Python 的**字符串是不可更改的**，因此通过索引修改字符串的字符将会导致错误 `TypeError` 。

```python
>>> word[0] = 'J'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'str' object does not support item assignment
>>> word[2:] = 'py'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'str' object does not support item assignment
```

If you need a different string, you should create a new one:

```
>>> 'J' + word[1:]
'Jython'
>>> word[:2] + 'py'
'Pypy'
```

The built-in function `len` returns the length of a string:

```
>>> s = 'supercalifragilisticexpialidocious'
>>> len(s)
34
```

>[!note] See also:
>- 文本串的类型：[Text Sequence Type — str](https://docs.python.org/3/library/stdtypes.html#textseq)
>	- Strings are examples of _sequence types_, and support the common operations supported by such types.
>- 字符串的成员犯法：[String Methods](https://docs.python.org/3/library/stdtypes.html#string-methods)
>	- Strings support a large number of methods for basic transformations and searching.
>- 字符串常量的内嵌表达式 [f-strings](https://docs.python.org/3/reference/lexical_analysis.html#f-strings)
>	- String literals that have embedded expressions.
>- 格式化字符串： [Format String Syntax](https://docs.python.org/3/library/string.html#formatstrings)
>	- Information about string formatting with [`str.format()`]( https://docs.python.org/3/library/stdtypes.html#str.format "str.format").
>- 旧版本的格式化风格： [printf-style String Formatting](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)
>	- The old formatting operations invoked when strings are the left operand of the `%` operator are described in more detail here.

### Lists

Python knows a number of *compound* data types, used to group together other values. The most versatile is the *list*, which can be written as a list of comma-separated values (items) between square brackets. Lists might contain items of different types, but usually the items all have the same type. :
> Python 可以使用很多复合数据类型将其它数值组合在一起，其中最通用的复合类型就是 *list* ，可以写成方括号中用逗号分隔值（项）的列表。
> 
> 列表中的项可以是任何类型，不过一般为了可读性，保持一个列表中的所有项的类型一致。

```python
>>> squares = [1, 4, 9, 16, 25]
>>> squares
[1, 4, 9, 16, 25]
```

Like strings (and all other built-in `sequence` types), lists can be indexed and sliced:
> 列表与字符串的索引和分片方法相同。

```python
>>> squares[0]  # indexing returns the item
1
>>> squares[-1]
25
>>> squares[-3:]  # slicing returns a new list
[9, 16, 25]
```

Lists also support operations like concatenation:
> 列表也支持通过 `+` 进行拼接的运算，以及其它运算。

```
>>> squares + [36, 49, 64, 81, 100]
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

Unlike strings, which are `immutable`, lists are a `mutable` type, i.e. it is possible to change their content:
> 不过列表是可修改的，这点与字符串不同。

```python
>>> cubes = [1, 8, 27, 65, 125]  # something's wrong here
>>> 4 ** 3  # the cube of 4 is 64, not 65!
64
>>> cubes[3] = 64  # replace the wrong value
>>> cubes
[1, 8, 27, 64, 125]
```

You can also add new items at the end of the list, by using the `list.append()` _method_ (we will see more about methods later):
> 可以使用 `list.append()` 方法向列表中添加新值。

```python
>>> cubes.append (216)  # add the cube of 6
>>> cubes.append (7 ** 3)  # and the cube of 7
>>> cubes
[1, 8, 27, 64, 125, 216, 343]
```

Simple assignment in Python never copies data. When you assign a list to a variable, the variable refers to the *existing list*. Any changes you make to the list through one variable will be seen through all other variables that refer to it.:
> 简单地使用 `=` 赋值并不会将数据复制到新的变量中，而是**产生一个原变量的引用**。

```python
>>> rgb = ["Red", "Green", "Blue"]
>>> rgba = rgb
>>> id (rgb) == id (rgba)  # they reference the same object
True
>>> rgba.append ("Alph")
>>> rgb
["Red", "Green", "Blue", "Alph"]
```

All slice operations return a new list containing the requested elements. This means that the following slice returns a [shallow copy](https://docs.python.org/3/library/copy.html#shallow-vs-deep-copy) of the list:
> 分片操作将会返回一个新的列表，其中包含分片时请求的元素——即对原列表中的部分元素进行了**浅拷贝**。

```python
>>> correct_rgba = rgba[:]
>>> correct_rgba[-1] = "Alpha"
>>> correct_rgba
["Red", "Green", "Blue", "Alpha"]
>>> rgba
["Red", "Green", "Blue", "Alph"]
```

Assignment to slices is also possible, and this can even change the size of the list or clear it entirely:
> 对分片可以进行赋值，从而改变列表的长度（甚至清空它）。

```python
>>> letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
>>> letters
['a', 'b', 'c', 'd', 'e', 'f', 'g']
>>> # replace some values
>>> letters[2:5] = ['C', 'D', 'E']
>>> letters
['a', 'b', 'C', 'D', 'E', 'f', 'g']
>>> # now remove them
>>> letters[2:5] = []
>>> letters
['a', 'b', 'f', 'g']
>>> # clear the list by replacing all the elements with an empty list
>>> letters[:] = []
>>> letters
[]
```

The built-in function `len` also applies to lists:

```
>>> letters = ['a', 'b', 'c', 'd']
>>> len (letters)
4
```

It is possible to nest lists (create lists containing other lists), for example:
> 列表内允许嵌套，即包含列表元素的列表。

```
>>> a = ['a', 'b', 'c']
>>> n = [1, 2, 3]
>>> x = [a, n]
>>> x
[['a', 'b', 'c'], [1, 2, 3]]
>>> x[0]
['a', 'b', 'c']
>>> x[0][1]
'b'
```

## First Steps Towards Programming

Of course, we can use Python for more complicated tasks than adding two and two together. For instance, we can write an initial sub-sequence of the [Fibonacci series](https://en.wikipedia.org/wiki/Fibonacci_sequence) as follows:

```
>>> # Fibonacci series:
... # the sum of two elements defines the next
... a, b = 0, 1
>>> while a < 10:
...     print (a)
...     a, b = b, a+b
...
0
1
1
2
3
5
8
```

This example introduces several new features.

- The first line contains a *multiple assignment*: the variables `a` and `b` simultaneously get the new values 0 and 1. On the last line this is used again, demonstrating that the expressions on the right-hand side are all evaluated first before any of the assignments take place. The right-hand side expressions are evaluated from the left to the right.
> **多项赋值**：第三行中 `a,b=0,1` 同时为变量 `a` 和 `b` 进行赋值。其中的运算顺序是，先对赋值运算符 `=` 右边的表达式**从左到右地运算**，然后分别赋值给左边的变量。

- The `while` loop executes as long as the condition (here: `a < 10`) remains true. In Python, like in C, any non-zero integer value is true; zero is false. The condition may also be a string or list value, in fact any sequence; anything with a non-zero length is true, empty sequences are false. The test used in the example is a simple comparison. The standard comparison operators are written the same as in C: `<` (less than), `>` (greater than), `==` (equal to), `<=` (less than or equal to), `>=` (greater than or equal to) and `!=` (not equal to).
> - 只要条件（此处：a < 10）为真，while 循环就执行。
> - 在 Python 中，就像在 C 语言中一样，**任何非零的整数值都为真**；零为假。
> - 条件也可以是字符串或列表值，实际上是任何序列；**任何长度不为零的值都为真**，空序列为假。示例中使用的测试是一个简单的比较。
> - 标准比较运算符的写法与 C 语言相同：`<`（小于）、`>`（大于）、`==`（等于）、`<=`（小于或等于）、`>=`（大于或等于）和 `!=`（不等于）。

- The *body* of the loop is *indented*: indentation is Python's way of grouping statements. At the interactive prompt, you have to type a tab or space (s) for each indented line. In practice you will prepare more complicated input for Python with a text editor; all decent text editors have an auto-indent facility. When a compound statement is entered interactively, it must be followed by a blank line to indicate completion (since the parser cannot guess when you have typed the last line). Note that each line within a basic block must be indented by the same amount.
> - 循环的主体是**缩进的**：缩进是 Python 对语句进行分组的方式。在交互式提示符下，每缩进一行就必须键入一个制表符或空格。
> - 实际上，可以使用文本编辑器为 Python 准备更复杂的输入；所有合适的文本编辑器都有自动缩进功能。
> - 当以交互方式输入一个复合语句时，它后面必须有一个空行来表示完成（因为解析器无法猜测何时键入了最后一行）。请注意，基本块内每行的缩进量必须相同。

- The `print` function writes the value of the argument (s) it is given. It differs from just writing the expression you want to write (as we did earlier in the calculator examples) in the way it handles multiple arguments, floating point quantities, and strings. Strings are printed without quotes, and a space is inserted between items, so you can format things nicely, like this:
> `print()` 函数会打印所给参数的值。它与只写表达式的不同之处在于它处理多个参数、浮点数和字符串的方式。
> 字符串在打印时不带引号，并且**在不同参数项之间插入空格**，因此可以很好地格式化，就像下面这样：

```
>>> i = 256*256
>>> print ('The value of i is', i)
  The value of i is 65536
```

The keyword argument *end* can be used to avoid the newline after the output, or end the output with a different string:
> `print` 函数中使用 *end* 关键字参数可以指定输出的格式（默认是换行）

```
>>> a, b = 0, 1
>>> while a < 1000:
  ...     print (a, end=',')
  ...     a, b = b, a+b
  ...
  0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,
```

[^1]: Since `**` has higher precedence than `-`, `-3**2` will be interpreted as `-(3**2)` and thus result in `-9`. To avoid this and get `9`, you can use `(-3)**2`.
[^2]: Unlike other languages, special characters such as `\n` have the same meaning with both single (`'...'`) and double (`"..."`) quotes. The only difference between the two is that within single quotes you don't need to escape `"` (but you have to escape `\'`) and vice versa.
[^3]: 指“常量”的含义
[^4]: index 的复数形式