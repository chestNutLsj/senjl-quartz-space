## 1. 类视图
之前都是用函数实现视图，事实上也可以用类实现。类视图的好处是可以使用继承。
### 基本使用
类视图需要继承自 `flask.views.View` 类，然后在子类中实现 `dispatch_request` 方法。示例如下：
```python
from flask import Flask, render_template  
from flask.views import View

class ShowUsers(View):  
def dispatch_request(self):  
users = User.query.all()  
return render_template('users.html', object=users)  
  
  
app.add_url_rule('/users/', view_func=ShowUsers.as_view('show_users'))
```
在实现的 `dispatch_request` 方法中，从数据库中获取所有的用户，并且渲染模板。最后使用 `app.add_url_rule` 方法与路由绑定，其中必须用 `as_view()` 方法将类转换为实际的视图函数，传递给 `as_view()` 的字符串参数是视图函数的名称，以后通过 `url_for` 反转时会用到这个名称。

但此时类视图没有发挥优势，这样修改：
```python
class ListView(View):
    def get_template_name(self):
        raise NotImplementedError()

    def render_template(self, context):
        return render_template(self.get_template_name(), **context)

    def dispatch_request(self):
        context = {'objects': self.get_objects()}
        return self.render_template(context)


class UserView(ListView):
    def get_template_name(self):
        return 'users.html'

    def get_objects(self):
        return User.query.all()
```
ListView 父视图提前定义好了用于获取模板的 `get_template_name` 方法，子视图必须实现它否则会抛出 `NotImplementedError` 异常，此外定义了用于渲染模板的 `render_template` 方法和分发请求的 `dispatch_request` 方法。

### 方法限制
类视图中需要通过定义 methods 类属性来实现限制请求的功能：
```python
class MyView(View):
    methods = ['GET','POST']
    def dispatch_request(self):
        if request.method=='POST':
        ...
        
app.add_url_rule('/myview',view_func=MyView.as_view('myview'))
```

### 基于方法的类视图
如果让子视图继承自 `flask.views.MethodView`，则可以在类视图中重写对应小写形式的方法，如 GET 请求则实现 get 方法，POST 请求实现 post 方法，flask 自动根据浏览器请求的 HTTP 方法对应执行：
```python
class UserAPI(MethodView):  
	def get(self):  
		users = User.query.all()  
	...
	
	def post(self):  
		user = User.from_form_data(request.form)  
	...
	
app.add_url_rule('/users/',view_func=UserAPI.as_view('users'))
```
之后在访问 `/users/` 这个 URL 时，如果用 GET 方法请求则会执行 get，用 POST 方法请求会执行 post。

### 添加装饰器
在类视图中定义类属性 decorators 可以实现添加装饰器：
```python
class UserAPI(MethodView):
	decorators = [user_required]
```

## 2. 蓝图
此前所有视图函数都写在 `app.py` 中，这不利于复杂项目的维护，应当对功能进行模块化处理，不同功能模块使用蓝图实现，最后在 `app.py` 中统一注册。

### 基本使用
以用户模块为例，注册一个蓝图 `user.py`：
```python
from flask import Blueprint

bp = Blueprint('user', __name__, url_prefix='/user')


@bp.route('/list')
def user_list():
    return "User List"


@bp.route('/profile/<user_id>')
def user_profile(user_id):
    return "User Profile"
```
使用 Blueprint 初始化对象时有三个参数，分别是
- 蓝图名称：使用 `url_for` 反转蓝图中某个视图时需要用到 `蓝图名.视图名`
- 模块名：一般设置为 `__name__ ` 用于寻找模板文件和静态文件
- URL 前缀：之后访问这个蓝图的所有 URL，都必须加上这个前缀

之后可以在 Flask 的 app 中进行注册：
```python
from user import bp as user_bp  
  
...

app.register_blueprint(user_bp)
```

### 寻找模板
蓝图中渲染模板，默认从 `templates/` 文件夹中寻找，想要修改寻找路径，应传递 `template_folder` 参数：
```python
bp = Blueprint('user', __name__, url_prefix='/user', template_folder='my_template')
```

### 寻找静态文件
使用 `static_folder` 参数可以更改默认静态文件路径：
```python
bp = Blueprint('user', __name__, url_prefix='/user', static_folder='my_static')
```
在模板中引用蓝图，应使用 `蓝图名.static` 来引用：
```html
<link href="{{ url_for('user.static',filename='about.css') }}">
```

## 3. Cookie 和 Session
HTTP 请求是无状态的，每次请求间是相互独立，cookie 和 session 解决了这个问题。

### 介绍
#### cookie

#### session

### 使用
#### 操作 cookie

#### 操作 session


## 4. request 对象

## 5. Flask 信号

## 6. 钩子函数

## 7. 上下文