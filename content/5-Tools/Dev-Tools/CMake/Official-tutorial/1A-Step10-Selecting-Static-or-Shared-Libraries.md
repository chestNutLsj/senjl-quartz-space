In this section we will show how the [`BUILD_SHARED_LIBS`]( https://cmake.org/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS "BUILD_SHARED_LIBS") variable can be used to control the default behavior of [`add_library()`]( https://cmake.org/cmake/help/latest/command/add_library.html#command:add_library "add_library"), and allow control over how libraries without an explicit type (`STATIC`, `SHARED`, `MODULE` or `OBJECT`) are built.

To accomplish this we need to add [`BUILD_SHARED_LIBS`](https://cmake.org/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS "BUILD_SHARED_LIBS") to the top-level `CMakeLists.txt`. We use the [`option()`](https://cmake.org/cmake/help/latest/command/option.html#command:option "option") command as it allows users to optionally select if the value should be `ON` or `OFF`.

>[!todo]- CMakeLists.txt
>option(BUILD_SHARED_LIBS "Build using shared libraries" ON)

Next, we need to specify output directories for our static and shared libraries.

>[! todo]- CMakeLists.txt
> ```cmake
> set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY "${PROJECT_BINARY_DIR}")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${PROJECT_BINARY_DIR}")
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${PROJECT_BINARY_DIR}")
>```

option(BUILD_SHARED_LIBS "Build using shared libraries" ON)

Finally, update `MathFunctions/MathFunctions.h` to use dll export defines:

>[! todo] MathFunctions/MathFunctions.h
```cpp
#if defined(_WIN32)
#  if defined(EXPORTING_MYMATH)
#    define DECLSPEC __declspec(dllexport)
#  else
#    define DECLSPEC __declspec(dllimport)
#  endif
#else // non windows
#  define DECLSPEC
#endif

namespace mathfunctions {
double DECLSPEC sqrt(double x);
}
```

At this point, if you build everything, you may notice that linking fails as we are combining a static library without position independent code with a library that has position independent code. The solution to this is to explicitly set the [`POSITION_INDEPENDENT_CODE`](https://cmake.org/cmake/help/latest/prop_tgt/POSITION_INDEPENDENT_CODE.html#prop_tgt:POSITION_INDEPENDENT_CODE "POSITION_INDEPENDENT_CODE") target property of SqrtLibrary to be `True` when building shared libraries.

>[! todo] MathFunctions/CMakeLists.txt
> ```cmake
>target_link_libraries(MathFunctions PUBLIC tutorial_compiler_flags)
># define the symbol stating we are using the declspec(dllexport) when
># building on windows
target_compile_definitions(MathFunctions PRIVATE "EXPORTING_MYMATH")
> ```

**Exercise**: We modified `MathFunctions.h` to use dll export defines. Using CMake documentation can you find a helper module to simplify this?