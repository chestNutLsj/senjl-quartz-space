# Hello, World!

## 1. 总览Android

### 1.1 Android系统架构

Android可以大致分为4层架构：

* **Linux内核层：**Android系统是基于Linux内核的，这一层为Android设备的各种硬件提供了底层的驱动，诸如显示驱动、音频驱动、照相机驱动、蓝牙驱动、Wi-Fi驱动、电源管理等；

* **系统运行库层：**这一层通过一些C/C++库为Android系统提供了主要的特性支持。如SQLite库提供了数据库支持，OpenGL | ES库提供3D绘图支持，Webkit库提供了浏览器内核的支持等；

  这一层还有*Android运行时库*，主要提供了一些核心库，允许开发者使用Java语言来编写Android应用。另外，Android运行时库还包含了Dalvik虚拟机（Android5.0后就改为ART运行环境），可以使得每一个Android应用都能运行在独立的进程中，并拥有一个自己的虚拟机实例。较JVM，Dalvik和ART都是专门为移动设备定制的，针对手机内存、CPU有限的性能进行了优化处理；

* **应用框架层：**主要提供了构建应用程序可能用到的各种API，Android自带的一些核心应用就是使用这些API完成的，开发者可以使用这些API来构建自己的应用程序；

* **应用层：**所有安装在手机上的应用程序，都在这一层。

<img src="images/The-Android-software-stack.png" style="zoom: 50%;" />

### 1.2 Android Released

详细情况可参考[Android 历史版本](https://zh.wikipedia.org/wiki/Android%E7%89%88%E6%9C%AC%E5%88%97%E8%A1%A8)。

| 名称/代号                                                    | 版本号      | 发行日期       | API等级 | 安全性更新状态 | 市场占有率 |
| ------------------------------------------------------------ | ----------- | -------------- | ------- | -------------- | ---------- |
| [Android 1.0](https://zh.wikipedia.org/wiki/Android_1.0)     | 1.0         | 2008年9月23日  | 1       | 不支持         |            |
| [Android 1.1](https://zh.wikipedia.org/wiki/Android_1.1)     | 1.1         | 2009年2月9日   | 2       | 不支持         |            |
| [Android Cupcake](https://zh.wikipedia.org/wiki/Android_Cupcake) | 1.5         | 2009年4月27日  | 3       | 不支持         |            |
| [Android Donut](https://zh.wikipedia.org/wiki/Android_Donut) | 1.6         | 2009年9月15日  | 4       | 不支持         |            |
| [Android Eclair](https://zh.wikipedia.org/wiki/Android_Eclair) | 2.0 – 2.1   | 2009年10月26日 | 5 – 7   | 不支持         |            |
| [Android Froyo](https://zh.wikipedia.org/wiki/Android_Froyo) | 2.2 – 2.2.3 | 2010年5月20日  | 8       | 不支持         |            |
| [Android Gingerbread](https://zh.wikipedia.org/wiki/Android_Gingerbread) | 2.3 – 2.3.7 | 2010年12月6日  | 9 – 10  | 不支持         |            |
| [Android Honeycomb](https://zh.wikipedia.org/wiki/Android_Honeycomb) | 3.0 – 3.2.6 | 2011年2月22日  | 11 – 13 | 不支持         |            |
| [Android Ice Cream Sandwich](https://zh.wikipedia.org/wiki/Android_Ice_Cream_Sandwich) | 4.0 – 4.0.4 | 2011年10月18日 | 14 – 15 | 不支持         |            |
| [Android Jelly Bean](https://zh.wikipedia.org/wiki/Android_Jelly_Bean) | 4.1 – 4.3.1 | 2012年7月9日   | 16 – 18 | 不支持         | 0.6%       |
| [Android KitKat](https://zh.wikipedia.org/wiki/Android_KitKat) | 4.4 – 4.4.4 | 2013年10月31日 | 19 – 20 | 不支持         | 1.4%       |
| [Android Lollipop](https://zh.wikipedia.org/wiki/Android_Lollipop) | 5.0 – 5.1.1 | 2014年11月12日 | 21 – 22 | 不支持         | 3.9%       |
| [Android Marshmallow](https://zh.wikipedia.org/wiki/Android_Marshmallow) | 6.0 – 6.0.1 | 2015年10月5日  | 23      | 不支持         | 5.1%       |
| [Android Nougat](https://zh.wikipedia.org/wiki/Android_Nougat) | 7.0 – 7.1.2 | 2016年8月22日  | 24 – 25 | 不支持         | 6.3%       |
| [Android Oreo](https://zh.wikipedia.org/wiki/Android_Oreo)   | 8.0 – 8.1   | 2017年8月21日  | 26 – 27 | 支持           | 13.7%      |
| [Android Pie](https://zh.wikipedia.org/wiki/Android_Pie)     | 9           | 2018年8月6日   | 28      | 支持           | 18.2%      |
| [Android 10](https://zh.wikipedia.org/wiki/Android_10)       | 10          | 2019年9月3日   | 29      | 支持           | 26.5%      |
| [Android 11](https://zh.wikipedia.org/wiki/Android_11)       | 11          | 2020年9月8日   | 30      | 支持           | 24.3%      |
| [Android 12](https://zh.wikipedia.org/wiki/Android_12)       | **12**      | 2021年10月4日  | 31      | 支持           |            |

其中，Android 8.0之前版本已经不再支持，Android 8.0 - 11是旧版本但仍被支持，Android 12 是当前版本。Android 5.0 之后的版本市场占有率超过 98%，因此之后学习中更早的Android版本就不再兼容。

### 1.3 Android应用开发

1. Android提供的四大组件：

   * Activity：是所有Android应用程序的门面，凡是在应用中看得到的东西，都放在其中；
   * Service：提供服务框架，在后台运行；
   * BroadcastReceiver：允许应用接收来自各处的广播消息，如电话、短信等，当然也可以借此向外广播消息；
   * ContentProvider：为应用之间共享数据提供帮助。

2. 丰富的系统控件：

   借助Android的系统控件可以轻松开发出简单漂亮的界面，当然也可以自由定制。

3. SQLite数据库：

   是一种轻量级、运算速度极快的嵌入式关系型数据库，支持标准的SQL语法；可以通过Android封装好的API进行操作，让存储和读取数据更方便。

4. 多媒体服务：

   提供诸如音乐、视频、录音、拍照等丰富的多媒体服务。

## 2. 搭建开发环境

开发Android程序需要的工具主要有这三种：

* JDK：Java的软件开发工具包，提供了Java运行环境、工具集合、基础类库等内容；
* Android SDK：Google提供的Android开发工具包，通过引入该工具包来使用Android相关API；
* Android Studio：Google提供的官方IDE。

### 2.1 下载

Windows系统下，在Android官网就可以下载最新的开发工具：<https://developer.android.google.cn/studio>。下载后一直点next即可。

Linux系统下，可以通过JetBrains的Toolbox下载Android Studio，并且在其中管理SDK安装时，就不必再手动安装Android SDK组件。如果确认只需要Android Studio而不使用JetBrains旗下其他IDE，就可以直接在命令行用包管理工具下载，而不比通过Toolbox安装、管理。

### 2.2 配置

* 如果是第一次使用Android Studio，选择不导入配置；
* 在Welcome的配置界面，依次点击Next、标准安装类型Standard、选择UI 主题、Finish。

## 3. Hello, World!

### 3.1 创建Hello World项目

![](first.png)

可以在此处选择各种设备、各种模板，不过我们先使用最简单的“Empty Activity”，之后的选项如下：

![](second.png)

点击Finish，Android Studio会自动开始下载缺少的SDK文件并进行配置，第一次使用可能会花费较长时间加载。

### 3.2 启动模拟器

Android Studio会为新项目生产很多文件，此时不需要编写代码即可运行HelloWorld项目。在那之前，需要一个运行的载体，此处我们先使用模拟器来运行程序。

点击Android Studio顶部工具栏中的图标：

![](simulator.png)

在弹出窗口中选择所要的设备，即可开始创建：选择设备$\rarr$选择操作系统版本（如果没有对应系统的镜像，需要先进行下载）

![](system_image.png)

之后点击Next$\rarr$没有特殊需求的话，点击Finsh$\rarr$在弹出的窗口中点击Actions的三角符号启动模拟器：

![](virtual_devices.png)

启动后点击power开机，之后画面是这样：

![](phone.png)

### 3.3 运行HelloWorld

启动模拟器后，需要将HelloWorld项目部署到模拟器上。这时需要使用顶部工具栏中的编译选项：

![](make.png)

Make按钮右边两个下拉列表：一个是用来选择运行哪一个项目，通常app就是当前主项目；一个是选择运行在哪一个设备上。再右边三角形按钮，是用来运行项目的。

![](deploy.png)

可以看到，HelloWorld项目已经运行了，打开应用列表，可以看到HelloWorld程序已经安装：

![](app.png)

### 3.4 分析HelloWorld项目

#### 3.4.1 外层结构

![](android_structure.png)

这是默认的Android模式项目结构，这是被Android Studio转换过的非真实目录结构，但胜在简洁明了、适合快速开发，不适合新手阅读。先点击Android按钮切换到Project结构模式：

![](project_struc.png)

* .gradle 和 .idea：放置Android Studio自动生成的配置文件，无需关心，也不要手动编辑；
* app：项目中的资源、代码等内容都存放于此，后续开发都在这个目录；
* build：包含编译时自动生成的文件，不需关心；
* gradle：包含了gradle wrapper的配置文件；
* .gitignore：用来将指定的目录或文件排除在版本控制之外；
* build.gradle：项目全局的gradle构建脚本，通常不需要修改；
* gradle.properties：全局的gradle配置文件，在这里配置的属性会影响到项目中所有的gradle编译脚本；
* gradlew和gradlew.bat：用来在命令行中执行gradle命令，gradlew用在Linux或Mac中，gradlew.bat用在Windows中；
* local.properties：用于指定本机中Android SDK路径，自动生成，不必修改；
* settings.gradle：用于指定项目中所有引入的模块，通常情况下，模块的引入是自动完成的，不必手动修改。

#### 3.4.2 app目录

可以看到，外层目录结构中的文件或目录大多是自动生成的，需要手动修改的地方很少，而我们主要开发使用的，就是app目录：

![](app_struc.png)

* build：编译时自动生成的文件，不必多关心；
* libs：如果项目用到了第三方jar包，就需要存放在这个目录中，这个目录下的jar包会被自动添加到项目的构建路径里；
* src/androidTest：用来编写Android Test测试用例，可以对项目进行一些自动化测试；
* scr/main/java：存放所有自己编写的Java/Kotlin代码，展开这个目录可以看到HelloWorld项目所在的包以及系统生成的MainActivity文件；
* src/main/res：存放项目中使用到的图片、布局、字符串等资源；
* src/main/AndroidManifest.xml：整个Android项目的配置文件，在程序中定义的四大组件都要在这个文件中注册，另外还可以在此文件中对应用程序添加权限声明；
* src/test：用来编写Unit Test测试用例，是对项目进行自动化测试的另一种方式；
* .gitignore：将app模块内指定的目录或文件排除在版本控制之外；
* build.gradle：app模块的gradle构建脚本，指定项目构建相关的配置；
* proguard-rules.pro：用于指定项目代码的混淆规则，这样在打包成安装包文件后，会将代码混淆，从而让破解者难以阅读。

#### 3.4.3 AndroidManifest.xml文件

打开AndroidManifest.xml文件，可以找到如下代码：

```xml
<activity
          android:name=".MainActivity"
          android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />

        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

这段代码表示对MainActivity进行注册，没有在AndroidManifest.xml中注册的Activity是不能使用的。

intent-filter语句块中的两行代码表示MainActivity是这个项目的主Activity，在手机上点击应用图标，首先启动的就是这个Activity。



MainActivity中的代码是打开Android应用程序的直接所见：

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

* 这段代码表示MainActivity类继承自AppCompatActivity。
* onCreate()方法是一个Activity被创建时必定要执行的方法。其中只有两段代码，而且并没有”Hello World!”字样，那么，它定义在哪里呢？



可以看到，onCreate()方法中调用了savedInstanceState()，这个方法给当前的Activity引入了一个activity_main布局，而“Hello World!”就定义在这里：

```xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</android.support.constraint.ConstraintLayout>
```

布局文件定义在res/layout目录下，打开该文件并切换到Code视图，就可以看到如上代码。

Android程序的设计讲究逻辑和视图分离，因此不会在Activity中直接编写界面，而是在布局文件中编写界面，然后在Activity中引入。最终，可以看到“Hello World!”字样定义在<TextView android:text=“Hello World!”/>中。

### 3.5 详解项目中的资源

![](res.png)

所有drawable开头的目录都是用来存放图片的，mipmap是用来存放应用图标的，values是用来存放字符串、样式、颜色等配置的，layout是用来存放布局文件的。

之所以有许多drawable、mipmap开头的目录，是为了匹配不同Android设备。在制作程序时，最好能够给一张图片提供几个不同分辨率的版本，分别存放在这些目录下，届时程序运行会根据设备分辨率自动选择合适的图片。如果只有一张图片，存放在mipmap-xxhdpi即可，这是最主流的设备分辨率的目录。



打开values/strings.xml文件，内容如下：

```xml
<resources>
    <string name="app_name">HelloWorld</string>
</resources>
```

定义了一个应用程序名的字符串，可以有两种方式引用：

* 在代码中通过`R.string.app_name`获得该字符串的引用；
* 在XML中通过`@string/app_name`获得该字符串的引用。

引用代码中string部分可以替换成drawable、mipmap、layout等字段。如AndroidManifest.xml文件中如下代码：

```xml
<application
             android:allowBackup="true"
             android:icon="@mipmap/ic_launcher"
             android:label="@string/app_name"
             android:roundIcon="@mipmap/ic_launcher_round"
             android:supportsRtl="true"
             android:theme="@style/Theme.HelloWorld">
    <activity
        ...
    </activity>
</application>
```

可以看到，HelloWorld项目的应用图标通过`android:icon`属性指定，应用名称通过`android:label`属性指定。

### 3.6 理解build.gradle文件

Android Studio通过Gradle构建项目，Gradle使用一种基于Groovy的领域特定语言（DSL）来进行项目设置，摒弃了传统基于XML（如Maven）的各种繁琐配置。

之前遇到了两个不同位置的build.gradle文件，其内容和作用都是不同的。

#### 3.6.1 外层结构中的build.gradle文件

```groovy
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:7.0.4"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.6.10"

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

repositories中声明了google()和mavenCentral()，分别对应一个代码仓库，google仓库中主要包含Google自家的扩展依赖库，mavenCentral()仓库中包含第三方开源库，有这两行声明就可以在项目中引用任何对应仓库中的依赖库了。

dependencies{}闭包中使用classpath声明了两个插件——一个Gradle插件和一个Kotlin插件。Gradle不是专门的Android项目构建工具，它也可以用来构建Java、C++等项目，因此需要如此声明；Kotlin插件是为了标识该项目是Kotlin语言开发的，如果是Java，则不需要声明。

通常情况下，这个文件不需要修改，除非想要添加一些全局的项目构建配置。



#### 3.6.2 app目录下的build.gradle文件

```groovy
plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    compileSdk 32

    defaultConfig {
        applicationId "cn.xdlsj.helloworld"
        minSdk 21
        targetSdk 32
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {

    implementation 'com.android.support:appcompat-v7:28.0.0'
    implementation 'com.android.support.constraint:constraint-layout:2.0.4'
    testImplementation 'junit:junit:4.+'
    androidTestImplementation 'com.android.support.test:runner:1.0.2'
    androidTestImplementation 'com.android.support.test.espresso:espresso-core:3.0.2'
}
```

* plugin闭包中包含了两个插件，`com.android.application`表示这是一个应用程序模块，`kotlin-android`是使用Kotlin开发项目所必需的。还可能有的插件是`com.android.libiary`或`kotlin-android-extensions`，其分别表示库模块和Kotlin扩展功能，库模块只能作为代码库依附于应用程序模块运行，而应用程序模块可以直接运行。
* android闭包中配置了项目构建的各种属性，compileSdk指定项目的编译版本，这里指定32表示使用Android 11系统的SDK编译；
  * defaultConfig闭包中，对项目更多细节进行配置
    * applicationId是每个应用的唯一标识符，绝对不能重复，默认会使用我们在创建项目时指定的包名，在这里修改项目名会覆盖其他地方的指定项目名；
    * minSdk指定项目最低兼容的Android版本，21表示Android 5.0；
    * targetSdk指定的值表示在该目标版本上已经做过了充分测试，系统将会为该应用程序启动对应Android版本的新特性；
    * versionCode指定项目的版本号；
    * versionName指定项目的版本名；
    * testInstrumentationRunner用于在当前项目中启用JUnit测试，可以为当前项目编写测试用例，以保证功能的正确性和完整性；
  * buildTypes闭包中，用于指定生成安装文件的相关配置。通常只会有两个子闭包
    * debug闭包，用于指定生成测试版安装文件的配置，可以忽略不写；
    * release闭包，用于指定生成正式版安装文件的配置
      * minifyEnabled用于指定是否对项目的代码进行混淆，true表示混淆，false表示不混淆；
      * proguardFiles用于指定混淆规则时使用的规则文件，这里指定了`proguard-android-optimize.txt`和`proguard-rules.pro`两个文件，分别在`<Android SDK>/tools/proguard`目录下和当前项目的根目录下，分别包含所有项目通用的混淆规则和当前项目特有的混淆规则。需要注意的是，Android Studio直接运行项目生成的都是测试版安装文件，如何生成正式版安装文件还需后续学习；
  * compileOptions闭包
  * kotlinOptions闭包
* dependencies闭包，用于指定当前项目所有的依赖关系——本地依赖，对本地的jar包或目录添加依赖关系；库依赖，对项目中的库模块添加依赖关系；远程依赖，对mavenCentral仓库上的开源项目添加依赖关系
  * implementation fileTree是本地依赖声明，表示将libs目录下所有.jar后缀的文件都添加到项目的构建路径中；
  * implementation project是库依赖声明，表示添加括号内的依赖库名称；
  * implementation是远程依赖声明；
  * testImplementation和androidTestImplementation用于声明测试用例库。

## 4. 前行必备：掌握使用日志工具

### 4.1 使用Android的日值工具Log

Android中使用的日值工具类是Log（android.util.log），其中有五种方法来打印日志：

* Log.v()，打印最琐碎的、意义最小的日志信息，对应级别verbose(冗长的、啰嗦的)，是Android日志里级别最低的一种；
* Log.d()，打印一些调试信息，这些信息对调试程序和分析问题有帮助，对应级别debug，高verbose一级；
* Log.i()，打印一些比较重要的数据，这些数据是非常想看到的、可以帮助分析用户行为的数据，对应级别info，高debug一级；
* Log.w()，打印一些警告信息，提示程序在这个地方可能会有潜在风险，最好修复一下出现警告的地方，对应级别warm，高info一级；
* Log.e()，打印程序中的错误信息，比如程序进入了catch语句中，此时程序出现严重问题，必须尽快修复，对应级别error，高warm一级。



在MainActivity文件中onCreate()方法中添加一行打印日志的语句：

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        Log.d("MainActivity","onCreate execute")
    }
}
```

其中传入了两个参数，第一个参数是tag，一般传入当前类名即可，主要用于对打印信息进行过滤；第二个参数是msg，即想要打印的具体内容。

之后重新运行HelloWorld项目，运行完毕后在Android Studio底部工具栏的“Logcat”中可以看到打印信息：

![](log.png)

在日志中，可以看到打印日志的内容、tag名、程序的包名、打印时间、应用程序的进程号等；

### 4.2 为什么使用Log而不是println()？

真正的项目开发中，不可以使用`System.out.println()`或`println()`两种方法打印日志，因为这样打印日志开关不可控制、不能添加日志标签、日志没有级别区分……等众多问题。

而使用Log()和Logcat配合使用可以完成绝大多数日志需求：

![](logcat.png)

* 首先，Logcat可以添加过滤器，其中Show only selected application表示只显示当前选中程序的日志；Firebase是Google提供的一个开发者工具和基础架构平台，暂且不管；No Filters表示没有过滤；Edit Filter Configuartion表示自定义过滤，切换到这个过滤模式后会弹出一个过滤器配置界面，进行自定义配置即可；
* 其次，可以控制日志级别，分别对应上一节的5种方法——verbose、debug、info、warn、error。如果切换成info、warn、error级别，将不会有日志打印，因为使用的日志打印方法是Log.d()；
* 最后，在输入框中输入关键字内容，可以过滤出包含关键字的日志，并且关键字过滤支持正则表达式。



































