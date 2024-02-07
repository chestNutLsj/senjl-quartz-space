```yaml
---

# 语言: None, Cpp, Java, JavaScript, ObjC, Proto, TableGen, TextProto

Language: Cpp

# BasedOnStyle: LLVM

  

# 访问说明符(public、private等)的偏移

AccessModifierOffset: -4

  

# ********************对齐************************

# 开括号(开圆括号、开尖括号、开方括号)后的对齐: Align, DontAlign, AlwaysBreak(总是在开括号后换行)

AlignAfterOpenBracket: Align

# 对齐数组列

AlignArrayOfStructures: None

# 对齐连续宏定义

AlignConsecutiveMacros: None

# 连续赋值时，对齐所有等号

AlignConsecutiveAssignments: None

# 对齐连续位字段

AlignConsecutiveBitFields: None

# 连续声明时，对齐所有声明的变量名

AlignConsecutiveDeclarations: None

# 左对齐逃脱换行(使用反斜杠换行)的反斜杠

AlignEscapedNewlines: Left

# 水平对齐二元和三元表达式的操作数

AlignOperands: Align

# 对齐连续的尾随的注释

AlignTrailingComments: true

  

# ********************换行************************

# 允许构造函数初始化放在下一行

AllowAllConstructorInitializersOnNextLine: true

# 允许函数声明的所有参数在放在下一行

AllowAllParametersOfDeclarationOnNextLine: true

# 允许短的枚举放在同一行

AllowShortEnumsOnASingleLine: true

# 允许短的块放在同一行

AllowShortBlocksOnASingleLine: Never

# 允许短的case标签放在同一行

AllowShortCaseLabelsOnASingleLine: false

# 允许短的函数放在同一行

AllowShortFunctionsOnASingleLine: All

# 允许短的匿名函数放在同一行

AllowShortLambdasOnASingleLine: All

# 允许短的if语句保持在同一行

AllowShortIfStatementsOnASingleLine: Never

# 允许短的循环保持在同一行

AllowShortLoopsOnASingleLine: false

# 总是在定义返回类型后换行

AlwaysBreakAfterDefinitionReturnType: None

# 总是在返回类型后换行

AlwaysBreakAfterReturnType: None

# 总是在多行string字面量前换行

AlwaysBreakBeforeMultilineStrings: false

# 总是在template声明后换行

AlwaysBreakTemplateDeclarations: MultiLine

# 属性宏

AttributeMacros:

- __capability

# false表示函数实参要么都在同一行，要么都各自一行

BinPackArguments: true

# false表示所有形参要么都在同一行，要么都各自一行

BinPackParameters: true

# 大括号换行，只有当BreakBeforeBraces设置为Custom时才有效

BraceWrapping:

AfterCaseLabel: false

AfterClass: true

AfterControlStatement: Never

AfterEnum: false

AfterFunction: false

AfterNamespace: false

AfterObjCDeclaration: false

AfterStruct: false

AfterUnion: false

AfterExternBlock: false

BeforeCatch: false

BeforeElse: false

BeforeLambdaBody: false

BeforeWhile: false

IndentBraces: false

SplitEmptyFunction: true

SplitEmptyRecord: true

SplitEmptyNamespace: true

# 在二元运算符前换行

BreakBeforeBinaryOperators: None

# 在concept前换行

BreakBeforeConceptDeclarations: true

# 在大括号前换行: Attach(始终将大括号附加到周围的上下文)

BreakBeforeBraces: Attach

# 在多项继承逗号前换行

BreakBeforeInheritanceComma: true

# 继承列表样式

BreakInheritanceList: AfterComma

# 在三元运算符前换行

BreakBeforeTernaryOperators: true

# 构造函数初始值前逗号换行

BreakConstructorInitializersBeforeComma: false

# 构造函数初始值设定项换行样式

BreakConstructorInitializers: BeforeComma

# 在java字段的注释后换行

BreakAfterJavaFieldAnnotations: false

# 字符串文字前换行

BreakStringLiterals: false

  

# ********************宽度限制************************

# 每行字符的限制，0表示没有限制

ColumnLimit: 80

# 描述具有特殊意义的注释的正则表达式，它不应该被分割为多行或以其它方式改变

CommentPragmas: "^ IWYU pragma:"

# 在新行上声明每个命名空间

CompactNamespaces: false

# 所有构造函数初始化列表都在一行

ConstructorInitializerAllOnOneLineOrOnePerLine: false

# 构造函数的初始化列表的缩进宽度

ConstructorInitializerIndentWidth: 4

# 延续的行的缩进宽度

ContinuationIndentWidth: 4

# 去除C++11的列表初始化的大括号{后和}前的空格

Cpp11BracedListStyle: true

# 继承最常用的换行方式

DeriveLineEnding: true

# 继承最常用的指针和引用的对齐方式

DerivePointerAlignment: false

# 关闭格式化

DisableFormat: false

# 删除访问修饰符后的所有空行

EmptyLineAfterAccessModifier: Never

# 仅当访问修饰符开始一个新的逻辑块时才添加空行

EmptyLineBeforeAccessModifier: LogicalBlock

# 自动检测函数的调用和定义是否被格式为每行一个参数(Experimental)

ExperimentalAutoDetectBinPacking: false

# 自动补充namespace注释

FixNamespaceComments: true

# 需要被解读为foreach循环而不是函数调用的宏

ForEachMacros:

- foreach

- Q_FOREACH

- BOOST_FOREACH

IfMacros:

- KJ_IF_MAYBE

# 多个#include块合并在一起并排序为一个

IncludeBlocks: Merge

# 可以定义负数优先级从而保证某些#include永远在最前面

IncludeCategories:

- Regex: '^"(llvm|llvm-c|clang|clang-c)/'

Priority: 2

SortPriority: 0

CaseSensitive: false

- Regex: '^(<|"(gtest|gmock|isl|json)/)'

Priority: 3

SortPriority: 0

CaseSensitive: false

- Regex: ".*"

Priority: 1

SortPriority: 0

CaseSensitive: false

IncludeIsMainRegex: "(Test)?$"

IncludeIsMainSourceRegex: ""

  

# ********************缩进************************

# 缩进访问修饰符

IndentAccessModifiers: false

# 缩进case标签

IndentCaseLabels: false

# case 标签后面的块使用与 case 标签相同的缩进级别

IndentCaseBlocks: false

# 缩进goto标签。

IndentGotoLabels: false

# 缩进预处理器指令

IndentPPDirectives: None

# 向后兼容缩进外部块

IndentExternBlock: AfterExternBlock

# 缩进模板中的requires子句

IndentRequires: false

# 缩进宽度

IndentWidth: 4

# 函数返回类型换行时，缩进函数声明或函数定义的函数名

IndentWrappedFunctionNames: false

# 插入尾随逗号

InsertTrailingCommas: None

# 保留JavaScript字符串引号

JavaScriptQuotes: Leave

# 包装 JavaScript 导入/导出语句

JavaScriptWrapImports: true

# 保留在块开始处的空行

KeepEmptyLinesAtTheStartOfBlocks: true

# 相对于 lambda 签名对齐 lambda 主体

LambdaBodyIndentation: Signature

# 开始一个块的宏的正则表达式

MacroBlockBegin: ""

# 结束一个块的宏的正则表达式

MacroBlockEnd: ""

# 连续空行的最大数量

MaxEmptyLinesToKeep: 1

# 命名空间的缩进

NamespaceIndentation: Inner

  

# ********************ObjC************************

ObjCBinPackProtocolList: Auto

# 使用ObjC块时缩进宽度

ObjCBlockIndentWidth: 4

ObjCBreakBeforeNestedBlockParam: true

# 在ObjC的@property后添加一个空格

ObjCSpaceAfterProperty: false

# 在ObjC的protocol列表前添加一个空格

ObjCSpaceBeforeProtocolList: true

PenaltyBreakAssignment: 2

PenaltyBreakBeforeFirstCallParameter: 19

PenaltyBreakComment: 300

PenaltyBreakFirstLessLess: 120

PenaltyBreakString: 1000

PenaltyBreakTemplateDeclaration: 10

PenaltyExcessCharacter: 1000000

PenaltyReturnTypeOnItsOwnLine: 60

PenaltyIndentedWhitespace: 0

# 指针的对齐: Left, Right, Middle

PointerAlignment: Right

# 缩进预处理器语句的列数

PPIndentWidth: -1

# 引用的对齐

ReferenceAlignment: Pointer

# 允许重新排版注释

ReflowComments: true

# 短命名空间跨越的最大展开行数

ShortNamespaceLines: 1

# 允许排序#include

SortIncludes: CaseSensitive

# java静态导入放在非静态导入之前

SortJavaStaticImport: Before

# 对using声明排序

SortUsingDeclarations: true

# 在C风格类型转换后添加空格

SpaceAfterCStyleCast: false

# 在!后添加空格

SpaceAfterLogicalNot: false

# 在Template关键字后添加空格

SpaceAfterTemplateKeyword: true

# 在赋值运算符之前添加空格

SpaceBeforeAssignmentOperators: true

# 不在case冒号之前添加空格

SpaceBeforeCaseColon: false

# 不在C++11大括号列表之前添加空格

SpaceBeforeCpp11BracedList: false

# 在构造函数初始化器冒号之前添加空格

SpaceBeforeCtorInitializerColon: true

# 在继承冒号前添加空格

SpaceBeforeInheritanceColon: true

# 开圆括号之前添加一个空格: Never, ControlStatements, Always

SpaceBeforeParens: ControlStatements

# 不要确保指针限定符周围有空格，而是使用 PointerAlignment

SpaceAroundPointerQualifiers: Default

# 在基于范围的for循环冒号之前添加空格

SpaceBeforeRangeBasedForLoopColon: true

# {}中间添加空格

SpaceInEmptyBlock: false

# 在空的圆括号中添加空格

SpaceInEmptyParentheses: false

# 在尾随的评论前添加的空格数(只适用于//)

SpacesBeforeTrailingComments: 2

# 在尖括号的<后和>前添加空格

SpacesInAngles: Never

# 不在if/for/switch/while条件周围插入空格

SpacesInConditionalStatement: false

# 在容器(ObjC和JavaScript的数组和字典等)字面量中添加空格

SpacesInContainerLiterals: true

# 在C风格类型转换的括号中添加空格

SpacesInCStyleCastParentheses: false

# 行注释开头允许有多少个空格。要禁用最大值，请将其设置为-1，除此之外，最大值优先于最小值

SpacesInLineCommentPrefix:

Minimum: 1

Maximum: -1

# 在圆括号的(后和)前添加空格

SpacesInParentheses: false

# 在方括号的[后和]前添加空格，lamda表达式和未指明大小的数组的声明不受影响

SpacesInSquareBrackets: false

# 不在[前添加空格

SpaceBeforeSquareBrackets: false

# 位域:每边都添加空格

BitFieldColonSpacing: Both

# 标准

Standard: Cpp11

# 在语句前面被忽略的宏定义，就好像它们是一个属性一样

StatementAttributeLikeMacros:

- Q_EMIT

# 应该被解释为完整语句的宏定义

StatementMacros:

- Q_UNUSED

- QT_REQUIRE_VERSION

# tab宽度

TabWidth: 4

# 使用\n换行

UseCRLF: false

# 使用tab字符：ForIndentation——仅将制表符用于缩进

UseTab: ForIndentation

# 对空格敏感的宏定义

WhitespaceSensitiveMacros:

- STRINGIZE

- PP_STRINGIZE

- BOOST_PP_STRINGIZE

- NS_SWIFT_NAME

- CF_SWIFT_NAME
```