# Activity

Activity是一种可以包含用户界面的组件，主要用于和用户进行交互。一个应用程序中可以包含零个或多个Activity。

## 1. Activity的基本使用

首先创建一个No Activity的project。在`app/src/main/java/cn.xdlsj.activetest`包中新建一个Empty Activity，命名为FirstActivity，注意创建页面中不要勾选`Gererate Layout`和`Launcher Activity`。其中`Generate Layout`会自动为FirstActivity创建一个对应的布局文件，`Launcher Activity`会自动将FirstActivity设置为当前项目的主Activity。

项目中任何Activity都应该重写onCreate()方法，而目前FirstActivity中已经由Android Studio自动完成重写：

```kotlin
class FirstActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }
}
```

可以看到，默认重写的onCreate()方法只是调用了父类的onCreate()方法，后续将会加入自己的逻辑。

### 1.1 创建和加载布局

