**Note:** This example is valid for single-configuration generators and will not work for multi-configuration generators (e.g. Visual Studio).

By default, CMake's model is that a build directory only contains a single configuration, be it Debug, Release, MinSizeRel, or RelWithDebInfo. It is possible, however, to setup CPack to bundle multiple build directories and construct a package that contains multiple configurations of the same project.

First, we want to ensure that the debug and release builds use different names for the libraries that will be installed. Let's use d as the postfix for the debug libraries.

Set [`CMAKE_DEBUG_POSTFIX`](https://cmake.org/cmake/help/latest/variable/CMAKE_DEBUG_POSTFIX.html#variable:CMAKE_DEBUG_POSTFIX "CMAKE_DEBUG_POSTFIX") near the beginning of the top-level `CMakeLists.txt` file:

>[! todo] CMakeLists.txt
```cmake
set(CMAKE_DEBUG_POSTFIX d)

add_library(tutorial_compiler_flags INTERFACE)
```

And the [`DEBUG_POSTFIX`](https://cmake.org/cmake/help/latest/prop_tgt/DEBUG_POSTFIX.html#prop_tgt:DEBUG_POSTFIX "DEBUG_POSTFIX") property on the tutorial executable:

>[! todo] CMakeLists.txt
```cmake
add_executable(Tutorial tutorial.cxx)
set_target_properties(Tutorial PROPERTIES DEBUG_POSTFIX ${CMAKE_DEBUG_POSTFIX})

target_link_libraries(Tutorial PUBLIC MathFunctions tutorial_compiler_flags)
```

Let's also add version numbering to the `MathFunctions` library. In `MathFunctions/CMakeLists.txt`, set the [`VERSION`](https://cmake.org/cmake/help/latest/prop_tgt/VERSION.html#prop_tgt:VERSION "VERSION") and [`SOVERSION`](https://cmake.org/cmake/help/latest/prop_tgt/SOVERSION.html#prop_tgt:SOVERSION "SOVERSION") properties:

>[! todo] MathFunctions/CMakeLists.txt
```cmake
set_property(TARGET MathFunctions PROPERTY VERSION "1.0.0")
set_property(TARGET MathFunctions PROPERTY SOVERSION "1")
```

From the `Step12` directory, create `debug` and `release` subdirectories. The layout will look like:

```shell
- Step12
   - debug
   - release
```

Now we need to setup debug and release builds. We can use [`CMAKE_BUILD_TYPE`](https://cmake.org/cmake/help/latest/variable/CMAKE_BUILD_TYPE.html#variable:CMAKE_BUILD_TYPE "CMAKE_BUILD_TYPE") to set the configuration type:

```shell
cd debug
cmake -DCMAKE_BUILD_TYPE=Debug ..
cmake --build .
cd ../release
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build .
```

Now that both the debug and release builds are complete, we can use a custom configuration file to package both builds into a single release. In the `Step12` directory, create a file called `MultiCPackConfig.cmake`. In this file, first include the default configuration file that was created by the [`cmake`](https://cmake.org/cmake/help/latest/manual/cmake.1.html#manual:cmake(1) "cmake(1)") executable.

Next, use the `CPACK_INSTALL_CMAKE_PROJECTS` variable to specify which projects to install. In this case, we want to install both debug and release.

>[! todo] MultiCPackConfig.cmake
```cmake
include("release/CPackConfig.cmake")

set(CPACK_INSTALL_CMAKE_PROJECTS
    "debug;Tutorial;ALL;/"
    "release;Tutorial;ALL;/"
    )
```

From the `Step12` directory, run [`cpack`](https://cmake.org/cmake/help/latest/manual/cpack.1.html#manual:cpack(1) "cpack(1)") specifying our custom configuration file with the `config` option:

```shell
cpack --config MultiCPackConfig.cmake
```