---
image-auto-upload: false
---

## 关于 C++ 的基本概念
### 语言类型
1. C++和Java 都是静态类型的面向对象的编程语言。（✅）
>[! note] 什么是静态、动态类型语言？
>- 动态类型语言是指在运行期间才去做数据类型检查的语言，也就是说，在用动态类型的语言编程时，永远也不用给任何变量指定数据类型，该语言会在你第一次赋值给变量时，在内部将数据类型记录下来。典型语言有：Python、JavaScript
>
>- 静态类型语言与动态类型语言刚好相反，它的数据类型是在编译其间检查的，也就是说在写程序时要声明所有变量的数据类型，C/C++是静态类型语言的典型代表，其他的静态类型语言还有 C#、JAVA 等。

## 变量
### 标识符
1. 标识符命名规则
>[! done] 作为变量名的标识符命名规则
>1. 第一个字符必须是字母或下划线，除此外可以由字符、数字、下划线组成；
>2. 不能是关键词；

### 修饰符
1. 判断下列变量修饰符的含义：
- `extern`：外部变量，可供所有源文件使用；
- `register`：寄存器变量，放在寄存器而非内存中，效率更高，一般是临时变量；
- `auto`：自动变量，所有未加 static 关键字的都默认是 auto 变量，也就是我们普通的变量
- `static`：静态变量，在内存中只存在一个，可供当前源文件的所有函数使用

### 指针
#### 指针 `this` 的使用
1. 判断下列代码中，四个函数哪个具有隐含 `this` 指针（）
```cpp
int f1();
class T{
	public:    static int f2();
	private:   friend int f3();
	protected: int f4();
};
```

答案是 `f4()`。[[11-Class(II)#The keyword `this`|this pointer]]

>[! note] `this` 指针什么时候会隐含？
>只有类的非静态成员函数才有 `this` 指针，友元、静态函数以及全局函数都没有 this 指针。
>- 静态成员函数属于整个类所有，没有 this 指针；
>- 友元函数不是这个类的成员，没有指针；

#### 常量指针与常指针

>[! note] 口诀——“左常值，右常向”
>1. `const char* p;` - 这是一个指向常量字符的指针。在这种情况下，`p` 是一个指针，指向的字符是不可修改的，也就是说，不能通过 `p` 来修改所指向的字符。但是指针 `p` 本身的值可以修改，也就是可以让 `p` 指向不同的常量字符。
>2. `char* const p;` - 这是一个常量指针。在这种情况下，`p` 是一个指针，指向的字符是可修改的，可以通过 `p` 来修改所指向的字符。但是指针 `p` 本身的值是不可修改的，一旦初始化后，不能让 `p` 指向其他地方。

#### 指针空间大小
1. 判断：在 64 位机上，`char *p= "abcdefghijk";` sizeof (p)大小为 12. (❌)

>[! note] 指针大小与指针所指空间大小无关
>这里将一个字符串字面量赋值给指针 p。在64位机器上，指针的大小仍然是 8 字节（64 位），不管它指向的是什么类型的数据。字符串字面量是以 null 终止的字符数组，该数组的大小是 12（包括终止的 null 字符）。所以 `sizeof(p)` 返回的是指针的大小，而不是所指向的数据大小，因此是 8。

#### 多重指针
1. 判断以下程序的输出：
```cpp
#include <stdio.h>
void fun(char **p) {
    int i;
    for (i = 0; i < 4; i++)
        printf("%s", p[i]);
}
main() {
    char *s[6] = {"ABCD", "EFGH", "IJKL", "MNOP", "QRST", "UVWX"};
    fun(s);
    printf("\n");
}
```

**ANSWER**：ABCDEFGHIJKLMNOP

`char *s[6]={ "ABCD", "EFGH", "IJKL", "MNOP", "QRST", "UVWX" };`
以上语句定义了一个指针数组 `s`。首先这是一个数组，这个数组里存储的是指针，也就是说`s[1], s[2] ...`等存储的都是指针，类型是 `char*`。

而数组名是指向第一个元素的常量指针，因此 `s` 是指向指针的指针，所以函数 `fun` 的形参定义是 `char **`。

`fun(s)` 将指针 `s` 的值传递给形参 `p`，所以 `p = s`，因此`for(i=0;i<4;i + + )printf("% s",p[i]);`中 `printf("% s",p[i])` 等价于 `printf("% s",s[i])`。

注意，虽然 `s[i]` 中存储的不是字符串，而是 `char *` 类型的指针，但是 `printf` 还是会输出 `s[i]` 存储的指针指向的字符串。所以最后输出为 D。


#### 指针杂谈
1. 判断以下说法正误：
- 即使不进行强制类型转换，在进行指针赋值运算时，指针变量的基类型也可以不同 ❌
- 如果企图通过一个空指针来访问一个存储单元，将会得到一个出错信息 ✅
- 设变量 p 是一个指针变量，则语句 `p=0;` 是非法的，应该使用 `p=NULL;` ❌
- 指针变量之间不能用关系运算符进行比较 ❌

1️⃣描述不正确，指针变量的赋值只能赋予地址，绝不能赋予任何其它数据，否则将引起错误；
3️⃣中， `p=NULL;` 和 `p=0;` 、`p='\0'` 是等价的；
4️⃣中，指向同一数组的两指针变量进行关系运算可表示它们所值数组元素之间的关系。

#### 指针数组与数组指针
1. 判断以下定义的含义：
A `int (*p)[5]`：p 指针，指向容量为 5 的数组的开头；
B `int *p[5]`：p 数组，容量为 5，元素是整型指针；
C `(int*)p[5]`：强制类型转换
D `int *p[]`：错误定义，Definition of variable with array type needs an explicit size or an initializer。

>[! note] 区分 `int *p[n]` 和 ` int (*p)[n]` 的关键
>在于运算符的优先级，`[]` 是优先于 `*` 的。
>- `int *p[n];` 中，运算符 `[]` 优先级高，先与 p 结合成为一个数组，再由 `int*` 说明这是一个整型指针数组。  
>
>- `int (*p)[n];` 中 `()` 优先级高，首先说明 p 是一个指针，指向一个整型的一维数组。  
  

### 位域 (`bit field`)
1. 在 32 位机上，有一个结构体如下，请计算 sizeof (A)的结果。
```
Struct A{ 
	Char t : 4;
	Char k : 4; 
	Unsigned short i : 8; 
	Unsigned long m;
};
```

>[! note]
>在 32 位机上，结构体 A 的 sizeof (A)结果将是 8 字节。
>在结构体 A 中，变量后的 `:` 用来定义位字段（Bit Field），它允许将变量的特定位数用于表示特定的值。
>
>逐步解释计算过程：
>1. `char t : 4;`：这表示变量 t 将占用 4 个位。在 32 位机上，char 类型默认占用 1 字节（8 位），但由于我们指定了 `: 4`，因此 t 将只占用4位。
>2. `char k : 4;`：同样，变量 k 也占用 4个位。
>3. `unsigned short i : 8;`：这表示变量 i 将占用 8 个位，即 1字节。
>4. `unsigned long m;`：这是一个无修饰符的无符号长整型，它在 32 位机上占用 4 字节（32 位）。
> 
>综上所述，将结构体 A 的成员逐个分析并计算其占用空间：
>- 变量 t 占用 4 位，即半个字节；
>- 变量 k 占用 4 位，即半个字节；
>- 变量 i 占用 1字节；
>- 变量 m 占用 4字节。
>
>将这些成员的占用空间直接相加：0.5 字节 + 0.5 字节 + 1 字节 + 4 字节 = 6 字节。
>然而，在 32 位机上，结构体的大小会按照最大基本类型成员的大小进行对齐。因此，在这种情况下，结构体 A 中 t、k、i 总共 2 字节，会被向上取整到 4 字节，以保持与 m 的对齐。
>
>因此，sizeof(A)的结果为8字节。

>[! note] 补充：内存对齐的三个规则
>1. 对于结构体的各个成员，第一个成员的偏移量是 0，排列在后面的成员其当前偏移量必须是当前成员类型的整数倍
>2. 结构体内所有数据成员各自内存对齐后，结构体本身还要进行一次内存对齐，保证整个结构体占用内存大小是结构体内最大数据成员的最小整数倍
>3. 如程序中有#pragma pack(n)预编译指令，则所有成员对齐以n字节为准(即偏移量是n的整数倍)，不再考虑当前类型以及最大结构体内类型

2. 趁热打铁，另一个关于对齐的问题：判断下面语句中 sz 变量的值
```cpp
struct _THUNDER {
	int iVersion;
	char cTag;
	char cAdv;
	int iUser;
	char cEnd;
} Nowcoder;
int sz = sizeof(Nowcoder);
```

答案是：16

![[struct-memory-occupy.png]]

### 字符串
1. 为了将变量 `char buf[]="SH_600570_"` 修改为 `"SH__600570"`，可以使用如下哪些函数语句？
A. `strcpy(buf+3,buf+2);`    ✅
B. `strncpy(buf+3,buf+2,7);` ✅
C. `memcpy(buf+3,buf+2,7);`  ❌

>[! note] 字符串拷贝函数及内存拷贝函数浅析
>- strcpy 是拷贝字符串，在拷贝结束的时候会为字符串添加一个'\0';  
>- strncpy 是拷贝字符，不会再字符串末尾添加'\0'，只按给出的字符个数来拷贝，拷贝完 n 个字符就结束。但是，如果 n 比 src 的长度大，那么空余的部分会被'\0'填充，以保证拷贝 n 个字符。  
>- strcpy 和 strncpy 都只能接受 char*，也就是字符类型的数据，如果是结构体，没办法操作。而且，这两个函数如果遇到 dest 和 src 的内存重叠会导致程序崩溃。  
>- memcpy 是内存拷贝，可以接受数组，整型，结构体，类等任何类型，它实现的是内存的拷贝。  
>- memmove 可以避免内存区域重叠问题。如果出现重叠，则采用反向复制，从后向前复制字符串，如果不重叠，则正向复制，从前向后复制。

### volatile 关键字
1. 判断下列关于 volatile 关键字的说法的正误。

A. 当读取一个非 volatile 修饰的变量时，为提高存取速度，编译器优化时有时会先把变量读取到一个寄存器中；以后再取变量值时，就直接从寄存器中取值 ❌
B. 优化器在用到 volatile 变量时必须每次都小心地重新读取这个变量的值，而不是使用保存在寄存器里的备份 ✅
C. volatile 适用于多线程应用中被几个任务共享的变量 ✅
D. 一个参数不可以既是 const 又是 volatile ❌

>[! note] 关于 volatile
> - volatile 用来声明那些可能在你的程序本身不知道的情况下会发生改变的变量。 
> - 一个定义为 volatile 的变量是说这变量可能会被意想不到地改变，这样，编译器就不会去假设这个变量的值了。精确地说就是，优化器在用到这个变量时必须每次都小心地重新读取这个变量的值，而不是使用保存在寄存器里的备份。
> - 对于一般变量：为提高存取速度，编译器优化时有时会先把变量读取到一个寄存器中。以后再取变量值时，就直接从寄存器中取值。
> - 一个参数既可以是const也可以是volatile：一个例子是只读的状态寄存器。它是volatile因为它可能被意想不到地改变。它是const因为程序不应该试图去修改它。（简单点就是该程序代码不能试图去修改它，但不排除硬件方面修改了它，我们每次都得重新读取它的值。） 

2. 并发编程中通常会遇到三个问题：原子性问题，可见性问题，有序性问题， java/C/C++中 volatile 关键字可以保证并发编程中的（B）

A. 原子性，可见性
B. 可见性，有序性 ✅
C. 原子性，有序性
D. 原子性，可见性，有序性

![[关于原子性、可见性、有序性的分析#总结]]

### 结构体
1. 初始化判断正误：
```cpp
struct Property{
    char name[20];
    char value[40];
} p1={"name","Zhangsan"}, p2={"age"}, p3={,"b1ue"}, p4=p1;
```
✅: `p1` `p2` `p4` 
❌: `p3` 

>[! note] 结构体第一个成员不可缺省
>在 C++中，结构体（struct）的第一个成员不能缺省（即不能省略成员的名称），而普通类（class）的第一个成员可以缺省。
>这是由于历史原因和 C++语法的设计决策造成的。在早期的 C 语言中，结构体的定义没有像现代 C++那样成为一个独立的语法结构，而是类似于"数据声明"的一种形式。例如：
>```c
>struct Point {
>int x; // 第一个成员
>int y; // 第二个成员
>};
>```
>
>因为早期的结构体没有像类那样的成员函数和访问控制等特性，所以对结构体的定义没有对成员进行特别的处理。在这样的设计下，结构体的成员在内存中是按照声明顺序排列的，第一个成员在结构体的最开始位置，没有额外的信息来标记成员的名称或类型。
>
>而在后来的 C++语言中引入了类的概念，结构体和类的语法开始逐渐融合。为了保持向后兼容性，C++保留了早期结构体的特性：结构体的第一个成员不能缺省。而对于普通类，C++则引入了更为灵活的语法规则，允许成员的声明顺序不必按照定义顺序排列。

### 数组
1. `char *str[3]={}` 和 `char (*str)[3] = {}` 有什么区别？

- `char *str[3] = {}`:
   This is an array of pointers to characters. It is an array with 3 elements, and each element is a pointer to a character (i.e., a C-style string). When you initialize it with `{}`, it sets all the pointers to nullptr (i.e., the pointers are pointing to nothing initially).

   ```
   +---+      +---+---+---+
   |   | ---> |   |   |   |
   +---+      +---+---+---+
   |   | ---> |   |   |   |
   +---+      +---+---+---+
   |   | ---> |   |   |   |
   +---+      +---+---+---+
   str[0]     str[1]  str[2]
   ```

- `char (*str)[3] = {}`:
   This is a pointer to an array of characters with a fixed size of 3. When you initialize it with `{}`, it sets the pointer to nullptr (i.e., it is pointing to nothing initially).

   ```
   +---+
   |   |
   +---+
   str
   ```

In summary, the main difference lies in the types and the memory layout they represent:

- `char *str[3]` is an array of 3 pointers to characters (3 C-style strings).
- `char (*str)[3]` is a pointer to an array of characters with a fixed size of 3 (like a 2 D array with 1 row and 3 columns).

Here's a small example to demonstrate the usage of each:

```cpp
#include <iostream>

int main() {
    // char *str[3]
    char *strings[3] = { "Hello", "World", "Cpp" };
    for (int i = 0; i < 3; ++i) {
        std::cout << strings[i] << std::endl;
    }

    // char (*str)[3]
    char chars[3] = { 'a', 'b', 'c' };
    char (*ptr)[3] = &chars;
    for (int i = 0; i < 3; ++i) {
        std::cout << (*ptr)[i] << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

Output:
```
Hello
World
Cpp
a b c
```

**趁热打铁一道练习题：**
```C++
#include <stdio.h>
int main()
{
    char *str[3] ={"stra", "strb", "strc"};
    char *p =str[0];
    int i = 0;
    while(i < 3)
    {
        printf("%s ",p++);
        i++;
    }
    return 0;
}
```
这段代码的输出是：
- stra strb strc (❌)
- s t r          (❌)
- stra tra ra    (✅)
- s s s          (❌)

1. p 是 `char*` 类型，每次++，后移一位（char）字符，而不是数组元素，因为 str 数组本质是一个元素为字符指针的数组，可以理解为指针的指针，因此要使用双重解引用才可以；
2. `char *p=str[0]` 相当于 `char *p="stra"`，p 被赋值为指向字符串 `stra` 的首字符的指针，即指向 s，p++后，指向 t，然后 printf 输出遇到空字符停止；
3. `char **p=str` 才是指向数组中字符串元素整体的含义，参考如下测试：
```
char** p = str；     
while(i < 3)
    {
        printf("%s ", *p);
        p++；
        i++;
    }
```
输出结果：stra strb strc。

```
// 输出结果stra strb strc
while(i < 3)
    {
        printf("%s ", *p++);
        //由于后缀运算符的顺序大于*运算符，因此先进行p++，再解引用，但是由于是后缀运算符，因此先*p，p再++。（等价于：*p（++））
        i++;
    }
```

```
// 输出结果为：stra tra ra
while(i < 3)
    {
        printf("%s ", （*p）++);
        //*p先解引用为str[0]，++后移一位，因此与本题结果一致。
        i++;
    } 
```

2. 判断：使用变量定义数组时，不能在定义时初始化，只能是声明（✅）
```cpp
int n=10;
char a[n]; // It's right.
char a[n]="hello"; // It's false, the error info is: `Variable-sized object may not be initialized`
```

第二行只是声明了数组 a，即在程序中引入了一个变量名而不分配内存以及对变量进行初始化。这是由于传入的参数 n 是一个变量（即使它已经被赋值，但仍可能由于某些操作而改变），因此并不能在此为其分配内存空间。

In C++, variable-length arrays (VLA) are not allowed. Variable-length arrays are those where the size of the array is determined at runtime rather than compile-time. This feature is available in some other programming languages, but it is not a standard feature in C++.

In the example, the second line `char a[n];` is not standard C++ but is allowed as a compiler extension in some C++ compilers. This is called a Variable-Length Array (VLA) extension, which is not part of the official C++ standard.

However, the third line `char a[n]="hello";` is not allowed in standard C++ or with VLA extensions. In C++, when you define an array, you can either omit the size (in which case the size is inferred from the initializer) or provide a constant size. The size must be known at compile-time.

3. 计算下列代码的结果
```cpp
#include<stdio.h>
main() { 
    int a[5] = {1, 2, 3, 4, 5}; 
    int *ptr = (int *)(&a + 1); 
    printf("%d,%d", *(a + 1), *(ptr - 1)); 
}
```

**ANSWER**: 2, 4

![[Pasted image 20230727194242.png]]

>[! note] 对数组使用取地址符会发生什么？
>对数组使用取地址符 (&)会得到整个数组的地址。
>
>举个例子:
>```cpp
>int arr[5] = {1, 2, 3, 4, 5}; 
>int* ptr = &arr; // ptr 指向整个 arr 数组
>```
>数组的数组名 arr 本质上就是指向数组首元素的指针常量, 不能被改变。
>
>使用&arr 会取得整个数组的地址, 赋值给指针 ptr。
>此时 ptr 指向了整个数组, 它可以当作指向数组首元素的指针来使用, 比如:
>```cpp
>cout << ptr[0] << endl; // 输出数组第一个元素 
>cout << *ptr << endl;  // 也是输出数组第一个元素
>```
>但我们不能通过 ptr 来改变数组的地址或数组名 arr 的值。
>所以对数组名取地址, 会得到整个数组的起始地址, 这个地址被赋值给指针后, 可以通过该指针访问数组元素。

4. 判断下列字符数组声明的正误：
A. `char szData[3] = “ab”`   ✅
B. `char szData[2] = “ab”`   ❌
C. `char szData[] = “abc”`   ✅
D. `char szData[] = {“abc”}` ✅

这是因为用数组定义字符串，会在末尾隐含一个 `'\0'` 字符，B 中产生了数组越界。

#### 多维数组
1. 下列二维数组定义是否正确？
- `int a[2][]={{1,0,1},{5,2,3}};` ❌
- `int a[][3]={{1,2,3},{4,5,6}};` ✅
- `int a[2][4]={{1,2,3},{4,5},{6}};` ❌
- `int a[][3]={(1,0,1)(),(1,1)};` ❌

>[! note] 多维数组初始化
>- 二维数组的行数可以推导出来，但列数不行，所以第二维需要显式指定；

### 共用体 union
1. 下列关于联合的描述中，错误的是？

A. 联合变量定义时不可初始化 ❌
B. 联合的成员是共址的       ✅
C. 联合的成员在某一个时刻只有当前的是有效的 ✅
D. 联合变量占有的内存空间是该联合变量中占有最大内存空间的成员在内存对齐时所需的存储空间   ✅

>[!note] 结构体与共用体
- 结构和联合都是由多个不同的数据类型成员组成, 但在任何同一时刻, 联合中只存放了一个被选中的成员（所有成员共用一块地址空间）, 而结构的所有成员都存在（不同成员的存放地址不同）。
- 对于联合的不同成员赋值, 将会对其它成员重写, 原来成员的值就不存在了, 而对于结构的不同成员赋值是互不影响的。

## 运算
### 溢出相关
1. 思考如下代码，判断结果是否正确？
```cpp
void swap_int(int *a, int *b){
  *a = *a + *b;
  *b = *a - *b;
  *a = *a - *b;
}
 
int m = 2112340000, n = 2100001234;
swap_int(&m, &n);
```

**ANSWER**：结果正确，即使会溢出。

**正经解答**：🥇
设整形变量 `*a`、`*b` 的位表示为
$*a = n_{31}n_{30} ··· n_0$
$*b = m_{31}m_{30} ··· m_0$

只有当 `*a > 0 && *b > 0` 或 `*a < 0 && *b < 0` 时才会发生溢出。两者类似，只证明均大于0时的情况。必须扩展额外一位才能够容纳正确的结果，`|` 左边为扩展位。

$*a = 0|0n30 ··· n0 = n30*230 +  n29*229 + ··· + n0*20 = N$
$*b = 0|0m30 ··· m0 = m30*230 +  m29*229 + ··· + m0*20 = M$

若和溢出，则33位表示必为

$*a + *b = 0|1b30 ··· b0 = -231 + b30*230 +  b29*229 + ··· + b0*20 =  **2** **31**  **+ B** **①** $

计算机将得到的33位结果truncate回原来的32位，即丢弃第33位(0)变为：

$*a + *b =    1b30 ··· b0 = -231 + b30*230 +  b29*229 + ··· + b0*20 = -**2**  **31**   **+ B ②**$

正确的真实值是①，溢出结果为②，可见**溢出结果=真实值-2** **32**  

则$*b = *a - *b = ② - *b =  ① - 232 - *b = *a + *b - 232 - *b = -232 + *a$

最后一步，来看 $-232 + *a  == *a$ 成立否？

$0 < *a < 231, 则 -232 < -232 + *a < -231$，和仍需要扩展1位方能表示：

$*a    = 0|0n30 ··· n0 = n30*230 +  n29*229 + ··· + n0*20 = N

-232 = 1|0000 ··· 00$

 和的位表示为

$-232 + *a = 1|0n30 ··· n0 = n30*230 +  n29*229 + ··· + n0*20$

同样，计算机把33位结果truncate回32位（丢弃第33位）得到：

$-232 + *a =  0n30 ··· n0 = n30*230 +  n29*229 + ··· + n0*20 = *a$

可见$-232 + *a  == *a$ 是成立的。因此尽管溢出了，但仍能正确交换。

**不正经回答**：
直觉上看起来加减法可能会溢出。其实不然，第一步的加运算可能会造成溢出，但它所造成的溢出会在后边的减运算中被“溢出”回来。

**举例证明法**：
  举个栗子 

  交换-5， -7。 以4bit为例。 

  -5 = 1011 （补码）    -7 = 1001 （补码） 

  （-5）+ （-7）= 10100=0100=4 （溢出后为4） 

  4-（-7）= 4 +７＝0100 + 0111 = 1011 = -5的补码 

  4-（-5）= 4 + 5 = 0100 + 0101 = 1001 = -7的补码 



## 类型转换
### 动态类型转换
[[10-Type-conversions#dynamic_cast|Dynamic_Cast]]

1. 判断下列代码的输出：
```cpp
#include <iostream>
using namespace std;
class Base {
public:
    void virtual Func() {
        cout << "Base" << endl;
    }
};

class Derived : public Base {
public:
    void virtual Func() {
        cout << "Derived " << endl;
    }
};

int main() {
    Base *pBase = new Base();
    pBase->Func();
    Derived *pDerived = (Derived *) pBase;
    pDerived->Func();
    delete pBase;

    pDerived = new Derived();
    pBase = pDerived;
    pBase->Func();

    delete pDerived;
    return 0;
}
```

output: `Base -> Base -> Derived`

由于 func 是一个虚函数，所以将指针赋值给基类或者派生类对象不会对虚函数调用造成影响。pBase 是一个 Base 对象，前两次 func 会调用 Base 对应的 func 函数，输出两次 Base。而 pDerived 是一个 Derived 对象，因此是输出 Derived。B 选项正确。

>[! warning] 强制类型转换与指针
> 强制类型转换时会将 Base 类型的数据所在的内存按照 Derived 类型格式解析和转换。pDerived 解析得到的是 pBase 的虚函数表，相当于 pDerived 的 vtbl 虚函数表指针指向了 pBase 的虚函数表，故得到 Base;
> 
> 但这种强制转换比较危险，当访问某虚函数时子类存在而父类不存在时，就可能导致运行时出现访问错误，程序崩溃，而此时编译是正常的，因为指针的虚函数表是动态链接的。

2. 阅读如下代码，判断 L 1、L 2 的编译情况：
```cpp
struct A1
{
    virtual ~A1() {}
};
struct A2
{
    virtual ~A2() {}
};
struct B1 : A1, A2 {};
int main()
{
    B1 d;
    A1* pb1 = &d;
    A2* pb2 = dynamic_cast<A2*>(pb1);  //L1
    A2* pb22 = static_cast<A2*>(pb1);  //L2
    return 0;
}
```

**ANSWER**：L1 编译通过，L2 编译失败。
[[10-Type-conversions#static_cast|static_cast]]

>[! note] 静态转换和动态转换的区别
>1. static_cast           
>	- 没有虚函数同样可以编译通过;
>	- 用于非多态类型转换 (静态转换)，任何标准转换都可以用它，
>	- 最常用的类型转换符，用于基本数据类型之间的转换，如把 int 转换为 char, 但是不能用于两个不相关的类型转换。
>	- 用于类层次结构中基类和派生类之间指针或引用的转换，上行转换（派生类---基类）是安全的，与 dynamic_cast 效果相同；下行转换（基类---派生类）由于没有动态类型检查，所以是不安全的;   
>	- 把空指针转换成目标类型的空指针
>	- 把任何类型的表达式转为 void 类型           
>	- static_cast 不能转换掉 expression 的 const、volatile、或者__unaligned 属性
>2. dynamic_cast      
>	- dynamic_cast 只能用于有虚函数的类（必须有共有继承和虚函数)，为运行时转换，由于运行时类型检查需要运行时类型信息，而这个信息存储在类的虚函数表中，只有定义了虚函数的类才有虚函数表，没有定义虚函数的类是没有虚函数表的； 如果父类没有虚函数，编译报错；              
>	- 用于类层次结构中基类和派生类之间指针或引用的转换, 上行转换（派生类--->基类）是安全的，与 static_cast 效果相同; 下行转换（基类--->派生类）具有类型检查的功能，转型是安全的，当类型不一致时，转换过来的是空指针;
>	- 先检查能否转型成功，能成功则转型，不能成功则返回 0  
>3. static_cast 和 reinterpret_cast 的区别:
>	- static_cast 不适用于不同指针类型之间的转换, 因为它们是完全不同的两个类型. 
>	- 如果自己清楚自己在做什么, 通常对于不同指针类型的转换应该使用reinterpret_cast

## 运算符
### sizeof
1. sizeof 与 strlen 的区别？
>[! done] sizeof 是函数吗？
>sizeof 是操作符，在编译阶段就获得结果，strlen 是函数调用，在运行阶段才获得值。

### 运算符重载
>[!note] 运算符重载的几个原则
>1. 不是所有的运算符都能被重载。
>2. 重载不能改变运算符的优先级和结合性
>3. 重载不会改变运算符的用法，原有有几个操作数、操作数在左边还是在右边，这些都不会改变
>4. 运算符重载函数不能有默认的参数
>5. 运算符重载函数既可以作为类的成员函数，也可以作为全局函数
>6. 箭头运算符->、下标运算符\[\]、函数调用运算符( )、赋值运算符 = 只能以成员函数的形式重载  

1. 调用重载后运算符的方法
>[! done] 调用重载运算符的两种方法
>1. `c = a + b; //implicitly using operator` 这样是隐式地直接使用重载后的运算符
>2. `c = a.operatpr+(b); //explicitly using its function name` 这样是运用运算符函数的调用格式

2. 若要重载 `+`, `=`, `<<`, `==`, `[]` 运算符，则必须作为类成员重载的是：

**ANSWER**：`=` 和 `[]`

C++语言规定，运算符“=”、“[]”、“()”、“->”以及所有的类型转换运算符只能作为成员函数重载，具体原因可以这样理解：

**这些运算符都需要访问对象的内部状态。如果允许它们作为普通全局函数重载, 将无法访问对象的私有成员**。

举例来说, 对于运算符"="的重载:
```cpp
class Person {
private:
  string name;
  int age;

public:
  Person& operator=(const Person& rhs) {
    name = rhs.name; // 可以访问私有成员
    age = rhs.age;
    return *this;
  } 
};

Person p1, p2;
p1 = p2; // 调用operator=
```

如果 operator=是全局函数, 就无法访问 Person 的私有成员 name 和 age, 赋值操作将失去意义。

所以 C++规定这些运算符必须作为类的成员函数来重载, 这样可以访问私有成员, 正确实现运算符的语义。

这能够确保这些运算符能根据对象内部状态的改变而改变行为, 是一种封装和安全的设计。

总结来说, C++这样规定是为了使这些运算符能够访问对象的私有状态, 正确安全地表达运算符语义。


### 逗号表达式
1. 判断：(3,2,1,0) 可作为 C++合法表达式是否正确 （✅）

> [! note] 逗号表达式
> 这是一个逗号表达式，其值是最后一个元素 0。即 int a=(3,2,1,0); 赋值后 a=0。
> 
> `表达式 1，表达式 2，表达式 3，...... ，表达式 n`
> 逗号表达式的要领：
> (1) 逗号表达式的运算过程为：从左往右逐个计算表达式。
> (2) 逗号表达式作为一个整体，它的值为最后一个表达式（也即表达式 n）的值。
> (3) 逗号运算符的优先级别在所有运算符中最低。

### 优先级
1. 判断以下语句的输出
```C++
int x=1,y=2,z=3;
z += x > y ? ++x : ++y;
printf("%d",z);
```

>[! note] 考查运算符的优先级
>赋值运算符<逻辑运算符<关系运算符<算数运算符


## 函数
### 返回值

1. 通过 return 语句，函数可以返回一个或多个返回值。（❌）

>[! error] 返回值的个数
>在 C++11 及其后续标准中，函数本身仍然只能返回一个值。但是，可以使用 `std::tuple` 或 `std::pair` 等数据结构来返回多个值，从而实现在函数返回时返回多个参数的效果。

这是一个使用 `std::tuple` 返回多个参数的例子：

```cpp
#include <iostream>
#include <tuple>

std::tuple<int, double> myFunction() {
    int value1 = 42;
    double value2 = 3.14;
    return std::make_tuple(value1, value2);
}

int main() {
    auto result = myFunction();
    int a = std::get<0>(result);
    double b = std::get<1>(result);
    std::cout << "a: " << a << ", b: " << b << std::endl; // 输出：a: 42, b: 3.14
    return 0;
}
```

上述代码使用 `std::tuple` 来将多个值打包在一起并返回，然后在 `main` 函数中使用 `std::get` 来获取每个返回值的具体值。

除了 `std::tuple`，你还可以使用 `std::pair` 或自定义的结构体或类或指针或引用等数据结构来返回多个参数。这些方法都能实现在函数返回时返回多个值的目的。在选择返回多个值的方法时，需要考虑代码的可读性、维护性以及对不同类型返回值的支持。

### 虚函数、继承等综合调用问题
1. 分析下列代码中哪个函数调用会出问题？
```cpp
using namespace std;
 
class A {
public:
    void FunctionA() {cout << "FunctionA" << endl;}
    virtual void FunctionB() {cout << "FunctionB" << endl;}
    static void FunctionC() {cout << "FunctionC" << endl;}
};
 
class B : public A {
public:
    void FunctionB() {cout << "FunctionB" << endl;}
    int FunctionD() {cout << "FunctionD" << endl;}
};
 
int main() {
    B *b = nullptr;
    b->FunctionA();
    b->FunctionB();
    b->FunctionC();
    b->FunctionD();
    return 0;
}
```

在 Cpp 20，Clang++的环境中实际运行，结果是：
```
FunctionA

Process finished with exit code 139 (interrupted by signal 11: SIGSEGV)
```

这表明程序确实是在运行到 FunctionB 时出现了错误，这一原因是因为 b 是一个 null 指针，而不是一个对象，在调用非虚成员函数时必须要对象才能绑定 V-table。

根据运行结果，程序在调用 `b->FunctionB()` 后崩溃并报告了 `SIGSEGV` 信号，这是由于对空指针进行成员函数调用引起的。具体原因如下：
1. `b` 是一个指向 `B` 类对象的空指针，没有指向任何有效的对象。
2. 调用 `b->FunctionB()` 时，它试图调用 `B` 类的非虚函数 `FunctionB()`，这是一个在类 `B` 中重写的函数。然而，由于 `b` 是空指针，它并不指向任何对象，所以无法调用非静态成员函数，包括 `FunctionB()`。
3. 空指针调用非虚函数是未定义的行为，这可能会导致程序崩溃或产生其他不确定的结果。

要解决这个问题，应该在调用成员函数之前确保指针 `b` 指向了一个有效的对象。例如，可以通过使用 `new` 运算符为 `b` 动态分配内存，或者将 `b` 指向一个已经存在的有效对象。

以下是对代码进行修改的示例：
```cpp
#include <iostream>
using namespace std;

class A {
public:
    void FunctionA() { cout << "FunctionA" << endl; }
    virtual void FunctionB() { cout << "FunctionB" << endl; }
    static void FunctionC() { cout << "FunctionC" << endl; }
};

class B : public A {
public:
    void FunctionB() override { cout << "FunctionB in B" << endl; }
    int FunctionD() { cout << "FunctionD" << endl; }
};

int main() {
    B* b = new B; // 为b分配内存，使其指向有效对象

    b->FunctionA();
    b->FunctionB();
    A::FunctionC(); // 静态成员函数使用类名调用

    delete b; // 记得释放动态分配的内存

    return 0;
}
```

请注意，在修改后的代码中，我们为 `b` 使用了 `new` 运算符来动态分配内存，然后通过 `delete` 运算符释放了这些内存，以避免内存泄漏。同时，`FunctionB` 和 `FunctionC` 分别输出不同的内容，以便区分调用的版本。

### 指针函数
1. 阅读代码并填写横线处合适的函数，使程序结果是`123`：
```cpp
#include <iostream>
using namespace std;
_______________________
void One(float one)
{
    cout<<"1"<<endl;    
}
void Two(float two)
{
    cout<<"2"<<endl;
}
void Three(float three)
{
    cout<<"3"<<endl;
}
int main() 
{  
    float i=1,j=2,k=3;
   function = One;
   function(i);
   function= Two;
   function(j);
   function = Three;
   function(k);
}
```

**ANSWER**：`void (*function)(float); `

>[!note] 函数指针
>1. 函数指针
>	- 函数指针是一个指向函数的指针变量, 可以像普通函数一样调用。
>	- 声明格式为: 返回值类型 ` (*函数指针名)(参数);`
>	- 作用是动态绑定和调用函数, 可以实现回调函数和函数接口等功能。
>	- 使用步骤：
>		- 声明函数指针变量
>		- 赋值, 使函数指针指向某个函数的地址
>		- 通过函数指针调用函数
>2. 返回指针的函数
>	- 返回指针的函数是一种普通函数, 只不过它的返回值类型是一个指针。
>	- 声明格式为: 返回值指针类型 函数名 (参数) 
>	- 这种函数执行后, 返回一个指向某块内存的指针, 而不是直接返回内存块中的数据。
>	- 调用该函数后需要接收返回的指针, 并 PROPERLY 释放指针指向的内存。
>3. 区别
>	- 函数指针是一个指针变量, 而返回指针的函数是一个普通函数。
>	- 函数指针需要赋值与解引用, 返回指针的函数直接调用返回指针。
>	- 函数指针可以更动态改变调用的函数, 返回指针的函数调用固定的。
>
>简单来说, 函数指针代表一个函数的入口地址, 而返回指针代表一个数据空间的起始地址。

### 内联函数
1. 内联函数在编译时是否进行参数类型检查？
答：做类型检查。内联函数在程序编译时，编译器将程序中出现的内联函数的调用表达式用内联函数的函数体代替。

[[20-Functions#Inline functions|Inline function]]

>[!note] 内联函数与宏定义的联系与区别
>联系：
>1. 替换代码：宏定义和内联函数都可以将代码直接嵌入到调用处，而不是像普通函数一样进行函数调用。
>2. 编译期间展开：宏定义和内联函数都在编译期间进行展开，避免了函数调用的开销。
>3. 减少函数调用开销：宏定义和内联函数都可以减少函数调用带来的额外开销，如函数调用的栈帧、参数传递等。
>
>区别：
>1. 语法和类型安全：宏定义是基于文本替换，没有语法结构和类型检查，可以操作任意文本。而内联函数在语法上与普通函数相似，可以进行类型检查，并且遵循函数的作用域规则。
>2. 嵌套能力：宏定义可以嵌套使用，而内联函数不具备嵌套能力。
>3. 内联函数可以访问类的成员变量，而宏定义不可以；
>4. 在类中声明同时定义的成员函数，自动转化为内联函数；
>5. 调试和可读性：宏定义展开后的代码难以调试和阅读，而内联函数可以在调试器中进行单步调试，并且提供了更好的可读性。

>[! note] 推荐使用内联函数
>原因如下：
>1. 类型安全：内联函数在语法上与普通函数相似，可以进行类型检查，避免了宏定义可能带来的类型错误。
>2. 调试和可读性：内联函数在调试器中可以进行单步调试，展开后的代码易于阅读和理解。
>3. 作用域和命名空间：内联函数遵循函数的作用域规则和命名空间，可以进行更灵活的代码组织和封装。
>
>然而，内联函数并不是适用于所有情况的最佳选择。内联函数的展开会导致代码膨胀，对于函数体较大或频繁调用的函数，内联可能会导致可执行文件的大小增加和缓存命中率下降，反而降低了性能。因此，对于复杂的函数或频繁调用的函数，需要根据实际情况进行权衡，可能需要使用普通函数或其他优化手段。

>[! note] 内联函数与宏的开销对比
>内联函数的开销比宏略大，耗费在类型检查和其它编译时检查之上，但并不显著；

### 形参与实参
1. 已知下列程序运行结果是 YY，78，96，则补充横线处的内容为：
![[real-params-virtual-params.png]]

✅ ：`*a` 或 `a[]` 都可以。

- 首先 a 是肯定不行的，它是标准的形参，出去函数体之后，实参还是原来的实参，值不变。
- `*a` 是正确的，传入的是指针，指向要被修改的地址；
- `a[]` 也是正确的，这本质也是一种解引用，在这里当作指针用；
- `&a` 这样的传参方式不行，此时函数输入的形式应该是 f(c),而不是 f(&c)，此外函数体里的引用形式应该是 `a.` 的形式，而不是 ` a-> `

## 继承
1. 派生类对象不会建立基类的私有数据成员，所以不能访问基类的私有数据成员（❌）

>[!error] 派生类究竟继承了基类的私有成员了吗？
>一开始我以为这个题是个因果逻辑的错误，但是转念一想可以动手实例化两个派生了和基类，分别比较对象的内存占用，这样就能确定是否真正继承了。因此可以编写如下代码，实际验证内存占用：

```cpp 
#include <iostream>

class Base {
private:
    int privateVar;
protected:
    int protectedVar;
public:
    int publicVar;
};

class Derived : public Base {
public:
    int derivedVar;
};

int main() {
    Base baseObj;
    Derived derivedObj;

    std::cout << "Size of Base: " << sizeof(baseObj) << " bytes" << std::endl;
    std::cout << "Size of Derived: " << sizeof(derivedObj) << " bytes" << std::endl;

    return 0;
}
```

运行这段代码，将会输出两个类对象的内存占用大小。如果派生类继承了基类的私有成员，那么派生类的对象的内存大小应该比基类的对象的内存大小要大，因为派生类对象包含了基类的成员。

而运行结果是：
```
Size of Base: 12 bytes
Size of Derived: 16 bytes
```

让我们分析这个结果：

1. `Size of Base: 12 bytes`: 基类 `Base` 包含一个私有成员 `privateVar` 和一个保护成员 `protectedVar`，以及一个公有成员 `publicVar`。由于大多数系统的 `int` 类型占用 4 个字节，这里的大小为 12 字节。
    
2. `Size of Derived: 16 bytes`: 派生类 `Derived` 继承了基类 `Base` 的成员，包括私有成员 `privateVar` 、保护成员 `protectedVar` 和公有成员 `publicVar`，并且还有自己的成员 ` derivedVar `。由于继承了基类的私有成员，导致派生类的对象大小增加。因此，大小为 12 字节（基类的大小） + 4 字节（派生类新增的成员）= 16 字节。
    

这证实了派生类确实继承了基类的私有成员，只是不能直接访问这些私有成员而已。当您在派生类中定义了成员函数或使用基类的公有/保护成员函数来访问基类的私有成员时，您可以间接地操作这些私有成员。

## 文件 IO
1. 使文件指针重新定位到文件读写的首地址的函数是：

`rewind()`：用于将文件内部的位置指针重新指向一个流(数据流/文件)的开头；rewind 单词的本义是：倒带
>[! note] 其它相似函数的功能
>- ftell () 函数用于得到文件位置指针当前位置相对于文件首的偏移字节数；
>- fseek()函数用于设置文件指针的位置；
>- ferror ()函数可以用于检查调用输入输出函数时出现的错误。

实际上 `fseek()` 也可以设置到文件开头，而且对错误处理的扩展性更好，但是使用比较复杂：[[10-IO-files#^9c9960]]

```cpp
#include <iostream>
#include <fstream>

int main() {
    std::fstream file("example.txt", std::ios::in); // 打开文件，以只读方式

    if (file.is_open()) {
        file.seekg(0, std::ios::beg); // 将文件指针移动到文件开头
        // 在这里进行读取操作...
        file.close(); // 关闭文件
    } else {
        std::cout << "Failed to open the file." << std::endl;
    }

    return 0;
}
```

## 内存操作

### `memset()` 函数

1. 判断以下代码的输出：
```cpp
#include <iostream>
#include <cstring> 
using namespace std;
 
class Parent {
public:
    virtual void output();
};
 
void Parent::output() {
    printf("Parent!");
}
 
class Son : public Parent {
public:
    virtual void output();
};
 
void Son::output() {
    printf("Son!");
}
 
int main() {
 
    Son s;
    memset(&s, 0, sizeof(s));
    Parent& p = s;
    p.output();
 
    return 0;
}
```
A. Parent!
B. Son!
C. 编译出错
D. 没有输出结果，程序运行出错

实际结果是 D。现在来分析一下 `memset()` 函数的使用方法：

>[! note] `memset()` 介绍
> `memset()` 是 C/C++ 中的一个库函数，用于将一段内存块设置为指定的值。它的函数原型如下：
> ```cpp
> void *memset (void *ptr, int value, size_t num);
> ```
> 
> - `ptr`: 指向要设置的内存块的指针。
> - `value`: 要设置的值，它以整数形式传递，但会被强制转换为 `unsigned char` 类型来设置到内存块中。
> - `num`: 要设置的字节数，即要设置的内存块的大小。
> 
> `memset()` 函数将 `ptr` 指向的内存块的前 `num` 个字节都设置为 `value` 的值。该函数通常用于将一块内存清零（设置为 0）或设置为其他特定的值。

以下是 `memset()` 的简单使用示例：

```cpp
#include <cstring>
#include <iostream>

int main() {
    int arr[5];
    std::memset(arr, 0, sizeof(arr)); // 将整个数组设置为0

    char str[20];
    std::memset(str, 'A', 10); // 将前10个字符设置为'A'

    // 输出数组和字符串的内容
    for (int i = 0; i < 5; ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
    std::cout << str << std::endl;

    return 0;
}
```

来自另一位大佬的详细介绍：

- memset 是以字节为单位，初始化内存块。当初始化一个字节单位的数组时，可以用 memset 把每个数组单元初始化成任何你想要的值，比如，
```
char data[10];
memset(data, 1, sizeof(data));    // right
memset(data, 0, sizeof(data));    // right
```
而在初始化其他基础类型时，则需要注意，比如,
```
int data[10];
memset(data, 0, sizeof(data));    // right
memset(data, -1, sizeof(data));    // right
memset(data, 1, sizeof(data));    // wrong, data[x] would be 0x0101 instead of 1
```

![[memset初始化的异常结果分析#`value` 参数设置为 1 错误的原因]]

- 当结构体类型中包含指针时，在使用 memset 初始化时需要小心。比如如下代码中，
```
struct Parameters {
          int x;
          int* p_x;
};
Parameters par;
par.p_x = new int[10];
memset(&par, 0, sizeof(par));
```
当memset初始化时，并不会初始化p_x指向的int数组单元的值，而会把已经分配过内存的p_x指针本身设置为0，造成内存泄漏。同理，对std::vector等数据类型，显而易见也是不应该使用memset来初始化的。

- 当结构体或类的本身或其基类中存在虚函数时，也需要谨慎使用 memset。这个问题就是在开头题目中发现的问题，如下代码中，
```
class BaseParameters
{
public:
    virtual void reset() {}
};

class MyParameters : public BaseParameters
{
public: 
    int data[3];
    int buf[3];
};

MyParameters my_pars;
memset(&my_pars, 0, sizeof(my_pars));
BaseParameters* pars = &my_pars;

//......

MyParameters* my = dynamic_cast<MyParameters*>(pars);
```
程序运行到 dynamic_cast 时发生异常。原因其实也很容易发现，我们的目的是为了初始化数据结构 MyParameters 里的 data 和 buf，正常来说需要初始化的内存空间是 sizeof(int) * 3 * 2 = 24字节，但是使用 memset 直接初始化 MyParameters 类型的数据结构时，sizeof(my_pars)却是28字节，因为为了实现多态机制，C++对有虚函数的对象会包含一个指向虚函数表(V-Table)的指针，当使用 memset 时，会把该虚函数表的指针也初始化为0，而 dynamic_cast 也使用 RTTI 技术，运行时会使用到 V-Table，**可此时由于与 V-Table 的链接已经被破坏，导致程序发生异常。**

### new 与 malloc
1. 关于 new 与 malloc 的几个说法，判断正误
- 都是用来申请内存的✅
- 都是函数❌
- 都会调用构造函数❌

>[! note] new 与 malloc 的异同
>同：都可以进行内存申请的操作；
>异：
>1. 语法：malloc 是 C 语言中的库函数，需要包含头文件 `<cstdlib>` 并使用 `malloc` 函数来分配内存。而 new 是 C++中的操作符，使用关键字 `new` 进行内存分配。
>2. 类型安全：new 在内存分配的同时会调用构造函数来初始化对象，确保类型安全。而 malloc 只是分配内存，不会自动调用构造函数，需要手动初始化对象。
>3. 返回值：malloc 返回的是 `void*` 类型的指针，需要进行显式的类型转换。new 返回的是相应类型的指针，无需进行类型转换。
>4. 内存分配大小：malloc 的参数是要分配的内存大小（以字节为单位），而 new 的参数是要分配的类型。
>5. 内存分配失败：malloc 在内存分配失败时返回 `nullptr` 或 `NULL`。new 在内存分配失败时会抛出 `std::bad_alloc` 异常。
>6. 内存释放：使用 malloc 分配的内存需要使用 free 函数进行显式的释放。使用 new 分配的内存需要使用 delete 操作符进行释放，以避免内存泄漏。
>7. 底层原理： 
>	- malloc 底层原理实现：当开辟的空间小于 128 k 时，调用 `brk()` 函数，当开辟的空间大于 128 k 时，调用 ` mmap() `，malloc 采用的是内存池的管理方式，先申请大块内存作为堆区，然后将堆区分为多个内存块，当用户申请时，就调出一块合适的给用户;
>	- new 底层原理实现：1，创建一个新的对象；2，将构造函数的作用域赋值给这个新的对象；3，执行构造函数中的代码；4，返回新对象；
>
>总结起来，malloc 和 new 都可以用于动态分配内存，但 new 是 C++的操作符，更类型安全，而 malloc 是 C 语言的函数。在使用时需要注意它们的语法和内存释放方式，并根据实际需求选择适当的操作符。在 C++中，推荐使用 new 和 delete，因为它们提供更好的类型安全性和异常处理机制。


## 类与成员
### 构造函数与析构函数

1. 假设 ClassY: publicX，即类 Y 是类 X 的派生类，则说明一个 Y 类的对象时和删 Y 类对象时，调用构造函数和析构函数的次序分别为（）

>[! done] 构造函数与析构函数在继承中调用顺序
>构造函数：先调用基类构造函数，再调用派生类
>析构函数：先解除派生类构造函数，在解除派生类
>
>类比：相当于建房子，构造：先打基脚，在往上建，析构：从上面往下拆

2. 析构函数可以重载吗？
>[! note] 析构函数不可重载
>析构函数是特殊的类成员函数，它的名字和类名相同，前面加了~符号，没有返回值，没有参数，不能随意调用。
>注意函数重载的要求，最少要有一个参数类型与之不同，而析构函数没有参数、返回类型。

3. 利用构造函数初始化时为什么成员初始化列表更快？
```
# 赋值
class classA{...};
class classB{
public:
    classB(classA a){mA = a;}
private:
    classA mA;
};

# 初始化成员列表
class classA{...};
class classB{
public:
    classB(classA a): mA(a) {}
private:
    classA mA;
};
```

对数据成员按类型分类  
1. 内置数据类型，复合类型（指针，引用）  
2. 用户定义类型（类类型）

分情况说明：  
- 对于类型1，在成员初始化列表和构造函数体内进行，在性能和结果上都是一样的；
- 对于类型2，结果上相同，但是性能上存在很大的差别

因为类的数据成员对象在进入函数体时已经构造完成，也就是说在成员初始化列表处进行构造对象的工作，这时调用一个构造函数；在进入函数体之后，进行的是对已经构造好的类对象的赋值，又调用拷贝赋值操作符才能完成（如果并未提供，则使用编译器提供的默认按成员赋值行为）

简单的来说：  
对于用户定义的类型：  
1) **如果使用类初始化列表，直接调用对应的构造函数即完成初始化**  
2) **如果在构造函数中初始化，那么首先调用默认的构造函数，然后调用指定的构造函数**

所以对于用户定义类型，使用列表初始化可以减少一次默认构造函数调用过程


### 虚函数
>[! note] 辨析虚函数、纯虚函数、非虚函数
>- 纯虚函数：只提供一个接口，具体实现方法需要派生类自己去实现
>- 虚函数：提供接口，并提供默认的实现方法，派生类也可以根据自己需求去重载
>- 非虚函数：提供接口，强制实现方法

>[! note] 虚函数概念略解
>以关键字 virtual 的成员函数称为虚函数，主要是用于运行时多态，也就是动态绑定。
>
>虚函数必须是类的成员函数，不能是友元函数、也不能是构造函数 ——【原因：因为建立一个派生类对象时，必须从类层次的根开始，沿着继承路径逐个调用基类的构造函数，直到自己的构造函数，不能选择性的调用构造函数】
>
>不能将虚函数声明为全局函数，也不能声明为 static 静态成员函数。因为虚函数的动态绑定必须在类的层次依靠 this 指针实现。
>
>虚函数的重载特性：一个派生类中定义基类的虚函数是函数重载的一种特殊形式。
>- 重载一般的函数：函数的返回类型和参数的个数、类型可以不同，仅要求函数名相同；
>- 而重载虚函数：要求函数名、返回类型、参数个数、参数类型和顺序都完全相同。

1. 包含虚函数的类有 this 指针。（✅）
> [! done] 虚函数的 this 指针
> 包含虚函数的类可以使用 `this` 指针。在 C++ 中，每个非静态成员函数都有一个隐式的指向当前对象的指针，即 `this` 指针。`this` 指针指向调用该成员函数的对象的地址。
> 当你调用一个包含虚函数的类的成员函数时，该函数被绑定到正确的虚函数表中，并且 `this` 指针会被自动传递给该函数，指向调用函数的对象。这样，函数就能正确地操作属于该对象的成员变量和虚函数。

例如，考虑以下包含虚函数的简单类：

```cpp
#include <iostream>

class Base {
public:
    virtual void print() {
        std::cout << "Base::print() called. this = " << this << std::endl;
    }
};

int main() {
    Base obj;
    obj.print();
    return 0;
}
```

输出结果可能类似于：

```
Base::print() called. this = 0x7ffdbf7ca6df
```

在上面的例子中，创建了一个 `Base` 类的对象 `obj` 并调用了 `print()` 成员函数。在 `print()` 函数中，我们打印了 `this` 指针的值，它指向了 `obj` 对象的地址。

所以，包含虚函数的类是支持使用 `this` 指针的，并且这使得类的成员函数能够正确地与对象交互。

2. 判断：如果一个类可能做为基类使用的话，将其析构函数虚拟化， 这样当其子类的对象退出时，也会一并调用子类的析构函数释放内存。 （✅）

>[! note] 基类析构函数为什么要设置为虚函数？
>因为子类的析构需求不一致，用统一的父类析构函数可能造成析构不完全，因此一般设置父类析构函数为虚函数，然后在子类中具体实现。在父类指针下，根据对象所属子类动态地加载子类析构函数

If a class is intended to be used as a base class and it has virtual functions (including the destructor), then when a derived class object is destroyed, its destructor will be called, followed by the destructor of the base class. This is known as "virtual destructor" behavior, and it ensures that the proper destructors are called in the correct order, allowing for proper cleanup and deallocation of resources, including memory.

Here's an example to illustrate the concept:

```cpp
#include <iostream>

class Base {
public:
    virtual ~Base() {
        std::cout << "Base destructor called." << std::endl;
    }
};

class Derived : public Base {
public:
    ~Derived() override {
        std::cout << "Derived destructor called." << std::endl;
    }
};

int main() {
    Base* obj = new Derived();
    delete obj;
    
    return 0;
}
```

Output:
```
Derived destructor called.
Base destructor called.
```

In this example, the `Base` class has a virtual destructor, and the `Derived` class overrides the destructor. When `delete obj;` is called in the `main` function, it first calls the `Derived` destructor and then the `Base` destructor due to the virtual destructor mechanism. This ensures that the destructors of both classes are called in the correct order, allowing proper cleanup.

Without a virtual destructor, if the destructor is not virtual in the base class, then only the base class's destructor would be called, and the derived class's destructor might not be executed, leading to potential memory leaks or improper cleanup. Therefore, when designing a class hierarchy where polymorphism and inheritance are involved, it's crucial to make the base class's destructor virtual to ensure proper destruction of derived class objects.

3. 判断程序运行结果：
```cpp
#include <iostream>
using namespace std;
class A {
public:
    int b;
    char c;
    virtual void print() {
        cout << "this is father’s fuction! " << endl;
    }
};
class B: A {
public:
    virtual void print() {
        cout << "this is children’s fuction! " << endl;
    }
};
int main(int argc, char * argv[]) {
    cout << sizeof(A) << "" << sizeof(B) << endl;
    return 0;
}
```

✅ Output：12 12

类的大小只与成员变量（非 static 数据成员变量）和虚函数指针有关，还要考虑到对齐。
- 那么类 A 的大小等于 4 个字节 + 4 个字节（考虑对齐） + 4 个字节（指向虚函数的指针）=12 字节；
- 类 B 的大小就是等于类 A 的大小 12 个字节。

因为在基类中存在虚函数时，派生类会继承基类的虚函数，因此派生类中不再增加虚函数的存储空间（因为所有的虚函数共享一块内存区域），而仅仅需要考虑派生类中添加进来的非 static 数据成员的内存空间大小。所以类 B 大小为12 Byte。

注意，上述规则不适用于 #虚继承 ，对于虚继承还会多占一份存储空间。

![[什么是虚继承、虚基类？]]

4. 构造函数为什么不能声明为虚函数？

> [! note] 构造函数不能被 virtual 修饰的原因
> 1. 构造一个对象的时候，必须知道对象的实际类型，而虚函数行为是在运行期间确定实际类型的。而在构造一个对象时，由于对象还未构造成功。编译器无法知道对象的实际类型，是该类本身，还是该类的一个派生类，或是更深层次的派生类。无法确定。 
> 2. 虚函数的执行依赖于虚函数表。而虚函数表在构造函数中进行初始化工作，即初始化vptr，让他指向正确的虚函数表。而在构造对象期间，虚函数表还没有被初 始化，将无法进行。 析构函数执行时先调用派生类的析构函数，其次才调用基类的析构函数。


### 抽象类
>[!note] 纯虚函数与抽象类的关系：
>抽象类中至少有一个纯虚函数。
>
>如果抽象类中的派生类没有为基类的纯虚函数定义实现版本，那么它仍然是抽象类，相反，定义了纯虚函数的实现版本的派生类称为具体类。
>
>抽象类在 C++中有以下特点：
>1. 抽象类只能作为其他类的基类；
>2. 抽象类不能建立对象；
>3. 抽象类不能用作参数类型、参数返回类型或显示类型转换。

1. 判断关于抽象类说法的正误：

A. 抽象类中可以不存在任何抽象方法  ❌
B. 抽象类可以为 final 的  ❌
C. 抽象类可以被抽象类所继承  ✅
D. 如果一个非抽象类从抽象类中派生，不一定要通过覆盖来实现继承的抽象成员  ❌
E. 抽象类不能用作参数类型、函数返回类型或显式转换类型 ✅

>[! note] 抽象类
>A ❌。抽象类必须至少包含一个纯虚函数（抽象方法），否则它就不是抽象类。
>B ❌。因为 final 的类不可以被继承，只能用于生成实例对象；抽象类不能用于生成实例对象，因此，抽象类不能是 final.
>C ✅。如果我们不在派生类中覆盖纯虚函数，那么派生类也会变成抽象类，所以抽象类可以被抽象类继承
>D ❌。同C
>E ✅。抽象类本身不能实例化对象，因此无法传入或返回实际的对象；并且抽象类在进行隐式或显式转换时会引起歧义，不确定转换指向具体哪个子类的指针或引用

### 类的内存空间
1. 关于类占用内存空间的说法正确的是：（B、C）
A 类所占内存的大小是由成员变量（静态变量除外）决定的
B 空类的内存大小是１个字节
C 类中无论有多少个虚函数，只会多占一个 #虚表指针空间
D 子类的内存大小等于父类的内存大小加上子类独有成员变量的内存大小

>[! note] 影响类所占内存大小的因素
>在 C++中，类所占用的内存空间大小由以下几个因素决定：
>1. 类的成员变量：类的成员变量会占用内存空间。每个成员变量的大小取决于其类型，例如 int、char、指针等。类的内存大小将包括所有成员变量的大小之和。
>2. 对齐（Alignment）：为了提高内存访问的效率，编译器通常会对类的成员进行对齐。对齐规则可以根据编译器、编译选项和平台而有所不同。对齐可能导致填充字节的存在，以确保成员变量按照对齐要求排列。对齐的规则可以通过编译器的指令或者预处理器指令进行调整。
>3. 继承（Inheritance）：如果类继承自其他类，那么它会继承父类的成员变量。继承关系可能会导致额外的内存开销，例如虚函数表指针（在多态情况下）和基类的成员变量。
>4. 虚函数（Virtual Functions）：如果类中存在虚函数（通过 virtual 关键字声明的函数），则通常会有一个指向虚函数表的指针。虚函数表（vtable）存储了类的虚函数的地址，这会增加类的大小。
>
>需要注意的是，以上因素可能受到编译器和平台的影响，不同的编译器和不同的平台可能会产生不同的内存布局和大小。
>
>可以使用 C++中的 sizeof 运算符来获取类的大小，例如 `sizeof(MyClass)` 将返回类 MyClass 的大小（以字节为单位）。
>
>需要注意的是，类的大小不包括类的成员函数。成员函数是共享的，不会在每个类的实例中复制。它们通常在代码段中存储，并不占用类的实例的内存空间。

>[!note] 空类的内存占用
>在 C++中，空类（没有成员变量和成员函数）的大小不会是零，而是一个非零值。这是因为每个类实例在内存中都应该具有唯一的地址，以便于进行区分。
>
>根据 C++标准的规定，空类的大小至少为 1 字节。这样做是为了确保每个实例都具有唯一的地址，以满足内存对齐的要求。
>
>实际上，编译器为了满足对齐要求，有可能在空类中插入一个字节的填充。这样，空类的大小通常是 1 字节，但也可以更大，具体取决于编译器的实现。

>[! note] 虚函数的内存占用
>在 C++中，无论类中有多少个虚函数，通常只会额外占用一个指向虚函数表（vtable）的指针空间。这个指针被称为虚表指针（vptr）。
>
>虚表指针是一个指向虚函数表的指针，虚函数表是一个存储了类中虚函数地址的表格。虚表指针的大小通常是一个机器字（通常为 4 字节或 8 字节），它指向虚函数表，而不是存储实际的函数代码。虚表指针存在于每个类的实例中，用于支持动态绑定（运行时多态性）。
>
>无论类中有多少个虚函数，只会有一个虚表指针。这是因为虚函数表是由类的整个继承层次结构共享的，每个类实例中只需要一个指针来引用虚函数表。
>
>其他的非虚函数和静态函数不会占用额外的内存空间，它们是类的共享成员，不会在每个类的实例中复制。
>
>需要注意的是，虚表指针的存在会增加类的大小，并且虚函数的调用会在运行时进行查找和解析，因此会略微影响性能。但这种开销通常是可以接受的，并且为实现运行时多态性提供了重要的机制。

>[!note] 子类内存占用大小与父类内存大小的关系
>子类的内存大小通常是父类的内存大小加上子类新增的成员变量的大小。这是因为子类会继承父类的成员变量，并在其基础上添加自己的成员变量。
>
>子类继承了父类的成员变量，包括继承过来的私有成员变量。然而，在内存中，子类的实例包含了父类的成员变量的内存空间，而不是简单地引用它们。
>
>在某些情况下，编译器可能对子类的内存布局进行优化，例如通过重排成员变量的顺序来减少内存空间的浪费。这意味着子类的内存大小可能不等于父类的内存大小加上子类新增成员变量的大小。
>
>此外，如果子类重写了父类的虚函数，并且父类中的虚函数使用了虚表指针（vptr），那么子类实例中也会存在一个指向子类的虚函数表的虚表指针。这会增加子类的内存大小
>
>总结起来，子类的内存大小不仅取决于新增的成员变量的大小，还可能受到编译器的优化和虚函数表指针的影响。因此，简单地将子类的内存大小定义为父类的内存大小加上子类新增成员变量的大小是不准确的。在实际情况中，子类的内存大小可能会有所变化。

### 静态成员
1. 下列关于静态成员的描述正误性判断：
- 静态成员不属于对象，是类的共享成员 (❌)
- Cpp 11 之前，非 const 的静态数据成员要在类外定义和初始化 (✅)
- 静态成员函数不拥有 this 指针，需要通过类参数访问对象成员 (✅)
- 只有静态成员函数可以操作静态数据成员 (❌)   _当然不是，静态数据成员属于类，非静态成员函数也可以访问_

![[Cpp 11前后 静态成员的定义与初始化问题#为什么非要在类外定义和初始化？]]

![[Cpp 11前后 静态成员的定义与初始化问题#Cpp 11 修改了什么？]]

2. static 类型的变量，默认初始化的值是？
>[!note] 静态类型初始化
>静态变量在没有显式初始化的时候会被初始化为0或者null

### 类型安全
1. MFC 中 CString 是类型安全的类吗？

>[! note] 类的类型安全
>在 C++中，类的类型安全是指类在使用过程中能够保证类型的正确性，防止意外类型转换和类型不匹配的错误。C++通过许多机制来实现类的类型安全，包括
>1. 强类型系统：C++是一种强类型的语言，要求变量在使用前必须声明其类型，并且不允许隐式的类型转换。这可以避免意外的类型转换和类型不匹配。
>2. 类的成员访问控制：C++允许在类中使用公有（public）、私有（private）和保护（protected）成员来控制对类的成员的访问权限。这样可以限制外部代码对类的私有成员的访问，增强类型安全性。
>3. 构造函数和析构函数：构造函数和析构函数是在对象创建和销毁时自动调用的特殊成员函数，它们确保对象的初始化和资源的释放，避免未初始化和资源泄漏的情况。
>4. 运算符重载：C++允许类通过运算符重载来定义自己的操作行为，避免不合理的运算符使用，提高类型安全性。

关于 MFC 中的 CString 类，CString 被认为是类型安全的类。CString 是 MFC（Microsoft Foundation Classes）中的一个字符串类，它提供了许多字符串操作功能，并且在内部维护了字符串的长度和缓冲区。CString 类通过使用 C++的特性，如运算符重载和成员函数，来确保在字符串操作中类型安全。

由于 CString 类在内部管理字符串的长度和内存分配，它可以防止缓冲区溢出等常见的字符串处理错误。同时，CString 类还提供了类型安全的字符串操作接口，如 `GetLength()` 和 `Left()` 等成员函数，避免了直接操作字符数组的风险。

### 友元函数
1. 判断关于 C++中的友元函数说法的正误：
- 友元函数需要通过对象或指针调用 ❌
- 友元函数是不能被继承的         ✅
- 友元函数没有 this 指针         ✅
- 友元函数破环了继承性机制       ❌

> [! note] 友元函数
> 友元函数是一种在类外定义，在类内特殊声明 (加关键字 friend)，并且可以在类外访问类的所有成员的非成员函数。友元函数相对于普通函数，增加了访问类成员的权利。
> - 友元函数可以像普通函数一样直接调用，不需要通过对象或指针；
> - 元函数不是成员函数，所以不能被继承，也同样没有 this 指针；
> - 由于友元函数和普通函数的区别仅仅是具有访问类成员的权利，和继承性机制没有关系

### 类的实例化
1. 判断下面语句执行后，在内存中创建了多少个对象：
```cpp
CSomething a();
CSomething b(2);
CSomething c[3];
CSomething &ra = b;
CSomething d = b;
CSomething *pA = c;
CSomething *p = new CSomething(4);
```

**ANSWER**：6

- `CSomething a ();` 没有创建对象，这里不是使用默认构造函数，而是声明了一个函数，[[10-Class(I)#^00dfc6|默认构造函数如何调用？]]。
- `CSomething b (2);` 使用一个参数的构造函数，创建了一个对象。 
- `CSomething c[3];` 使用无参构造函数，创建了 3 个对象。
- `CSomething &ra=b;` ra 引用 b，没有创建新对象。
- `CSomething d=b;` 使用拷贝构造函数，创建了一个新的对象 d。 
- `CSomething *pA = c;` 创建指针，指向对象 c，没有构造新对象。 
- `CSomething *p = new CSomething(4);` 新建一个对象。 

综上，一共创建了6个对象。

### 常对象
1. 判断以下程序的输出：
```cpp
#include<iostream>
using namespace std;
class R
{
public:
    R(int r1,int r2)
    {
        R1=r1;
        R2=r2;
    }
    void print()
    void print() const;
private:
    int R1,R2;
};
void R::print()
{
    cout<<R2<<","<<R1<<endl;
}
void R::print() const
{
    cout<<R1<<","<<R2<<endl;
}
int main()
{
    R a(6,8);
    const R b(56,88);
    b.print();
    return 0;
}
```

**ANSWER**：56,88

1) 有 const 修饰的成员函数（指 const 放在函数参数表的后面，而不是在函数前面或者参数表内），只能读取数据成员，不能改变数据成员；没有 const 修饰的成员函数，对数据成员则是可读可写的。
2) 常量（即 const）对象可以调用 const 成员函数，而不能调用非const修饰的函数。

综上： `const R b(56,88)`，是常对象，只能调用 const 修饰的常成员函数，即调用
`voidR::print() const{cout<<R1<<","<<R2<<endl;}`


## 面向对象
### 多态
1. 分析重载 overload 和重写 override 的区别。
- **函数的重载**：C++允许在同一范围中声明几个功能类似的同名函数，但是这些同名函数的形式参数（指参数的个数、类型或者顺序）必须不同，也就是说用同一个函数完成不同的功能。这就是重载函数。*重载函数常用来实现功能类似而所处理的数据类型不同的问题。不能只有函数返回值类型不同。*
	两个重载函数必须在下列一个或两个方面有所区别： 
	- 函数的参数个数不同。
	- 函数的参数类型不同或者参数类型顺序不同，  
  
- **函数的重写**：多态中提到的，一般父类函数中有虚函数，虚函数包含虚函数指针，指向虚函数表。在子类继承父类时，会一同把虚函数继承下来，同时也会把虚函数指针以及指针指向的虚函数表继承下来，如果在子类中对父类中的虚函数重写一遍，函数表中的内容就会被子类覆盖。  *重写只有函数体内的语句不同，其他都一样*。

### 继承
1. 判断：虚基类的构造函数在非虚基类之前调用
**ANSWER**：❌
#虚基类 --->>  [[什么是虚继承、虚基类？]]

C++20 引入了新的初始化顺序规则, 规定虚基类的构造函数总是先于非虚基类的构造函数被调用。这是为了解决多继承时初始化顺序可能引起的一些问题。

具体来说, C++20 中的构造函数调用顺序如下:
1. 如果类 A 继承自类 B, 且 B 是虚基类, 则先调用 B 的构造函数
2. 然后按继承的顺序调用每个非虚基类的构造函数
3. 最后调用最派生类的构造函数

举个例子:
```cpp
struct V {
  V() { std::cout << "V"; }
};

struct A : virtual V {
  A() { std::cout << "A"; }  
};

struct B : virtual V {
  B() { std::cout << "B"; }
};

struct C : A, B {
  C() { std::cout << "C"; }
};

int main() {
  C c; // 输出结果:VABCC
}
```

可以看到, 虚基类 V 的构造函数先于 A 和 B 被调用, 这在 C++20 之前是不确定的, 取决于编译器的实现。

所以在 C++20 中,“虚基类的构造函数在非虚基类之前调用”这句话是正确的。这让初始化顺序更加明确, 提高了代码的可理解性和可维护性。

2. 另一道有关继承时调用顺序的题，判断输出：
```cpp
#include <iostream>
using namespace std;
 
class A{
  public:
    A ():m_iVal(0){test();}
    virtual void func() { std::cout<<m_iVal<<' ';}
    void test(){func();}
  public:
      int m_iVal;
};
class B : public A{
  public:
    B(){test();}
    virtual void func(){
      ++m_iVal;
      std::cout << m_iVal << ' ';
      }
};
int main(int argc ,char* argv[]){
  A*p = new B;
  p->test();
  return 0;
}
```

**ANSWER**：0 1 2

参考答案：本问题涉及到两个方面： 1.C++继承体系中构造函数的调用顺序。 2.构造函数中调用虚函数问题。 

C++继承体系中，初始化时构造函数的调用顺序如下：
1. 任何虚拟基类的构造函数按照他们被继承的顺序构造 
2. 任何非虚拟基类的构造函数按照他们被继承的顺序构造
3. 任何成员对象的函数按照他们声明的顺序构造 
4. 类自己的构造函数 

据此可知 `A* p = newB;` 先调用 A 类的构造函数再调用 B 类的构造函数。 构造函数中调用虚函数,虚函数表现为该类中虚函数的行为，即在父类构造函数中调用虚函数，虚函数的表现就是父类定义的函数的表现。why？原因如下： 假设构造函数中调用虚函数，表现为普通的虚函数调用行为，即虚函数会表现为相应的子类函数行为，并且假设子类存在一个成员变量 int a；子类定义的虚函数的新的行为会操作 a 变量，在子类初始化时根据构造函数调用顺序会首先调用父类构造函数，那么虚函数回去操作 a，而因为 a 是子类成员变量，这时 a 尚未初始化，这是一种危险的行为，作为一种明智的选择应该禁止这种行为。所以虚函数会被解释到基类而不是子类。 据此可以得到答案 0 1 2

## 宏
### 强制分隔符
1. 有如下宏定义，则将其替换 `DECLARE (val, int)` 的结果是？
```cpp
#define DECLARE(name, type) type name##_##type##_type
```

##是一种分隔连接方式，它的作用是**先分隔，然后进行强制连接**。
“`name`”和第一个“` _ `”之间被分隔了，所以预处理器会把 ` name##_##type##_type ` 解释成4段：“` name `”、“` _ `”、“` type `”以及“` _type `”，name 和 type 会被替换，而_type 不会被替换

## 模板
### 声明和定义
1. 在 C++里，同一个模板的声明和定义是不能在不同文件中分别放置的，否则会报编译错误。为了解决这个问题，可以采取以下办法有（）
A. 模板的声明和定义都放在一个.h 文件中。
B. 模板的声明和定义可以分别放在.h 和.cpp 文件中，在使用的地方，引用定义该模板的 cpp 文件。
C. 使用 export 使模板的声明实现分离。
D. 以上说法都不对

>[!note] 各选项解释
>A. 
>B. 模板的声明和定义不能分别单独的放在. h 和. cpp 文件中的原因是**当实例化一个模板时，编译器必须看到模板确切的定义，而不仅仅是它的声明**。若在 main ()函数中包含. h 文件，则编译器无法知道模板的确切定义，**所以要在 main ()中包含. cpp 文件，. cpp 文件中又会包含. h 文件，这样一来通过在 main 函数中包含. cpp 文件就会将类的定义和声明都包含进来，编译器自然能找到模板的确切定义。**（在 main 函数中引用）
>
>《C++ Template》第六章讲过这个问题  
> 组织模板代码有三种方式  
> 1. 包含模型（常规写法 将实现写在头文件中）  
> 2. 显式实例化（实现写在 cpp 文件中，使用 template class 语法进行显式实例化）  
> 3. 分离模型（使用 C++ export 关键字声明导出）
> 
> 第三种方式理论最优，但是实际从C++标准提出之后主流编译器没有支持过，并且在最新的C++11标准中已经废除此特性，export关键字保留待用。那么实际上能够使用的实现分离也就只有显式实例化


## 数据结构

### 堆、栈
1. Cpp 中关于堆栈说法的正误判断：

A. 堆的大小仅受操作系统的限制，栈的大小一般一般较小  ✅
B. 在堆上频繁的调用 new/delete 容易产生内存碎片，栈没有这个问题 ✅
C. 堆和栈都可以静态分配 ❌
D. 堆和栈都可以动态分配 ✅

>[! note] 堆栈的内存分配
>选 C，静态分配是指在编译阶段就能确定大小，由编译器进行分配，堆不可以进行静态分配，堆的申请都是在执行过程中进行的。 
>
>A，堆和栈的大小都可以设置，栈一般只有几 KB。堆的大小通常受限于计算机的可用物理内存（RAM）和操作系统的设置。
>- 当程序请求从堆中分配内存（例如，通过动态内存分配函数如 C++ 中的 `malloc` 或 `new`），操作系统会从可用的 RAM 中分配内存。如果没有足够的空闲内存，堆分配可能失败。
>- 栈是用于存储局部变量、函数调用信息和其他执行相关数据的内存区域。程序中的每个线程通常有自己的栈。栈的大小通常是固定的，并由操作系统或编译器定义，通常比堆小。由于栈用于跟踪函数调用和局部变量，其大小必须受限，以防止过多的内存消耗和栈溢出问题。当调用函数时，其局部变量和一些管理信息被分配到栈上。如果超过了栈的大小，将导致栈溢出，可能导致程序崩溃。
>
>B，堆在动态分配时，要申请连续的内存空间，释放后会产生碎片。 
>
>D，堆是使用 malloc ()、calloc ()、realloc ()等函数动态分配的，而使用 alloca ()函数可以动态分配栈的内存空间，释放的时候由编译器自己释放。

### 链表
1. 如何在下列链表中取得值为 7 的表达式？
```cpp
struct st
{
    int n;
    struct st *next;
} a[3]= {5, &a[1], 7, &a [2], 9, NULL}，*p=a;
```

A. p->n        ❌
B. (p->n)++    ❌
C. (++p)->n    ✅ (可以但不建议)
D. p->next->n  ✅

*首先，让我们解释一下数组 a 的初始化：*

```cpp
struct st a[3] = {5, &a[1], 7, &a[2], 9, NULL};

// 等价于

struct st a[3]= {{5,&a[1]},{7,&a[2]},{9,NULL}}
```

*这是一个包含 3 个元素的 struct st 类型数组 a。每个元素都是一个结构体对象，结构体 st 的定义如下：*

```c
struct st {
    int n;
    struct st *next;
};
```

*现在我们解释一下数组 a 的初始化过程：* 

1. 第一个元素：`5, &a[1]`
   - `n` 成员被初始化为 5。
   - `next` 成员被初始化为 `&a[1]`，也就是指向数组中的第二个元素。
2. 第二个元素：`7, &a[2]`
   - `n` 成员被初始化为 7。
   - `next` 成员被初始化为 `&a[2]`，也就是指向数组中的第三个元素。
3. 第三个元素：`9, NULL`
   - `n` 成员被初始化为 9。
   - `next` 成员被初始化为 NULL，表示链表的最后一个节点。

*现在让我们回到你的问题：如何使用指针 p 获得值为7？*

在初始化数组后，指针 `p` 被赋值为 `&a[0]`，即指向数组 a 的第一个元素。
为了获得值为 7，我们需要沿着链表找到指向值为 7 的节点。链表的遍历可以通过使用指针的 `p->next` 来实现。

```c
struct st *p = a; // 指针p指向数组a的第一个元素

// 遍历链表直到找到值为7的节点
while (p != NULL) {
    if (p->n == 7) {
        // 找到值为7的节点，p指向该节点
        break;
    }
    p = p->next; // 移动到下一个节点
}

if (p != NULL) {
    // p指向值为7的节点，可以访问值为7的成员
    printf("Found the node with value 7: %d\n", p->n);
} else {
    printf("Node with value 7 not found.\n");
}
```

*为什么不建议使用 `(++p)->n `?*

在 Cpp 14、Clang++环境下，测试结果也是可以访问到值 7 的，但这并不是因为 Cpp 已经智能到可以自动推断链表的指针，而是因为这个结构体变量 a 是个数组，数组的地址自然是线性递增的：
```cpp
# include "iostream"

using namespace std;
struct st {
    int n;
    struct st *next;
} a[3] = {5, &a[1], 7, &a[2], 9, NULL}, *p = a;

int main(){
    st * node1 = new st;
    st * node2 = new st;
    st * node3 = new st;

    node1->n=5;
    node1->next=node2;
    node2->n=7;
    node2->next=node3;
    node3->n=9;
    node3->next= nullptr;

    st * p1 = node1;

    cout<<(++p)->n<<endl;
//    cout<<(++p1)->n<<endl;
//    cout<<p->next->n<<endl;
    cout<<p1->next->n<<endl;
}
```
