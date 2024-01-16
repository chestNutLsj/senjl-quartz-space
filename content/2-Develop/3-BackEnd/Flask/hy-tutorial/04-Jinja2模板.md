实际的网站开发中，需要渲染大量的 HTML 富文本，如果将这些 HTML 代码用字符串的形式写在视图函数中，后期维护将极其困难。

在 Flask 中渲染 HTML 交给模版引擎 Jinja 2 实现。

## 1. 模板

### 渲染模板

在项目根目录的 `templates/` 目录下就是存放模板文件的地方，为了与前端开发者协作，多数模板使用 HTML 格式。

在 `templates/index.html` 中输入以下代码：
```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<title>HOME</title>  
</head>  
<body>  
<h1>This is first page.</h1>  
</body>  
</html>
```

在 `app.py` 的视图函数中使用 `render_template` 函数渲染 `index.html` 模板：
```python
from flask import Flask,render_template
...
@app.route('/')  
def index():  
return render_template('index.html')
```

访问：
![[Pasted image 20230420192048.png]]

> [! tip] 修改模板文件的查找地址
> 在创建 app 时，给 Flask 类传递一个关键字参数 `template_floder` 指定具体的路径：
> ```python
> app=Flask (__name__, template_folder=r"./mytemplates")
> ```

### 渲染变量
HTML 文件中有些数据需要动态地从数据库中加载，一般做法是在视图函数中先把数据提取出来，然后使用 `render_template` 渲染模板时传递给模板，模板读取后再渲染出来。

新建一个 URL 与视图函数的映射：
```python
@app.route('/hobby')  
def hobby():  
myhobby = "computer game"  
return render_template('use-variable.html', hobby=myhobby)
```

在 `mytemplates/use-variable.html` 中写入：
```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<title>Use Variable</title>  
</head>  
<body>  
<h1>My hobby is: {{ hobby }}</h1>  
</body>  
</html>
```

访问：
![[Pasted image 20230420193443.png]]

### 通过字典和对象添加变量
字典的键和对象的属性在模板中都可以通过 `.` 的形式访问，如添加字典类型 person 和对象类型 user：
```python
@app.route('/hobby')  
def hobby():  
myhobby = "computer game"  
person = {  
"name": "Leo",  
"age": 18  
}  
user = User("Senj", "senj@gmail.com")  
return render_template('use-variable.html', hobby=myhobby, person=person, user=user)  
  
  
class User:  
def __init__(self, username, email):  
self.username = username  
self.email = email
```

在 `mytemplates/use-variable.html` 中通过 `.` 或 `["attribute"]` 形式访问字典的键或对象的属性：
```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<title>Use Variable</title>  
</head>  
<body>  
<h1>My hobby is: {{ hobby }}</h1>  
<p>person's name is: {{ person.name }}, person's age is {{ person["age"] }}</p>  
<p>user's name is: {{ user["username"] }}, user's email is {{ user.email }}</p>  
</body>  
</html>
```

访问：
![[Pasted image 20230420200300.png]]

> [! tip] 使用 `.` 访问和 `["key"]` 访问的区别
> 1. 如果在模板中有一个变量的使用方式为 `foo.bar`，那么在 Jinja 2 中按以下方式访问：
> 	- 通过 `getattr(foo,'bar')` 访问，先访问这个对象的属性；
> 	- 如果没有找到，就通过 `foo.__getitem__("bar")` 方式访问，即访问这个对象的键；
> 	- 如果都没有找到，就返回一个 `undefined` 对象；
> 2. 如果在模板中有一个变量的使用方式为 `foo["bar"]`，那么在 Jinja 2 中按以下方式访问：
> 	- 通过 `foo.__getitem__("bar")` 方式访问，先访问这个对象的键；
> 	- 如果没有找到，通过 `getattr(foo,"bar")` 访问，即访问其属性；
> 	- 如果都没有找到，就返回一个 `undefined` 对象

对于变量较多的情况，可以把所有变量存放到字典中，然后给 `render_template` 传递参数时使用 `**` 语法，将字典变成关键字参数：
```python
@app.route('/hobby')  
def hobby():  
myhobby = "computer game"  
person = {  
"name": "Leo",  
"age": 18  
}  
user = User("Senj", "senj@gmail.com")  
context = {  
"hobby": myhobby,  
"person": person,  
"user": user  
}  
return render_template('use-variable.html', **context)
```

## 2. 过滤器和测试器

在模板中对某个变量进行处理是通过过滤器实现的。过滤器本质上也是函数，在模板中使用管道符 `|` 来调用。

例如，有一个字符串类型的变量 name，要获取其长度，可以通过 `{{name|length}}`，Jinja 2 将 name 作为第一个参数传递给 length 过滤器对应的函数。

### 自定义过滤器

过滤器本质是 Python 函数，会将被过滤的值作为第一个参数传递给该函数。过滤器函数可以通过 `@app.template_filter` 装饰器 或 `app.add_template_filter` 函数注册成 Jinja 2 能用的过滤器。

#### 函数式注册
例如一个时间格式化的过滤器：
```python
def datetime_format(value, format="%Y-%d-%m %H:%M"):  
return value.strftime(format)  
  
app.add_template_filter(datetime_format, 'dformat')
```
在 `app.add_template_filter` 中将 `datetime_format` 注册成为过滤器，其名字称为 `dformat`，若没有定义过滤器名称，默认使用函数名称作为过滤器名称。

下文即可如此使用该过滤器：
```html
{{article.pub_date|dformat}}
{{article.pub_date|dformat("%B %Y")

# if didn't define name
{{article.pub_date|datetime_format}}
```

#### 装饰器注册
```python
@app.template_filter("dformat")
def datetime_format(value, format="%Y-%d-%m %H:%M"):  
return value.strftime(format) 
```

装饰器的参数就是过滤器的名称，若未命名则以函数名代替。

### 内置过滤器
#### abs(value)
获取 value 的绝对值。

#### default(value,default_value, boolean=False)
如果 value 没有定义，则返回第二个参数。如果要让 value 在被判断为 False 的情况下返回 default_value，则应将 boolean 设置为 True。

```html
<div> default_filter: {{user|default('admin')}} </div>
```
如果 user 没有定义，将会使用 admin 作为默认值。

```html
<div> default_filter: {{""|default('admin',boolean=True)}} </div>
```
空字符串在 if 判断时返回 False，如果要使用默认值 admin，则 boolean 应为 True。

#### escape(value)
对特殊字符进行转义，如 `&`，`<`，`>` 等。Jinja 2 默认开启全局转义，此过滤器不常用，除非关闭了全局转义。

#### filesizeformat(value,binary=False)
将值格式化成方便阅读的单位，如 13 KB，4.1 MB 等

#### first(value)
返回 value 序列的第一个元素

### 测试器
用来测试某些元素是否符合某个条件。测试器通过 `if ... is ...` 来使用，if 后是对象，is 后是测试器。
```
{% if user is defined %}
user 定义了：｛｛user｝｝
｛% else %｝
user 没有定义
｛% endif %}
```

其它测试器：
| Tester      | Description                  |
| ----------- | ---------------------------- |
| boolean     | is boolean?                  |
| callable    | can be called?               |
| defined     | 是否定义                     |
| divisibleby | 是否能被整除                 |
| eq          | 是否相等                     |
| escaped     | 是否被转义                   |
| even        | 是否偶数                     |
| false       | 是否 False                   |
| filter      | 是否过滤器                   |
| float       | 是否浮点型                   |
| ge          | 大于等于？                   |
| gt          | 大于？                       |
| in          | 是否在某序列中？             |
| integer     | 是否整型                     |
| iterable    | 是否可迭代                   |
| le          | 小于等于？                   |
| lower       | 是否全为小写字母             |
| lt          | 小于？                       |
| mapping     | 是否 mapping 对象            |
| ne          | 不等于？                     |
| none        | 是否为 none                  |
| number      | 是否为数值                   |
| odd         | 是否奇数                     |
| sameas      | 是否在内存中与另一个元素一样 |
| sequence    | 是否为序列（列表，元组）     |
| string      | 是否字符串                   |
| true        | 是否 true                    |
| undefined   | 是否未定义                   |
| upper       | 是否全大写                   |

[Template Designer Documentation — Jinja Documentation (3.0.x)](https://jinja.palletsprojects.com/en/3.0.x/templates/#list-of-builtin-tests)

## 3. 控制语句
所有控制语句都放在 `{% %}` 中，并且有相应结束语句。

### if
类似于 Python，可以用符号（<，>，!=等）和逻辑操作（and，or，not）等判断。

```python
@app.route('/if')  
def if_statement():  
myage = 18  
return render_template('if.html', age=myage)
```

在 `mytemplates/if.html` 中写入：
```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<title>Jinja2 If Judge</title>  
</head>  
<body>  
{% if age > 18 %}  
<div>You are an adult!</div>  
{% elif age < 18 %}  
<div>You are a youngster!</div>  
{% else %}  
<div>You are just an adult!</div>  
{% endif %}  
</body>  
</html>
```

访问：
![[Pasted image 20230423125105.png]]

### for
同样类似于 Python，只是多一个 endfor。
Jinja 2 循环不存在 break 和 continue 语句，也没有 while 循环。

```python
@app.route('/for')  
def for_statement():  
plbooks = [{  
"name": "Python",  
"author": "Tim Peters",  
"price": 100  
},  
{  
"name": "C++",  
"author": "Bjame Stroustrup",  
"price": 120  
},  
{  
"name": "Java",  
"author": "James Gosling",  
"price": 140  
}, ]  
return render_template('for.html', books=plbooks)
```
plbooks 是存放书籍信息的字典，然后渲染给 `for.html`：

```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<title>Jinja For Loop</title>  
</head>  
<body>  
<table>  
<thead>  
<tr>  
<th>Name</th>  
<th>Author</th>  
<th>Price</th>  
</tr>  
</thead>  
<tbody>  
{% for book in books %}  
<tr>  
<td>{{ book.name }}</td>  
<td>{{ book.author }}</td>  
<td>{{ book.price }}</td>  
</tr>  
{% endfor %}  
</tbody>  
</table>  
</body>  
</html>
```

访问：
![[Pasted image 20230423133907.png]]

如果 books 没有传入数据，可以在 `for.html` 中添加如下：
```html
{% else %}  
<tr colspan="3" style="text-align: center">No Info</tr>
```

![[Pasted image 20230423134634.png]]

#### loop 变量
| Variable        | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| `loop.index`    | 获取当前循环到第几次的序号，从 1 开始                                     |
| `loop.index0`   | 获取迭代序号，从 0 开始                                                   |
| `loop.revindex` | 获取迭代的逆向序号，从 1 开始，最后一次迭代为 1，倒数第二次为 2，以此类推 |
| `loop.reindex0` | 从 0 开始                                                                 |
| `loop.first`    | 判断是否为第一次迭代                                                      |
| `loop.last`     | 判断是否为最后一次迭代                                                    |
| `loop.length`   | 序列的长度                                                                |
| `loop.cycle`    | 和外层的循环一起循环的某个序列                                            |
| `loop.depth`    | 多层循环中，提示当前是在第几层循环，从 1 开始                             |
| `loop.depth0`   | 从 0 开始                                                                 |
| `loop.previtem` | 当前迭代的上一个元素，若是第一层迭代则返回 undefined                      |
| `loop.nextitem` | 当前迭代的下一个元素，若是最后一层迭代则返回 undefined                    |
| `loop.changed`  | 判断当前元素的某个值是否与上一次迭代一致，不一样返回 Ture                 |

上述只有 `loop.cycle` 和 `loop.changed` 是函数，其余都是变量。

1. `loop.cycle`：假设现需要对 table 标签中行号为奇数的 tr 标签添加 odd 类，行号为偶数的 tr 标签添加 even 类，可以如下实现：
```html
{% for book in books %}  
<tr class="{{ loop.cycle('odd','even') }}">  
<td>{{ loop.index }}</td>  
<td>{{ book.name }}</td>  
<td>{{ book.author }}</td>  
<td>{{ book.price }}</td>  
</tr>
｛% endfor %｝
```
在循环 books 的过程中，`loop.cycle` 也会不断地在 odd 和 even 两个变量中循环。

2. `loop.changed`：假设想知道当前循环的 book.name 是否与之前一致，可以：
```html
{% for book in books %}  
<tr class="{{ loop.cycle('odd','even') }}">  
<td>{{ loop.index }}</td>  
<td>{{ book.name }}</td>  
<td>{{ book.author }}</td>  
<td>{{ book.price }}</td>  
<td>{{ loop.changed(book.name) }}</td>  
</tr>
｛% endfor %｝
```

访问：
![[Pasted image 20230423142118.png]]

## 4. 模板结构

HTML 除了通过 iframe 标签在浏览器端动态加载其他网页，几乎不具备代码模块化功能。
Jinja 2 则可以通过宏、模板继承、引入模板等方法实现代码模块化。

### 宏和 import
模板中宏与 Python 函数类似，可以传递参数但没有返回值，将常用代码片段放到宏中，然后把不固定的值抽取出来当成一个参数。

```html
{% macro input(name,value="",type='text') %}  
<input type="{{ type }}" value="{{ value|escape }}" name="{{ name }}">  
{% endmacro %}
```
上述即创建了叫做 input 的宏，其接收 name 和 type 两个参数，之后创建 input 标签时即可快速创建：
```html
<div>{{ input('username') }}</div>
<div>{{ input('password', type='password')}}</div>
```

从宏文件中导入宏可以使用 import 语句，与 Python 类似。
先创建一个宏文件：
```html
{% macro input(name,value='',type='text') %}  
<label>  
<input type="{{ type }}" value="{{ value|escape }}" name="{{ name }}">  
</label>  
{% endmacro %}  
  
{% macro textarea(name,value='',rows=10,cols=40) %}  
<textarea name="{{ name }}" rows="{{ rows }}" cols="{{ cols }}">{{ value|escape }}</textarea>  
{% endmacro %}
```
在另一文件 `import.html ` 中导入之：
```html
{% import './macro.html' as macro %}  
<dl>  
<dt>Username</dt>  
<dd>{{ macro.input('username') }}</dd>  
<dt>Password</dt>  
<dd>{{ macro.input('password',type='password') }}</dd>  
</dl>  
<p>{{ macro.textarea('comment') }}</p>
```

通过 import 导入模板并不会把当前模板的变量添加到被导入的模板中，如果要在被导入的模板中使用当前模板的变量（在 `macro.html` 中使用 `import.html` 的变量），可以通过如下两种方式：
1. 显式地通过参数形式传递变量
2. 使用 with context 方式：`｛% from 'macro.html' import input with context %}` 

### 模板继承
一个网站中大部分网页的模块是重复的，如顶部导航栏和底部备案信息等。通过模板继承，将重复性代码写在父模板中，子模板继承父模板后再分别实现特定的代码。

在 `parent.html ` 中写入：
```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<link rel="stylesheet" href="parent.css">  
<title>{% block title %}{% endblock %}</title>  
{% block head %}{% endblock %}  
</head>  
<body>  
<div id="body">{% block body %}{% endblock %}</div>  
<div id="footer">  
{% block footer %}  
&copy; Copyright 2008 by <a href="http://domain.invalid/">you</a>  
{% endblock %}  
</div>  
</body>  
</html>
```
其中编写了网页的整体结构，并且引用了样式文件 `parent.css`。针对子模板需要重写的地方都定义成 block，如 title、head、body、footer，子模板继承父模板后需要重写对应 block 然后即可完成渲染。如下 `child.html`：

```html
{% extends "parent.html" %}  
{% block title %}Home{% endblock %}  
{% block head %}  
<style type="text/css">  
.detail {  
color: red;  
}  
</style>  
{% endblock %}  
  
{% block content %}  
<h1>This is first page.</h1>  
<p class="detail">  
Content of this page.  
</p>  
{% endblock %}

｛% block footer %}
	{{ super() }}
	// code of child template
{% endblock %}
```
首先通过 extends 加载父模板，接下来实现 title、head、content 这 3 个 block，其中的代码会自动填充到父模板指定的位置，最终生成一个完整结构的 HTML。
可以通过 `super()` 引用父模板中已有的内容。

> [! tip] 模板中重名 block 问题
> block 不能重名，如果一个地方需要用到另一个 block 中的内容，可以使用 `self.blockname` 的方式引用，如：
> ```html
> <title>{% block title %}Title{% endblock %}</title>
> <h1> {{self. title}} </h1>
> ```
> `h1` 标签中通过 `{{self.title()}}` 把 title 这个 block 中的内容引用到 h1 标签中。

### 引入模板
网站中要推广客服二维码，在有些页面使用，另一些却不需要。则可以将相关代码写成独立文件，如 `_contact.html`，然后在相应位置使用 `include` 引用：
```html
{% include "_contact.html" %}
```

## 5. 模板环境

### 模板上下文
通过 `render_template` 传入的变量，实际上保存到模板的上下文中。Jinja 2 也内置了一些上下文变量，可以通过 `app.context_processor` 添加。

#### 自定义变量
除了通过 `render_template` 渲染变量，还可以通过模板 set 定义新变量：
```html
｛% set name='admin' %}
```
set 赋值后的变量在其后文都有效，如果不想污染全局环境，则使用 with 语句创建内部作用域：
```html
{% with %}
	{% set foo=42 %}
	{{ foo }}
{% endwith %}

# simplify
{% with foo=42 %}
	{{ foo }}
{% endwith %}
```

#### 内置全局上下文变量
| Variable | Description                                                              |
| -------- | ------------------------------------------------------------------------ |
| g        | 当前请求中的全局对象，一般会把当前请求中多个地方需要用到的变量绑定到上面 |
| request  | 当前请求对象，可以获取请求的信息                                         |
| session  | 当前请求的 session 对象                                                  |
| config   | 项目的配置对象                                                                         |

#### 上下文处理器
如很多网站导航条右上角会显示当前登录的用户名，这就需要把 user 变量传递到几乎所有模板中，使用 `render_template` 会很麻烦，这时可以通过上下文处理器实现：
```python
@app.context_processor
def context_user():
	user = {"username":"admin","level":2}
	return {"user":user}
```
自定义的上下文处理函数中，需要把变量放到字典中，并且不能在 import 导入的模板中使用，除非使用 `with context` 语法。

### 全局函数

#### 内置
| Jinja 2 Golbal Function                                  | Description                                              |
| ----------------------------------------- | -------------------------------------------------------- |
| `range(start, stop, step) `               | 获取一个等差级数的列表                                   |
| `lipsum(n=5, html=True, min=20, max=100)` | 在模板中随机生成文本，5 段，每段 20～100 字符，html 格式 |
| `dict((**items))`                         | 转换为字典                                               |

| Flask Golbal Function | Description              |
| --------------------- | ------------------------ |
| `url_for`             | 加载静态文件，或构建 URL |
| `get_flashed_message` | 用于获取闪现消息         |


#### 自定义

通过 `app.template_global` 装饰器实现：
```python
@app.template_global()
def greet(name):
	return "Hello! %s" % name
```
这可以在模板中直接使用：
```html
<div> {{ greet("Leo") }} </div>
```

### Flask 模板环境
使用 `app.jinja_env` 属性可以配置模板，它是 `jinja2.Environment` 类的对象。

#### 设置 autoescape
Jinja 2 默认开启全局转义，若要关闭则：
```python
app.jinja_env.autoescape = False
```

#### 添加过滤器
通过 `app.jinja_env.filters` 实现：
```python
def myadd(a,b):
	return a+b

app.jinja_env.filters["myadd"] = myadd
```

#### 添加全局对象
通过 `app.jinja_env.globals` 实现：
```python
app.jinja_env.globals["user"] = user
```

#### 添加测试器
通过 `app.jinja_env.tests` 实现：
```python
def is_admin(user):
	if user.role == "admin"
		return True
	else:
		return False

app.jinja_env.tests[:is_admin"] = is_admin
```

## 6. 其他

### 转义
对字符串中危险字符进行转义，如  `<` -> `&lt;`

Flask 会对以 `.html`、`.htm`、`.xml`、`.xhtml` 结尾的文件进行全局转义，其他类型文件则不会转义。

> [! tip] 注意这些情景下的转义需求
> 1. 对用户提交的字符串建议开启转义；
> 2. 在没有开启自动转义的情况下，使用 `｛｛value|escape}}` 对不信任的字符串进行局部转义；对于信任的字符可以 `｛｛value|safe}}` 关闭局部转义
> 3. 使用 `autoescape` 可以对代码块整体开启转义；
> ```html
> {% autoescape true %}
> <p> {{ will_be_escaped }} </p>
> {% endautoescape %}
> ```

### 加载静态文件
除了 HTML，还有 CSS、JavaScript 文件和图片文件提供美观和实用的支持。静态文件默认放到项目的 static 目录下，如果要修改其路径，则修改 Flask 对象的 `static_folder` 参数：
```python
app = Flask(__name__,static_folder='/path/to/static')
```

模板文件中可以通过 `url_for` 加载静态文件：
```html
<link href="{{ url_for('static',filename='about.css')}}">
```
`url_for` 中第一个参数是固定的，表示生成一个静态文件的 URL，第二个参数是可以传递的文件名或文件路径，相对于 static 或自定义的 static_folder 而言。

### 闪现消息
如登录成功消息，是网站对用户提交请求后的提示，可以使用闪现消息实现。需要在视图函数中使用 flash 函数提交消息内容，然后在模板中使用 get_flashed_message 获取视图函数中提交的消息内容，其返回值是一个列表。

```python
from flask import flash

@app.route("/flash")  
def myflash():  
flash('this is msg1')  
flash('this is msg2')  
return render_template("flash.html", flash=True)
```

在 `flash.html` 中写入：
```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<title>Flash Page</title>  
</head>  
<body>  
<ul>  
{% for message in get_flashed_messages() %}  
<li>{{ message }}</li>  
{% endfor %}  
</ul>  
</body>  
</html>
```

闪现消息存储在 session 中，使用 session 之前需要在 `app.config` 中设置 `SECRET_KEY`：
```python
app.config['SECRET_KEY'] = '156324lsj'
```

访问：
![[Pasted image 20230425201032.png]]