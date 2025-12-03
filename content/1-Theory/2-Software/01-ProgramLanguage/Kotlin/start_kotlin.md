看完下面Kotlin简洁高效的语法和实现，你一定会说：***So, java, fxxk you!*** 🖕

关于Kotlin Language的简介和历史，请自行阅读以下：

* [Kotlin官网](https://kotlinlang.org/)；
* Wiki上关于Kotlin的介绍：<https://en.wikipedia.org/wiki/Kotlin_(programming_language)>；
* Android与Kotlin：<https://developer.android.google.cn/kotlin?hl=zh-cn>；

## 1. 运行环境

* 使用IntelliJ IDEA；
* 在线运行Kotlin代码：<https://try.kotlinlang.org>；
* 使用Android Studio。但是它是专用开发Android应用程序的工具，不能直接用来运行Kotlin代码，这就需要先创建一个Android项目，然后在里面编写Kotlin的main()函数，再进行编写Kotlin代码。

这里，我选用第一种。

## 2. 变量

### 2.1 声明

Kotlin声明变量时，只需要在变量前声明两种关键字：`var`或者`val`。其中，`var`表示声明一个变量，`val`表示声明一个常量。

之所以不需要提前声明数据类型，是因为Kotlin会根据变量的赋值情况自动推导成对应数据类型：

```kotlin HL:"3"
fun main() {
    val a=10
    val b="Hello, world!!!"
    println("a = "+a)
    println("b = "+b)
}
```

在Kotlin中每一行代码的结尾不需要用分号。运行上述代码，会按照预期正确输出a和b的值。


但如果对变量延迟赋值，即先声明后定义，Kotlin的自动推导机制就无法正常工作。这时需要显式地声明变量类型：

```kotlin
fun main() {
    val a:Int
    val b:String
    a=10
    b="Hello, world!!!"
    println("a = "+a)
    println("b = "+b)
}
```

显式声明变量类型后，Kotlin就不再推导变量类型。

细心看到，Kotlin中显式声明变量类型时，使用的是`Int`而非`int`，这表明Kotlin完全抛弃了Java中的基本数据类型，而全部使用对象数据类型。在Java中`int`是关键字，而在Kotlin中`Int`是一个类，有其方法和继承结构。

| Java基本数据类型 | Kotlin抽象数据类型 | 数据类型说明 |
| ---------------- | ------------------ | ------------ |
| int              | Int                | 整型         |
| long             | Long               | 长整型       |
| short            | Short              | 短整型       |
| float            | Float              | 单精度浮点型 |
| double           | Double             | 双精度浮点型 |
| boolean          | Boolean            | 布尔型       |
| char             | Char               | 字符型       |
| byte             | Byte               | 字节型       |

### 2.2 `var`还是`val`

```kotlin
fun main() {
    val a = 10
    a = a * 10
    println("a = " + a)
}
```

这段代码一定会报错：`Val cannot be reassigned`，即`val`类型变量不能被二次赋值。

在Java中，`final`关键字的作用类似于`val`，但如果在复杂项目中没有为不应修改的变量设置`final`关键字，那么后续开发中若不小心修改了此变量，可能会引起不可预知的后果。因此Kotlin在开发时，对变量的声明作出约束——必须由开发者主动明确是否可变。

何时使用`val`或`var`呢？通常建议所有变量都优先使用`val`声明，在后续需要修改变量时，再将其替换成`var`型。这是良好的编程习惯。

## 3. 函数

首先需要明确，函数英文为 function ，方法英文为 method ，但二者并无不同，只是不同语言的叫法习惯而已，Java常说方法，Kotlin常说函数。

函数是运行代码的载体，当运行这个函数时，其中所有代码都会运行。而`main()`函数是特殊的程序入口函数，程序始终从main()函数开始运行。

### 3.1 定义函数

在Kotlin中自定义函数语法规则如下：

```kotlin
fun functionName(param1: Typename, param2: Typename): Typename{
    return 0
}
```

fun 关键字用来定义函数。与Java不同的是，参数列表的括号后接了一个`: Typename，这表示函数将返回什么类型的数据，如果不返回数据则不必写。



尝试自定义一个函数：

```kotlin
import kotlin.math.max

fun lagerNum(a:Int, b:Int):Int{
    return max(a,b)
}
fun main() {
    val a=10
    val b=12
    val lagerOne:Int
    lagerOne = lagerNum(a,b)
    println("The lager num is "+lagerOne)
}
```

### 3.2 一个语法糖

当一个函数只有一行代码时，Kotlin允许不必编写函数体，而是将这行代码写在函数定义的尾部，中间用等号连接，如：

```kotlin
fun larerNum(a:Int, b:Int):Int = max(a,b)
```

并且，由于Kotlin的类型推导机制，还可以将返回值类型的声明简略。



## 4. 逻辑控制

程序的执行语句有三种——顺序语句、条件语句、循环语句。

### 4.1 if 条件语句

```kotlin
fun lagerNum(a:Int, b:Int):Int{
    var value = 0
    if (a > b){
        value = a
    } else {
        value = b
    }
    return value
}
```

可以看到，Kotlin中的 if 与Java中几乎完全一样，但有一个新的功能——允许有返回值：

```kotlin
fun lagerNum(a:Int, b:Int):Int{
    val value = if (a > b){
        a
    } else {
        b
    }
    return value
}
```

if 语句使用**每个条件的最后一行代码**作为返回值，并将返回值赋值给 value 变量。此时没有重新赋值的情况，因此 value 可以声明成`val`类型，这表明这种方法更安全。



这段代码还可以这样精简：

```kotlin
fun lagerNum(a:Int, b:Int):Int{
    return if (a > b){
        a
    } else {
        b
    }
}
```

甚至这样：

```kotlin
fun lagerNum(a:Int, b:Int) = if (a > b) a else b
```



### 4.2 when 条件语句

Kotlin中的 when 语句类似于Java中的 switch ，但功能更强大。

首先，Java中的 switch 语句的条件是受限的，只能是整型、字符串(JDK 1.7之后)变量；其次，switch 语句中每个 case 条件都要加上一个 break 语句，非常烦琐易错。

#### 4.2.1 when精确匹配

在用 when 之前，先用 if 语句实现一个查询考试成绩的功能——输入姓名输出成绩：

```kotlin
fun getScore(name: String) = if(name == "Tom"){
    86
} else if (name == "Jim"){
    77
} else if (name == "Jack"){
    95
} else if (name == "Lily"){
    100
} else {
    0
}
```

明显看到，这段代码中 if 、else if 太多了，看着非常臃冗，如果用 when 改写：

```kotlin
fun getScore(name: String) = when (name){
    "Tom" -> 86
    "Jim" -> 77
    "Jack" -> 95
    "Lily" -> 100
    else -> 0
}
```

美观极了！同样，when 也可以有返回值，因此也可以使用单行代码函数的语法糖。when 语句允许传入一个任一类型的参数，然后在 when 的结构体中定义一系列条件，格式是`匹配值 -> {执行逻辑}`，当执行逻辑只有一行代码时，可以去除大括号。

#### 4.2.2 when类型匹配

```kotlin
fun checkNum(num: Number){
    when(num){
        is Int -> println("number is Int.")
        is Double -> println("number is Double.")
        else -> println("number not support.")
    }
}
```

这就是类型匹配，is 关键字是其中的核心。is 相当于Java中的 instanceof 关键字，由于checkNum()函数接受一个Number类型的参数（一个Kotlin的内置抽象类，像Int、Double等与数字有关的类都是其子类），之后就可以判断传入的参数属于什么类型。

#### 4.2.3 无参数when语句

```kotlin
fun getScore(name: String) = when {
    name == "Tom" -> 86
    name == "Jim" -> 77
    name == "Jack" -> 95
    name == "Lily" -> 100
    else -> 0
}
```

这种用法不算常用，但胜在可扩展性高。假如现在需要将所有名字以“Tom”开头的人都赋值分数为86，这样修改即可：

```kotlin
fun getScore(name: String) = when {
    name.startsWith("Tom") -> 86
    name == "Jim" -> 77
    name == "Jack" -> 95
    name == "Lily" -> 100
    else -> 0
}
```

熟悉Java的读者可以发现，Kotlin中判断两个字符串是否相等，不必调用equals()方法，而是直接使用==符号即可，这个特点对于对象来说也可以使用。

### 4.3 循环语句

Kotlin同样提供 while 循环和 for 循环，其中 while 循环和Java完全相同，但 for 循环有较大改动。

Java中 for-i 循环被Kotlin完全舍弃，而 for-each 循环被修改成 for-in 循环并做了极大加强。

#### 4.3.1 `for-in`循环（升序）

首先，要了解Kotlin中表示区间的方法：

```kotlin
val range = 0..10
```

这段代码表示创建了一个[0, 10]的闭区间，其中`..`创建闭区间的关键字。

这时，就可以通过 for-in 循环来遍历一个区间：

```kotlin
fun main(){
    for (i in 0..10){
        println(i)
    }
}
```



但更符合经典编程语言习惯的区间是左闭右开，并且在数组中下标以0开始，一个长度为10的区间其下标为0到9：

```kotlin
val range = 0 until 10
```

使用`until`关键字，即可创建[0, 10)的一个区间。



默认情况下，Kotlin的 for-in 每次循环都是单步递增，如果需要指定跳过某些元素，可以使用`step`关键字：

```kotlin
fun main(){
    for (i in 0 until 10 step 2){
        println(i)
    }
}
```

这段代码就相当于Java的 for-i 循环中 i += 2的效果，这样区间内所有奇数位元素都被跳过了。

#### 4.3.2 降序循环

关键字`..`或`until`创建的区间是升序的，要求左端必须小于等于右端。而要实现降序区间，则需要使用`downTo`关键字：

```kotlin
fun main(){
    for (i in 10 downTo 1){
        println(i)
    }
}
```

`downTo`关键字创建的区间也是闭区间，也可以结合`step`使用。



for-in 循环还可以遍历数组和集合，后续会用到。

实际上，for-in 循环并不如 for-i 灵活，但比它更加方便简单、规范书写。如果有极少部分场景不能使用，可以换成while循环。

## 5. 面向对象

### 5.1 类与对象

首先创建一个Person类：

```kotlin
class Person {
    var name=""
    var age=0
    
    fun eat(){
        println(name + " is eating. He is " + age + "years old.")
    }
}
```



实例化这个类：

```kotlin
import Person

fun main() {
    val p = Person()
    p.name = "Tom"
    p.age = 21
    p.info()
}
```

与Java不同的是，Kotlin在实例化类时不需要`new`关键字。p 作为Person类的一个实例，称为对象，对象可以访问类中的属性和函数。

### 5.2 继承和构造函数

现在，我们定义一个Student类，其中添加sno和grade字段：

```kotlin
class Student {
    var sno = ""
    var grade = 0
}
```

Student类需要添加几个新的字段——name和age以及info()函数，这时就可以使其继承自Person类，子类会继承父类的所有允许继承的属性和函数。



但此时两个类还没有继承关系，需要做两件事——使Person类可以被继承、让Student类继承自Person类：

* Kotlin中默认每个非抽象类都是不可继承的，相当于Java中为类添加`final`关键字，原因与`val`关键字类似。如果一个类允许被继承的话，它不能确定子类会如何实现，这样就存在未知风险，*Effective Java*这本书明确提到，如果一个类不是专门为继承而设计的，那就应该添加`final`声明。

  因此，添加`open`关键字在Person类的声明之前，使其可以被继承；

* Java中继承的关键字是`extends`，而Kotlin中只需要 `class Student : Person()`。与Java中直接写父类名不同，Kotlin中父类名后还有一对()，这涉及到Kotlin的主构造函数和次构造函数。**接下来的内容要深刻理解！！**

  * 主构造函数，默认是不带参数不带函数体的，当然也可以显式地指明参数：

    ```kotlin
    class Student(val sno:String, val grade:Int) : Person(){}
    ```

    这样指定参数的构造函数，就会要求实例化Student类时传入所需的所有参数。

    

    如果想要在主构造函数中添加一些逻辑，需要调用 init 结构体：

    ```kotlin
    class Student(val sno:String, val grade:Int) : Person(){
        init {
            println("sno is "+sno)
            println("grade is "+grade)
        }
    }
    ```

    

    这与那对括号有什么关系呢？这涉及到Java继承特性中的一个规定——子类中的构造函数必须调用父类中的构造函数，Kotlin当然也要遵守。回头看Student类的主构造函数，默认情况下它是没有函数体的，我们也不必编写 init 结构体，那父类的构造函数要怎样实现呢？括号就在这里起作用。

    Kotlin通过括号来指定子类的主构造函数调用父类的哪个构造函数，`class Student(val sno:String, val grade:Int) : Person(){}`表示主构造函数在初始化时会调用Person类的无参构造函数。**如果Person类中没有无参构造函数，就需要在括号里指定参数以调用相应的父类的构造函数**。

  * 次构造函数，可以有多个，而主构造函数只能有一个。并且，次构造函数是有函数体的，Kotlin还要求如果一个类主构造函数和次构造函数都存在时，次构造函数必须要调用主构造函数：

    ```kotlin
    class Student(val sno:String, val grade:Int, name: String, age:Int) : Person(name, age){
        constructor(name: String, age: Int) : this("",0,name, age){}
    
        constructor() : this("",0){}
    }
    ```

    次构造函数通过`constructor`关键字来定义，上述代码定义了两个次构造函数，第一个接受 name 和 age 参数并通过`this`关键字调用主构造函数；第二个不接受任何参数并通过this关键字调用上一个次构造函数，也能将name和age参数成功赋初值，这表明间接调用主构造函数也是合法的。

    

    现在，就有了三种实例化Student类的方法：

    ```kotlin
    val student1 = Student()
    val student2 = Student("Tom",21)
    val student3 = Student("Jack",20,"abc",21)
    ```

    分别调用info()函数，可以得到这样的结果：

    ![](实例化.png)

    

    

    那次构造函数又与那个括号有什么关系呢？这是因为有可能类中只有次构造函数而没有显式定义主构造函数，Kotlin是允许这样的，并且因为存在次构造函数，这时该类是没有主构造函数的，那么继承时也就**不必加那个讨厌的括号**了：

    ```kotlin
    class Student : Person{
        constructor(name:String, age:Int):super(name, age){}
    }
    ```

    这时，次构造函数只能直接调用父类的构造函数，也就需要`super`关键字。

### 5.3 接口

Kotlin中的接口与Java几乎完全一致。

众所周知，Java是单继承结构的语言，任何类只能继承一个父类，但却可以实现任意多个接口。

我们可以在接口中定义一系列的抽象行为，然后交由具体的类实现——首先创建一个Study接口：

```kotlin
interface Study {
    fun readBooks()
    fun doHomework()
}
```

接下来就要在Student类中实现Study接口：

```kotlin
class Student(name: String, age: Int) : Person(name, age), Study {
    override fun doHomework() {
        println(name + " is reading.")
    }

    override fun readBooks() {
        println(name + " is doing homework.")
    }
}
```

Kotlin中统一用`:`实现继承父类和接口，中间用`,`进行分隔，另外接口不需要加()，因为没有构造函数可以调用。Kotlin中使用`override`关键字实现重写父类或接口中的函数。这样，就可以在main()函数中使用：

```kotlin
fun main() {
    val student2 = Student("Tom", 21)

    student2.info()
    doStudy(student2)
}

fun doStudy(study: Study) {
    study.readBooks()
    study.doHomework()
}
```

这段代码实现了面向接口编程——多态。首先，doStudy(student2)中直接传入的是Student类的对象，而在doStudy()函数的定义中其参数却是Study接口类型。这是因为Student类已经实现了Study接口，所以其对象是可以传递给doStudy()函数的。



Kotlin还增加了一个额外功能——允许对接口中定义的函数进行默认实现（Java中在JDK 1.8后也支持）：

```kotlin
interface Study {
    fun readBooks()
    fun doHomework() {
        println("do homework default implementation.")
    }
}
```

此时，doHomework()函数已经有了默认实现，当Student类再去实现Study接口时，只需要强制实现readBook()函数即不会报错。

### 5.4 权限修饰符

Java中有private、protected、public、default四种权限修饰符。

Kotlin中也有四种，分别是private、protected、public、internal，需要时在函数`fun`关键字前添加即可。

二者中，private权限都表示类内可见；public都表示所有类可见，但Kotlin中public是默认修饰符；protected在Java中表示对当前类、子类、同一包路径下的类可见，而Kotlin则表示对当前类和子类可见；default在Java中对同一包路径下的类可见，而Kotlin引入Internal权限，表示对同一模块中的类可见。

### 5.5 数据类

在一个规范的系统架构中，数据类通常占据重要的地位，它们用于将服务器端或数据库中的数据映射到内存中，为编程逻辑提供数据模型支持。而数据类通常需要重写equals()、hashCode()、toString()等方法。其中equals()方法用来判断两个数据类是否相等；hashCode()方法是equals()的配套方法，不重写的话会导致HashMap、HashSet等hash相关的系统类无法工作；toString()方法用于提供更清晰的输入日志，否则一个数据类默认打印出来的就是一行地址。

例如，在Java中创建一个手机数据类，只包含品牌和价格两个字段，若要实现这个数据类：

```java
public class Cellphone {
    String brand;
    double price;

    public Cellphone(String brand, double price) {
        this.brand = brand;
        this.price = price;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Cellphone) {
            Cellphone other = (Cellphone) obj;
            return other.brand.equals(brand) && other.price == price;
        }
        return false;
    }

    @Override
    public int hashCode() {
        return brand.hashCode() + (int) price;
    }

    @Override
    public String toString() {
        return "Cellphone(brand=" + brand + " , price=" + price + ")";
    }
}
```

事实上，上面代码多是没有实际逻辑的语法代码，只是让其拥有数据类的功能而已。若要在Kotlin中实现，只需要新建一个Kotlin类文件：

```kotlin
data class Cellphone (val brand:String, val price:Double)
```

是的，这样就完了。声明了`data`关键字，Kotlin就会根据主构造函数中的参数自动将equals()、hashCode()、toString()等固定且无实际逻辑意义的函数自动生成。



测试一下这个数据类：

```kotlin
fun main() {
    val cellphone1 = Cellphone("Vivo",3000.00)
    val cellphone2 = Cellphone("Huawei",3000.00)

    println(cellphone1)
    println("cellphone1 equals cellphone2? "+(cellphone1 == cellphone2))
}
```

运行结果是：

![](data.png)

### 5.6 单例类

单例类是Kotlin特有的功能。

单例模式是最常用、最基础的设计模式之一，可以用于避免创建重复的对象，比如希望某个类在全局最多拥有一个实例，就要用单例模式。Java中的实现是这样：

```java
public class Singleton {
    private static Singleton instance;
    
    private Singleton(){}
    
    public synchronized static Singleton getInstance(){
        if(instance==null){
            instance = new Singleton();
        }
        return instance;
    }

    public void singletonTest(){
        System.out.println("singletonTest is called.");
    }
}
```

这段代码首先为了禁止外部创建Singleton类的实例，将其构造方法私有化，然后给外部提供一个getInstance()静态方法用于获取Singleton的实例，而在getInstance()方法中判断当前缓存的Singleton实例是否为null，如果是，就创建一个新的实例，否则返回缓存的实例。

如果想要调用单例类中的方法，就这样写：

```java
Singleton singleton = Singleton.getInstance();
singleton.singletonTest();
```



Kotlin一如既往地简便高效，只需要创建Object类型的文件，以`object`关键字替换`class`即可：

```kotlin
object Singleton {
    fun singletonTest(){
        println("singletonTest is called.")
    }
}
```

调用起来也很简单：

```kotlin
Singleton.singletonTest（）
```

## 6. Lambda编程

Lambda是Kotlin的灵魂所在。这里先入门，后续进阶慢慢学习。

### 6.1 集合的创建与遍历

集合的函数式API是用来入门Lambda编程的绝佳示例。而传统意义上集合主要指List和Set，广义上还包括Map这样的键值对数据结构。List、Set、Map在Java中都是接口，List的主要实现类是ArrayList和LinkedList，Set的主要实现类是HashSet，Map的主要实现类是HashMap。

#### 6.1.1 List集合

现在，用Java创建一个包含许多种水果的集合，可以先创建一个ArrayList实例，再一个个添加水果名称到集合中。Kotlin当然也可以：

```kotlin
val list = ArrayList<String>()
list.add("apple")
list.add("banana")
list.add("cherry")
```

这样初始化集合非常烦琐，Kotlin有一个内置的`listOf()`来简化：

```kotlin
val list = listOf("apple", "banana", "cherry")
```

不过`listOf()`创建的集合只能读取，而不能再做修改（添加、修改、删除），这意味着它是一个不可变的集合。这当然与`val`变量、类默认不可继承的设计理念一脉相承，这体现了Kotlin在不可变性方面的严格控制，大大提高了代码的安全性。

若要创建可变集合，则使用`mutableListOf()`函数。



for-in循环也可以遍历集合：

```kotlin
fun main(){
    val list = listOf("apple", "banana", "cherry")
    for(fruit in list){
        println(fruit)
    }
}
```

#### 6.1.2 Set集合

而创建Set集合的方法和List集合几乎一样，除了要使用`setOf()`和`mutableSetOf()`。不过，Set集合中不可以存放重复元素。

#### 6.1.3 Map集合

Map集合是一种键值对形式的数据结构，传统的初始化方式是：

```kotlin
val map = hashMap<String, Int>()
map.put("apple", 1)
map.put("banana",2)
map.put("cherry",3)
```

事实上，Kotlin中不建议使用put()和get()方法来对Map进行读写操作，而是推荐类似于数据下标的结构：

```kotlin
val map = hashMap<String, Int>()
map["apple"]=1
map["banana"]=2
map["cherry"]=3
```

当然，这也不是最简便的写法。

```kotlin
val map = mapOf("apple" to 1, "banana" to 2, "cherry" to 3)
```

这里to并不是一个关键字，而是一个infix函数，这个函数会在后面学习到。当然，Kotlin也提供了mutableMapOf()函数。

遍历Map中的数据当然还是for-in循环：

```kotlin
fun main() {
    val map = mapOf("apple" to 1, "banana" to 2, "cherry" to 3)
    for ((fruit, number) in map){
        println("fruit is"+fruit+", number is "+number)
    }
}
```

其运行结果是：

![](map.png)

### 6.2 集合的函数式API

如果我们要在集合中查找名字最长的水果，该怎样？

```kotlin
val list = listOf("apple","banana","cherry","strawberry")
var maxLengthFruit = ""
for (fruit in list){
    if(fruit.length > maxLengthFruit.length){
        maxLengthFruit = fruit
    }
}
println("The longest fruit name is"+maxLengthFruit)
```

这段代码简洁而清晰，但如果使用集合的函数式API，实现该功能会更容易：

```kotlin
val list = listOf("apple","banana","cherry","strawberry")
var maxLengthFruit = list.maxBy{it.length}
println("The longest fruit name is"+maxLengthFruit)
```



Lambda的简单定义：一段可以作为参数传递的代码。其语法结构是：

```kotlin
{参数名1:参数类型， 参数名2:参数类型 -> 函数体}
```

首先最外层一对大括号；如果有参数传入到Lambda表达式中，就需要声明参数列表，参数列表的结尾使用一个->符号，表示参数列表的结束和函数体的开始；函数体中可以编写任意行数的代码（虽然建议少一些），并且最后一行代码会自动作为Lambda表达式的返回值。



回到刚才找出水果名最长的需求，maxBy()接受的就是一个Lambda类型的参数，并且会在遍历集合时将每次遍历的值作为为参数传递给Lambda表达式，而maxBy()函数的工作原理是根据传入的条件来遍历集合，从而找到该条件下的最大值。套用Lambda表达式的格式，原代码可以被这样改写：

```kotlin
val list = listOf("apple","banana","cherry","strawberry")
val lambda = {fruit:String -> fruit.length}
var maxLengthFruit = list.maxBy(lambda)
println("The longest fruit name is"+maxLengthFruit)
```

即maxBy()只是接受一个Lambda类型的参数而已。接下来对这个代码一步步简化：

```kotlin
var maxLengthFruit = list.maxBy({fruit:String -> fruit.length})
```

又根据Kotlin的规定，Lambda参数是函数的最后一个参数时，可以将Lambda表达式移到函数括号的外面：

```kotlin
var maxLengthFruit = list.maxBy(){fruit:String -> fruit.length}
```

如果Lambda参数是函数的唯一一个参数的话，可以将函数的括号省略：

```kotlin
var maxLengthFruit = list.maxBy{fruit:String -> fruit.length}
```

由于Kotlin的推导机制，我们不必指定fruit的参数类型：

```kotlin
var maxLengthFruit = list.maxBy{fruit -> fruit.length}
```

最后，Lambda表达式的参数列表只有一个参数时，也不必声明参数名，而是可以使用`it`关键字代替：

```kotlin
var maxLengthFruit = list.maxBy{it.length}
```



扩展一下其他常用的函数式API：

```kotlin
fun main(){
    val list = listOf("apple","banana","cherry","strawberry")
    val newList = list.map{it.toUpperCase()}
    for(fruit in newList){
        println(fruit)
    }
}
```

map()函数用于将集合中的每个元素都映射成一个另外的值，其映射规则在Lambda表达式中指定，最终生成一个新的集合。

![](map_api.png)



```kotlin
fun main(){
    val list = listOf("apple","banana","cherry","strawberry")
    val newList = list.filter{it.length <= 5}
    			    .map{it.toUpperCase()}
    for(fruit in newList){
        println(fruit)
    }
}
```

filter()函数用于过滤集合中的数据。上述代码中同时使用了filter和map，并且注意要先过滤，这样可以避免不必要的映射。



```kotlin
fun main(){
    val list = listOf("apple","banana","cherry","strawberry")
    val anyResult = list.any{it.length <=6}
    val allResult = list.all{it.length <=6}
    
    println("anyResult is "+anyResult+" , allResult is "+allResult)
}
```

any()用于判断集合中是否至少存在一个元素满足判断条件，而all()则判断集合是否全都满足判断条件。运行结果是：

![](any.png)

### 6.3 Java函数式API的使用

前面所学是Kotlin的函数式API，而在Kotlin中调用Java方法时也可以使用函数式API，只要该Java方法接收一个Java单抽象方法接口参数。Java单抽象方法接口指的是接口中只有一个待实现方法，如果有多个待实现方法，就无法使用函数式API。

```java
public interface Runnable{
    void run();
}
```

这是Java最常见的单抽象方法接口——Runnable。对于Java的任何一个方法，只要它接收Runnable参数，就可以使用函数式API。由于Runnable接口主要是结合线程一起使用的，这里通过Java的线程类Thread来学习：

```java
new Thread(new Runnable(){
    @Override
    public void run(){
        System.out.println("Thread is running.");
    }
}).start();
```

这里创建了一个Runnable接口的匿名类实例，并将它传给了Thread类的构造方法，最后调用Thread类的start()方法执行线程。



如果将这段代码直接翻译成Kotlin语言：

```kotlin
Thread(object:Runnable{
    override fun run(){
        println("Thread is running.")
    }
}).start()
```

由于Kotlin完全舍弃了`new`关键字，因此创建匿名类实例时改用了`object`关键字。但这种写法并没有发挥出Kotlin的简洁性：

```kotlin
Thread(Runnable {
    println("Thread is running.")
}).start()
```

由于Thread类的构造方法符合Java函数式API的使用条件，这样简化使得即使没有显式地指定重写run()方法，Kotlin也能自动解析Runnable后面的Lambda表达式就是run()方法重写的内容。

如果一个Java方法的参数列表中有且仅有一个Java单抽象方法接口参数，我们可以将接口名省略：

```kotlin
Thread({
    println("Thread is running.")
}).start()
```

接下来，还可以进行Lambda表达式的简化：

```kotlin
Thread{
    println("Thread is running.")
}.start()
```



## 7. 空指针检查

经统计，Android系统上崩溃率最高的异常类型就是空指针异常(NullPointerException)，其主要原因是由于空指针是一种不受编程语言检查的运行时异常，只能通过程序员的主动逻辑判断，这在大型项目中是非常不可靠的。

```java
public void doStudy(Study study){
    study.readBooks();
    study.doHomework();
}
```

这段代码安全吗？并不，因为当传入一个null参数，就会发生空指针异常，因此最稳妥的办法是加一个判空处理：

```java
public void doStudy(Study study){
    if(study != null){
        study.readBooks();
        study.doHomework();
    }
}
```

这样不论传入什么参数，都会是安全的。可见，即使这么简单的一串代码，都可能会空指针异常，所以这个问题非常严重。

### 7.1 可空类型系统

Kotlin非常科学地解决了这个问题，它利用编译时判空检查的机制来杜绝空指针异常。

```kotlin
fun doStudy(study:Study){
    study.readBooks()
    study.doHomework()
}
```

Kotlin默认所有参数和变量都不可为空，如果试图向doStudy()传入一个null参数，会得到报错`Null can not be a value of a non-null type Study`。



那如果需要将某个参数或变量为空呢？这就需要Kotlin的可为空类型系统，即在类的后面加一个`?` ，表示可为空的类：

```kotlin
fun doStudy(study:Study?){
    study.readBooks()
    study.doHomework()
}
```

光这样还不行，此时调用参数的两个方法都可能会出现空指针异常，Kotlin不会允许它们通过编译，这就需要添加判空处理：

```kotlin
fun main(){
    doStudy(null)
}
fun doStudy(study:Study?){
    if (study != null) {
        study.readBooks()
        study.doHomework()
    }
}
```

可是，这样代码又变臃肿得和Java一样了，而且 if 判断语句还处理不了全局变量的判空问题，这就需要Kotlin的辅助工具。

### 7.2 判空辅助工具

首先，`?.`操作符，当对象不为空时调用相应的函数，当对象为空时则什么都不做：

```kotlin
if (a != null){
    a.doSomething()
}
//简化后
a?.doSomething()
```

优化后的doStudy()代码是：

```kotlin
fun doStudy(study:Study?){
    study?.readBooks()
    study?.doHomework()
}
```



接着，`?:`操作符，左右两边都接受一个表达式，如果左边表达式的结果不为空就返回左边表达式的结果，否则就返回右边的结果：

```kotlin
val c = if (a != null){
    a
}else{
    b
}
//简化后
val c = a?:b
```

来看个实例，编写一个函数来获得一段文本的长度：

```kotlin
fun getTextLength(test:String?):Int{
    if(text != null){
        return text.length
    }
    return 0
}
//简化后
fun getTextLength(text:String?) = text?.length ?: 0
```



不过有时Kotlin的空指针检查机制也不那么智能，将我们从逻辑上已经处理的空指针异常仍然不许编译：

```kotlin
var content:String? = "hello"

fun main(){
    if(content!=null){
        printUpperCase()
    }
}
fun printUpperCase(){
    val upperCase = content.toUpperCase()
    println(upperCase)
}
```

虽然这段代码逻辑上已经避免了空指针异常，但printUpperCase()函数并不知道外部已经对content进行了非空检查，这时调用toUpperCase()函数时还会认为这里存在空指针风险。

如果想要强行通过编译，可以使用非空断言工具：

```kotlin
fun printUpperCase(){
    val upperCase = content!!.toUpperCase()
    println(upperCase)
}
```

但这是有风险的，毕竟人的判断总会出现错误，尤其是在大型逻辑中。

### 7.3 `let`函数

`let`函数是另一种辅助工具，提供了函数式API的编程接口，并将原始调用对象作为参数传递到Lambda表达式中：

```kotlin
obj.let { obj2 ->
	//编写具体逻辑        
}
```

这里调用了obj对象的let函数，然后Lambda表达式中的代码立即执行，并且这个obj对象还会作为参数传递到Lambda表达式中。（obj2和obj是同一对象，只是为了避免变量重名）

let()函数的特性配合`?.`操作符可以方便地检查空指针：

```kotlin
fun doStudy(study:Study?){
    study?.readBooks()
    study?.doHomework()
}
//实际上，上面代码与下面的没有区别，只是由于?. 操作符简化了一定的书写量，但实际上执行效率反而低了，因为if判空本可以只执行一次
fun doStudy(study:Study?){
    if(study != null){
        study.readBooks()
    }
    if(study != null){
        study.doHomework()
    }
}

//这就需要结合使用let和?.
fun doStudy(study:Study){
    study?.let{ stu ->
        stu.readBooks()
        stu.doHomework()
    }
}
```

最后一段代码，`?.`操作符表示对象为null时什么都不做，对象不为空时就调用let函数将study对象本身作为参数传递到Lambda表达式中，此时study一定不为空，就能放心调用它的任意方法。

另外，由于Lambda表达式的语法特性，当Lambda表达式的参数列表中只有一个参数时，可以不必声明参数名，而直接用it关键字来代替：

```kotlin
fun doStudy(study:Study){
    study?.let{
        it.readBooks()
        it.doHomework()
    }
}
```



最后，let函数是可以处理全局变量的判空问题的。比如，若将doStudy()的参数设置成一个全局变量，此时使用let函数仍然正常，而if判空则会报错。因为全局变量的值随时有可能被其他线程所修改，即使做了判空处理，仍然无法保证if语句中的变量没有空指针风险。

## 8. 奇技淫巧

### 8.1 字符串内嵌表达式

直到今天，这个重要的功能Java都还不支持。而在Kotlin中，可以直接将表达式写在字符串里面，即使构建非常复杂的字符串。

Kotlin中字符串内嵌表达式的语法规则：

```kotlin
"hello, ${obj.name}. Nice to meet you!"
```

这里，Kotlin允许在字符串中嵌入${}这种语法结构的表达式，并在运行时使用表达式执行的结果替代这一部分的内容。如果表达式中只有一个变量，则可以省略两边的大括号。

举个例子，Java中toString()方法使用了烦琐的拼接字符串的方法：

```java
String brand = "Vivo";
double price = 3000.00;

public String toString() {
        return "Cellphone(brand=" + brand + " , price=" + price + ")";
    }
```

这种写法在读写时都非常不友好，很容易写错。而字符串内嵌表达式简便很多：

```kotlin
val brand = "Vivo"
val price = 3000.00
println("Cellphone(brand=$brand,price=$price)")
```

***So, java, fxxk you!*** :middle_finger:

### 8.2 函数的参数默认值

Kotlin提供了为函数设定参数默认值的功能，这很大程度上能替代次构造函数的作用。

```kotlin
fun printParams(num:Int, str:String="hello"){
    println("num is $num, str is $str")
}

fun main(){
    printParams(123)
}
```

运行结果是：

![](param.png)

有一个问题是，如果是num参数被赋了默认值，那么只传一个字符串参数会匹配给num而不是str，从而产生类型不匹配的错误。这时除了书写完全的参数列表，还可以使用Kotlin的键值对匹配机制来传递参数：

```kotlin
fun printParams(num:Int=100, str:String){
    println("num is $num, str is $str")
}

fun main(){
    printParams(str = "world")
}
```



那么，为什么说为函数的参数赋默认值可以很大程度上替代次构造函数的作用呢？

```kotlin
class Student(val sno:String, val grade:Int, name: String, age:Int) : Person(name, age){
    constructor(name: String, age: Int) : this("",0,name, age){}

    constructor() : this("",0){}
}
```

上面代码中有一个主构造函数、两个次构造函数。次构造函数的作用是使用更少的参数来对Student类进行实例化，无参次构造函数会调用两个参数的次构造函数，并将这两个参数赋值成初始值，然后两个参数的次构造函数调用四个参数的主构造函数，并将缺失的两个参数也赋值成初始值。

这样写在Kotlin中是不必要的，完全可以只通过一个主构造函数并赋默认值来实现：

```kotlin
class Student(val sno:String="", val grade:Int=0, name:String="", age:Int=0):Person(name,age){}
```









