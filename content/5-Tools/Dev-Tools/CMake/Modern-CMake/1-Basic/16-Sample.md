这是一个简单、完整并且合理的 `CMakeLists.txt` 的例子。对于这个程序，我们有一个带有头文件与源文件的库文件（ MyLibExample ），以及一个带有源文件的应用程序（ MyExample ）。

```
# Almost all CMake files should start with this
# You should always specify a range with the newest
# and oldest tested versions of CMake. This will ensure
# you pick up the best policies.
cmake_minimum_required(VERSION 3.1...3.21)

# This is your project statement. You should always list languages;
# Listing the version is nice here since it sets lots of useful variables
project(
  ModernCMakeExample
  VERSION 1.0
  LANGUAGES CXX)

# If you set any CMAKE_ variables, that can go here.
# (But usually don't do this, except maybe for C++ standard)

# Find packages go here.

# You should usually split this into folders, but this is a simple example

# This is a "default" library, and will match the *** variable setting.
# Other common choices are STATIC, SHARED, and MODULE
# Including header files here helps IDEs but is not required.
# Output libname matches target name, with the usual extensions on your system
add_library(MyLibExample simple_lib.cpp simple_lib.hpp)

# Link each target with other targets or add options, etc.

# Adding something we can run - Output name matches target name
add_executable(MyExample simple_example.cpp)

# Make sure you link your targets with this command. It can also link libraries and
# even flags, so linking a target that does not exist will not give a configure-time error.
target_link_libraries(MyExample PRIVATE MyLibExample)
```

完整的例子可以在此查看 [examples folder](https://github.com/Modern-CMake-CN/Modern-CMake-zh_CN/tree/master/examples/simple-project).

一个更大，并且包含多文件的例子可在此查看 [also available](https://github.com/Modern-CMake-CN/Modern-CMake-zh_CN/tree/master/examples/extended-project).