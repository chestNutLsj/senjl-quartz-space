网站制作的大概流程：
1. 领导或客户提出产品制作计划，描述产品需求
2. 产品经理整理需求，细化功能，制作产品原型图
3. 设计师根据原型图制作产品设计图
4. 网站开发者根据原型图和设计图完成产品制作
5. 测试工程师对产品进行功能和性能测试，有问题就提交给开发者修复
6. 运维工程师部署产品上线，并保持产品正常运行

## 0. 需求分析

## 1. 创建项目
![[bbs-new-project.png]]

安装依赖：
```shell
pip install -f requirements.txt

# requirements.txt is as following:
alembic==1.6.5  
amqp==5.0.6  
billiard==3.6.4.0  
blinker==1.4  
celery==5.1.2  
cffi==1.14.6  
click==7.1.2  
click-didyoumean==0.0.3  
click-plugins==1.1.1  
click-repl==0.2.0  
colorama==0.4.4  
cryptography==3.4.7  
dnspython==1.16.0  
email-validator==1.1.3  
enum-compat==0.0.3  
eventlet==0.31.1  
Faker==8.12.0  
Flask==2.0.1  
Flask-Avatars==0.2.2  
Flask-Caching==1.10.1  
Flask-Mail==0.9.1  
Flask-Migrate==3.1.0  
flask-paginate==0.8.1  
Flask-SQLAlchemy==2.5.1  
Flask-WTF==0.15.1  
gevent==21.8.0  
greenlet==1.1.1  
idna==3.2  
itsdangerous==2.0.1  
Jinja2==3.0.1  
kombu==5.1.0  
Mako==1.1.4  
MarkupSafe==2.0.1  
Pillow==8.3.1  
prompt-toolkit==3.0.19  
pycparser==2.20  
PyMySQL==1.0.2  
python-dateutil==2.8.2  
python-editor==1.0.4  
pytz==2021.1  
redis==3.5.3  
shortuuid==1.0.1  
six==1.16.0  
SQLAlchemy==1.4.22  
text-unidecode==1.3  
vine==5.0.0  
wcwidth==0.2.5  
Werkzeug==2.0.1  
WTForms==2.3.3  
zope.event==4.5.0  
zope.interface==5.4.0
```

### `config.py` 文件
这个文件存放配置项，如数据库连接配置在不同开发阶段对应不同数据库，包括开发数据库、测试数据库、线上服务器数据库。
因此在此文件中根据环境创建不同的类，存放不同的配置：
```python
import os
from datetime import timedelta


class BaseConfig:
    SECRET_KEY = "your secret key"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    UPLOAD_IMAGE_PATH = os.path.join(os.path.dirname(__file__), "media")

    PER_PAGE_COUNT = 10


class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:root@127.0.0.1:3306/pythonbbs?charset=utf8mb4"

    # 邮箱配置
    MAIL_SERVER = "smtp.163.com"
    MAIL_USE_SSL = True
    MAIL_PORT = 465
    MAIL_USERNAME = "hynever@163.com"
    MAIL_PASSWORD = "1111111111111"
    MAIL_DEFAULT_SENDER = "hynever@163.com"

    # 缓存配置
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "127.0.0.1"
    CACHE_REDIS_PORT = 6379

    # Celery配置
    # 格式：redis://:password@hostname:port/db_number
    CELERY_BROKER_URL = "redis://127.0.0.1:6379/0"
    CELERY_RESULT_BACKEND = "redis://127.0.0.1:6379/0"

    AVATARS_SAVE_PATH = os.path.join(BaseConfig.UPLOAD_IMAGE_PATH, "avatars")


class TestingConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://[测试服务器MySQL用户名]:[测试服务器MySQL密码]@[测试服务器MySQL域名]:[测试服务器MySQL端口号]/pythonbbs?charset=utf8mb4"


class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://[生产环境服务器MySQL用户名]:[生产环境服务器MySQL密码]@[生产环境服务器MySQL域名]:[生产环境服务器MySQL端口号]/pythonbbs?charset=utf8mb4"
```

在 `app.py` 中根据环境选择不同的配置类：
```python
from flask import Flask
import config

app = Flask(__name__)  
app.config.from_object(config.DevelopmentConfig)
```

### `extensions.py` 文件
存放第三方插件的对象。这样做可以防止循环引用，例如一个 SQLAlchemy 对象一般会在 `app.py` 中创建一个 db 变量，用于 ORM 模型的操作：
```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)
```

随着项目的开发，通常 ORM 模型会放到其他文件中，而创建 ORM 模型又需要 db 变量，因此需要从 `app.py` 中引入 db 变量，而为了让 ORM 模型能被映射到数据库中，又需要把 ORM 直接或间接导入 `app.py`。
![[circular-reference.png]]

使用 `extensions.py` 可以打破循环引用，将会引起循环引用的变量都放入其中，然后其他文件都从其中导入变量：
![[break-circular-reference.png]]

`extensions.py`：
```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from flask_mail import Mail  
from flask_caching import Cache  
from flask_wtf import CSRFProtect  
from flask_avatars import Avatars  

mail = Mail()  
cache = Cache()  
csrf = CSRFProtect()  
avatars = Avatars()
```
这里没有传入 app 参数，否则会继续循环引用。应当回到 `app.py` 中引入 db，并用 `db.init_app(app)` 完成初始化。

### blueprints 模块
项目的多个功能以蓝图模块实现。新建 `blueprints/` 这个 python package，然后其中分别创建 `cms.py` 、`front.py`、`user.py`。
```python
# cms.py
from flask import Blueprint

bp = Blueprint("cms", __name__, url_prefix="/cms")
```

```python
# front.py
from flask import Blueprint

bp = Blueprint("front", __name__, url_prefix="")
```
面向前台，所以前缀为空。

```python
# user.py
from flask import Blueprint

bp = Blueprint("user", __name__, url_prefix="/user")
```

之后在 `app.py` 中注册：
```python
...
from blueprints.cms import bp as cms_bp  
from blueprints.front import bp as front_bp   
from blueprints.user import bp as user_bp

app = Flask(__name__)  
app.config.from_object(config.DevelopmentConfig)  
db.init_app(app)

# 注册蓝图  
app.register_blueprint(cms_bp)  
app.register_blueprint(front_bp)  
app.register_blueprint(user_bp)
```

后续开发中，所有前台的视图代码都会放到 front 蓝图中。

### models 模块
新建 `models/` 这个 python package，然后其中分别创建 `post.py` 、`user.py`，分别存放与帖子和用户相关的 ORM 模型。

此时项目结构基本完成，接下来是每个功能的技术细节。

## 2. 创建用户相关模型

### 创建权限和角色模型
用户系统是网站的核心功能，几乎所有功能都涉及到与用户系统的交互。用户系统核心部分是与用户相关的 ORM 模型，前台与后台系统共用用户系统。
在 `models/user.py` 中添加：
```python
class PermissionEnum(Enum):
    BOARD = "板块"
    POST = "帖子"
    COMMENT = "评论"
    FRONT_USER = "前台用户"
    CMS_USER = "后台用户"

class PermissionModel(db.Model):
    __tablename__ = "permission"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Enum(PermissionEnum), nullable=False, unique=True)
```

程序以 Model 后缀区分普通类和 ORM 模型类。PermissionEnum 类是存放权限类型的枚举。PermissionModel 有两个字段，分别是主键 id 和权限名称，并指定权限不能为空且唯一。

PermissionModel 不是直接和用户关联，而是先跟角色关联，再跟用户关联。角色和权限属于多对多关系，即一个权限可以被多个角色拥有，一个角色可以拥有多个权限。继续在 `models/user.py` 中补充：
```python
from datetime import datetime  
from enum import Enum
from extensions import db

role_permission_table = db.Table(
    "role_permission_table",
    db.Column("role_id", db.Integer, db.ForeignKey("role.id")),
    db.Column("permission_id", db.Integer, db.ForeignKey("permission.id"))
)


class RoleModel(db.Model):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    desc = db.Column(db.String(200), nullable=True)
    create_time = db.Column(db.DateTime, default=datetime.now)

    permissions = db.relationship("PermissionModel", secondary=role_permission_table, backref="roles")
```
RoleModel 有 4 个字段，id 为主键，name 为角色名称，desc 为角色描述，create_time 为创建时间，还有一个 permissions 字段表示关系属性，其与 PermissionModel 关联。
RoleModel 和 PermissionModel 属于多对多关系，故在 `db.relationship` 中通过 secondary 参数指定中间表 role_permission_table，其中通过外键 `role_id` 和 `permission_id` 引用 role 表和 permission 表。`backref` 参数值为 roles，这样通过 PermissionModel 的 roles 属性即可访问到该权限下所有与其关联的角色。

之后借助 Flask-Migrate 插件将模型映射到数据库中。返回 `app.py`，创建 Migrate 对象：
```python
from flask_migrate import Migrate

migrate = Migrate(app, db)
```

在 PyCharm 的终端中完成迁移环境的初始化：
```shell
flask db init
```

在 `app.py` 中导入 `models/user.py` 后，执行以下命令生成迁移脚本并完成脚本执行：
```shell
flask db migrate -m "Create permission and role model"
```

执行以下命令同步到数据库：
```shell
flask db upgrade
```

### 创建权限和角色


### 创建用户模型

### 创建测试用户

### 创建管理员

## 3. 注册

### 渲染注册模板

### 使用 Flask-Mail 发送邮箱验证码

### 使用 Flask-Caching 和 Redis 缓存验证码

### 使用 Celery 异步发送邮件

### RESTful API
RESTful（Representational State Transfer，表现层状态转换）, 是 Roy Fielding 博士在 2000 年提出的一种万维网架构风格，主要作用是提供一种软件之间通过 HTTP/HTTPS 协议交换数据的风格。有以下特点：
1. 直观简短的 URL 地址：如 `/post/111/comments` 表示主键为 111 的帖子下评论页面
2. 数据传输格式：JSON、XML 等
3. 操作资源的方法，会根据操作资源的目的，选择不同的 method：如获取资源用 GET，创建资源用 POST，替换资源用 PUT，删除资源用 DELETE
4. 响应的状态码：服务器根据情况返回对应的状态码。2xx 表示操作成功，3xx 表示重定向，4xx 表示客户端错误，5xx 表示服务器错误



网站开发中，RESTful API 一般用于 AJAX（Asynchronous JavaScript and XML）请求。AJAX 是使用 JS 异步发送请求的，根据响应对页面进行局部更新。发送邮箱验证码的请求非常适合使用 AJAX。

### CSRF 保护
只要网页是通过模板渲染的，并且交互中存在非 GET 请求，那么就必须要开启 CSRF 保护。

### 使用 AJAX 获取邮箱验证码

### 实现注册功能


## 4. 登录
用户会在登录界面输入邮箱和密码，然后后台会提交到视图函数中，视图函数验证邮箱和密码是否正确，如果正确，则把能识别用户的数据添加到 cookie 中，再返回给浏览器。当浏览器下次再访问本网站下其他页面时，会自动携带 cookie，从而得知请求来自于哪个用户。

## 5. 发帖
发帖模块也是收集用户输入数据并发送至服务器，但不同的是帖子数据是富文本内容，这需要作出一些改进。

### 添加帖子相关模型

### 初始化板块数据

### 渲染发布帖子模板

### 使用 wangEditor 富文本编辑器

### 未登录限制

### 服务端实现发帖功能

### 使用 AJAX 发布帖子

## 6. 首页

### 展示帖子列表

### 生成帖子测试数据

### 使用 Flask-Paginate 实现分页

### 过滤帖子

## 7. 帖子详情

### 动态加载帖子详情数据

### 发布评论

## 8. 个人中心

### 使用 Flask-Avatars 生成随机头像

### 修改导航条上的登录状态

### 根据用户显示个人中心

### 修改用户信息

## 9. CMS 管理系统
CMS（Content Management System）

### CMS 入口

### 权限管理

### 员工管理页面

### 添加员工

### 编辑员工

### 管理前台用户