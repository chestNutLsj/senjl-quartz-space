![[project-structure.png]]

在第 6 行中参数 `'/'` 称为 URL（Uniform Resource Locator）
被 `@app.route` 装饰的函数叫做视图函数—— `hello_world()`。

`@app.route` 装饰器中添加了访问 URL 的规则——“/”，代表网站的根路径，被装饰的 `hello_world` 函数会在访问网站根目录时被执行，因此访问对应端口返回的只是“Hello World!”字符串。

## 1. 自定义 URL

### 无参数
指在 URL 定义过程中，不需要定义参数。
```python
@app.route('/profile')
def profile():
	return 'this is profile'
```

运行项目后访问对应网站：
![[Pasted image 20230419235731.png]]

### 有参数
如果 URL 携带了参数，其视图函数也必须定义相应的形参来接收 URL 中的参数。

```python
@app.route('/blog/<int:blog_id>')
def blog_detail(blog_id):
return "The ID of blog is: %s"%blog_id
```

访问：
![[Pasted image 20230420001457.png]]

> [! tip] 指定参数类型
> 注意到在设置 URL 时通过<类型名:参数名>设置了 int 类型的 blog_id，这样有两点好处：
> 1. 浏览器访问 URL 时，如果传入参数不能被转换为指定参数类型（int 或其他），那么就会抛出 404 异常；
> 2. URL 本质是字符串，没有指定类型时传入视图函数的参数默认为字符串类型；

![[Pasted image 20230420002027.png]]

#### URL 支持的其他参数
| 参数类型 | Description                     |
| -------- | ------------------------------- |
| string   | 可以接收除 `/` 外所有字符       | 
| int      | 接收能通过 int()方法转换的字符  |
| float    | 接收能通过 float()转换的字符    |
| path     | 类似 string，但中间可以添加 `/` |
| uuid     | 一组 32 位十六进制数            |
| any      | 备选值中任一都可                |

一个 `any` 参数的应用实例：
```python
@app.route("/blog/list/<any(python,flask,django):category>")
def blog_list_with_category(category):
	return "The blog type is: %s"%category
```

访问：
![[Pasted image 20230420002739.png]]
事实上除了 python，还可以是 flask 和 django，但其他值不行：
![[Pasted image 20230420002820.png]]

#### 多参数
如果 URL 中需要传递多个参数，只需用 `/` 分隔开即可：
```python
@app.route('/blog/list/<int:user_id>/<int:page')  
def blog_list_with_user_id(user_id, page):  
return "The user id is: %s, blog page is %s" % (user_id, page)
```

访问：
![[Pasted image 20230420003224.png]]

#### 查询字符串
在 URL 后通过 `?` 添加参数也可以传递所需参数，其规则如下：
`URL?param1=val1&param2=val2&param3=val3`

通过 查询字符串的方式传递参数，事先不需要在 URL 中进行定义：
```python
from flask import request

...

@app.route("/blog/user')
def blog_list_query_str():  
user_name = request.args.get('user_name')  
user_key = request.args.get('user_key')  
return "The queried user_name is: %s, user_key is: %" % (user_name, user_key)
```

访问：
![[Pasted image 20230420004202.png]]

其中，`request` 是一个线程隔离的全局对象，` request.args ` 是一个继承自 `dict` 的 ` werkzeug.datastructures.MultiDict ` 对象，保存了当前请求的查询字符串参数，并被解析成键值对的形式，其后通过字典的方式获取参数。

>[! tip] URL 中定义参数与查询字符串的区别
>1. URL 中嵌入参数，实际上成为了 URL 的一部分；
>2. 查询字符串是 HTTP 协议层面用于传递参数的技术；
>3. 在 URL 中定义参数更利于 SEO 优化（Search Engine Optimize），可以做好类型约束，不会让错误的类型匹配 URL，有利于程序的健壮性
>4. 查询字符串的方式传递参数更加灵活，不需要修改 URL 也方便随时添加参数

## 2. HTTP 请求方法

| Request Method | Description                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GET            | 从服务器获取资源，浏览器中输入网址访问默认使用的即是 GET 请求                                                                     |
| POST           | 提交资源到服务器，如提交表单或上传文件                                                                                            |
| HEAD           | 类似于 GET，响应体中不包括具体内容，用于获取消息头                                                                                |
| DELETE         | 请求服务器删除资源                                                                                                                |
| PUT            | 请求服务器替换或者修改已有的资源                                                                                                  |
| OPTIONS        | 请求服务器返回某个资源所支持的所有 HTTP 请求方法。如 AJAX 跨域请求常用 OPTIONS 方法发送嗅探请求，来判断是否有对某个资源访问的权限 |
| PATCH          | 类似于 PUT，但一般用于局部资源的更新；PUT 方法用于整个资源的替换                                                                  |                                                                                                                          

### 修改 URL 请求方法

想要修改 URL 的请求方法，可以在定义 URL 时，给 `app.route` 设置 methods 参数：
```python
@app.route('/blog/add', method=['POST'])  
def blog_add():  
return "Use POST method to add a new blog"
```

访问：
![[Pasted image 20230420175429.png]]
上述代码中 methods 参数列表只有 POST 参数，因此只能通过 POST 方法访问，否则会被拒绝。

### 添加多个 URL 请求方法

如果需要一个 URL 既可以通过 GET 方法也可以通过 POST 方法请求访问，则可以在 methods 方法中添加二者：
```python
@app.route('/blog/add/post/get', methods=['POST', 'GET'])  
def blog_add_post_get():  
if request.method == 'GET':  
return "Use GET method to add a new blog"  
elif request.method == 'POST':  
return "Use POST method to add a new blog"
```

访问：
![[Pasted image 20230420182228.png]]

### 快捷路由装饰器
Flask 2.0 版本支持：
| 快捷路由装饰器         | Description                              |
| ---------------------- | ---------------------------------------- |
| `app.get("/login")`    | == `app.route("/login",methods=['GET'])` |
| `app.post("/login")`   |                                          |
| `app.put("/login")`    |                                          |
| `app.delete("/login")` |                                          |
| `app.patch("/login")`  |                                          |

## 3. 页面重定向
重定向指浏览器从一个页面跳转到另一个页面。分为永久性重定向和暂时性重定向：
- 永久性重定向：HTTP 状态码是 301，多用于旧网址已被废弃，需要转到一个新的网址；
- 暂时性重定向：HTTP 状态码是 302，表示页面暂时性跳转，如需要用户登录权限的网址会跳转到登录页面

重定向通过 `flask.redirect(location,code=302)` 实现，location 指重定向的目标 URL，code 是状态码：
```python
@app.route('/login')  
def login():  
return 'This is login page'  
  
  
@app.route('/user')  
def user_login():  
name = request.args.get('name')  
if not name:  
return redirect('/login')  
else:  
return "Hello! %s" % name
```

访问：
![[Pasted image 20230420184341.png]]

![[Pasted image 20230420184422.png]]
如果不输入 name 参数，就会重定向到 login 页面。

## 4. 构造 URL
上节中使用 `redirect("/login")` 函数是直接把 `/login` 这个 URL 硬编码进去的，不利于项目的健壮性，更好的方式应该是通过 `url_for` 函数动态地构造 URL。

`url_for` 接收视图函数名作为第一个参数，以及其他 URL 定义时的参数，如果还添加了其他参数，则会添加到 URL 后面作为查询字符串参数：
```python
@app.route('/urlfor')  
def get_url_for():  
url = url_for("blog_detail", blog_id=5, user="lsj")  
return url
```

访问：
![[Pasted image 20230420185612.png]]
在 `get_url_for` 视图函数中调用了 `url_for` 函数，
- 其中使用前文视图函数 `blog_detail` 作为第一个参数，
- 并且由于 `blog_detail` 的 URL 需要接收一个 `blog_id` 参数，因此这个参数也需要传递给 `url_for`，
- 最后一个参数 `user` 不是必需的，它最终作为查询字符串参数拼接上去。

>[! check] `url_for` 相较于 URL 硬编码的优点
>1. URL 是对外的，可能会经常变化，但视图函数不会经常变化，如果直接 URL 硬编码，后期 URL 改变后所有硬编码了此 URL 的代码都需要修改；
>2. URL 在网络之间通信的过程中，需要把一些特殊字符如中文等进行编码，使用 `url_for` 可以自动进行编码；


