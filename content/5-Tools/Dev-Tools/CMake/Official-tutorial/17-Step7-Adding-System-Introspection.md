Let us consider adding some code to our project that depends on features the target platform may not have. For this example, we will add some code that depends on whether or not the target platform has the `log` and `exp` functions. Of course almost every platform has these functions but for this tutorial assume that they are not common.

## Exercise 1 - Assessing Dependency Availability

### Goal

Change implementation based on available system dependencies.

### Helpful Resources

- [`CheckCXXSourceCompiles`](https://cmake.org/cmake/help/latest/module/CheckCXXSourceCompiles.html#module:CheckCXXSourceCompiles "CheckCXXSourceCompiles")
    
- [`target_compile_definitions()`](https://cmake.org/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions "target_compile_definitions")
    

### Files to Edit

- `MathFunctions/CMakeLists.txt`
    
- `MathFunctions/mysqrt.cxx`
    

### Getting Started

The starting source code is provided in the `Step7` directory. In this exercise, complete `TODO 1` through `TODO 5`.

Start by editing `MathFunctions/CMakeLists.txt`. Include the [`CheckCXXSourceCompiles`](https://cmake.org/cmake/help/latest/module/CheckCXXSourceCompiles.html#module:CheckCXXSourceCompiles "CheckCXXSourceCompiles") module. Then, use `check_cxx_source_compiles` to determine whether `log` and `exp` are available from `cmath`. If they are available, use [`target_compile_definitions()`](https://cmake.org/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions "target_compile_definitions") to specify `HAVE_LOG` and `HAVE_EXP` as compile definitions.

In the `MathFunctions/mysqrt.cxx`, include `cmath`. Then, if the system has `log` and `exp`, use them to compute the square root.

### Build and Run

Make a new directory called `Step7_build`. Run the [`cmake`](https://cmake.org/cmake/help/latest/manual/cmake.1.html#manual:cmake(1) "cmake(1)") executable or the [`cmake-gui`](https://cmake.org/cmake/help/latest/manual/cmake-gui.1.html#manual:cmake-gui(1) "cmake-gui(1)") to configure the project and then build it with your chosen build tool and run the `Tutorial` executable.

This can look like the following:

```shell
mkdir Step7_build
cd Step7_build
cmake ../Step7
cmake --build .
```

Which function gives better results now, `sqrt` or `mysqrt`?

### Solution

In this exercise we will use functions from the [`CheckCXXSourceCompiles`](https://cmake.org/cmake/help/latest/module/CheckCXXSourceCompiles.html#module:CheckCXXSourceCompiles "CheckCXXSourceCompiles") module so first we must include it in `MathFunctions/CMakeLists.txt`.

>[! todo]- TODO 1: MathFunctions/CMakeLists.txt
>include(CheckCXXSourceCompiles)

Then test for the availability of `log` and `exp` using `check_cxx_compiles_source`. This function lets us try compiling simple code with the required dependency prior to the true source code compilation. The resulting variables `HAVE_LOG` and `HAVE_EXP` represent whether those dependencies are available.

>[! todo] TODO 2: MathFunctions/CMakeLists.txt
```cmake
  check_cxx_source_compiles("
    #include <cmath>
    int main() {
      std::log(1.0);
      return 0;
    }
  " HAVE_LOG)
  check_cxx_source_compiles("
    #include <cmath>
    int main() {
      std::exp(1.0);
      return 0;
    }
  " HAVE_EXP)
```

Next, we need to pass these CMake variables to our source code. This way, our source code can tell what resources are available. If both `log` and `exp` are available, use [`target_compile_definitions()`](https://cmake.org/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions "target_compile_definitions") to specify `HAVE_LOG` and `HAVE_EXP` as `PRIVATE` compile definitions.

>[! todo] TODO 3: MathFunctions/CMakeLists.txt
```cmake
  if(HAVE_LOG AND HAVE_EXP)
    target_compile_definitions(SqrtLibrary
                               PRIVATE "HAVE_LOG" "HAVE_EXP"
                               )
  endif()

  target_link_libraries(MathFunctions PRIVATE SqrtLibrary)
endif()
```

Since we may be using `log` and `exp`, we need to modify `mysqrt.cxx` to include `cmath`.

>[! todo]- TODO 4: MathFunctions/mysqrt.cxx
> ```c
> #include "cmath"
>```

If `log` and `exp` are available on the system, then use them to compute the square root in the `mysqrt` function. The `mysqrt` function in `MathFunctions/mysqrt.cxx` will look as follows:

>[! todo] TODO 5: MathFunctions/mysqrt.cxx
```c
#if defined(HAVE_LOG) && defined(HAVE_EXP)
  double result = std::exp(std::log(x) * 0.5);
  std::cout << "Computing sqrt of " << x << " to be " << result
            << " using log and exp" << std::endl;
#else
  double result = x;

  // do ten iterations
  for (int i = 0; i < 10; ++i) {
    if (result <= 0) {
      result = 0.1;
    }
    double delta = x - (result * result);
    result = result + 0.5 * delta / result;
    std::cout << "Computing sqrt of " << x << " to be " << result << std::endl;
  }
#endif
```
