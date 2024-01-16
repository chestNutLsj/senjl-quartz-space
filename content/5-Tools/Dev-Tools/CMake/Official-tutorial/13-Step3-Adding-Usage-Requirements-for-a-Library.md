## Exercise 1 - Adding Usage Requirements for a Library

[Usage requirements](https://cmake.org/cmake/help/latest/manual/cmake-buildsystem.7.html#target-usage-requirements) of a target parameters allow for far better control over a library or executable's link and include line while also giving more control over the transitive property of targets inside CMake. The primary commands that leverage usage requirements are:

- [`target_compile_definitions()`](https://cmake.org/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions "target_compile_definitions")
    
- [`target_compile_options()`](https://cmake.org/cmake/help/latest/command/target_compile_options.html#command:target_compile_options "target_compile_options")
    
- [`target_include_directories()`](https://cmake.org/cmake/help/latest/command/target_include_directories.html#command:target_include_directories "target_include_directories")
    
- [`target_link_directories()`](https://cmake.org/cmake/help/latest/command/target_link_directories.html#command:target_link_directories "target_link_directories")
    
- [`target_link_options()`](https://cmake.org/cmake/help/latest/command/target_link_options.html#command:target_link_options "target_link_options")
    
- [`target_precompile_headers()`](https://cmake.org/cmake/help/latest/command/target_precompile_headers.html#command:target_precompile_headers "target_precompile_headers")
    
- [`target_sources()`](https://cmake.org/cmake/help/latest/command/target_sources.html#command:target_sources "target_sources")
    

### Goal

Add usage requirements for a library.

### Helpful Materials

- [`CMAKE_CURRENT_SOURCE_DIR`](https://cmake.org/cmake/help/latest/variable/CMAKE_CURRENT_SOURCE_DIR.html#variable:CMAKE_CURRENT_SOURCE_DIR "CMAKE_CURRENT_SOURCE_DIR")
    

### Files to Edit

- `MathFunctions/CMakeLists.txt`
    
- `CMakeLists.txt`
    

### Getting Started

In this exercise, we will refactor our code from [`Adding a Library`](https://cmake.org/cmake/help/latest/guide/tutorial/Adding%20a%20Library.html#guide:tutorial/Adding%20a%20Library "tutorial/Adding a Library") to use the modern CMake approach. We will let our library define its own usage requirements so they are passed transitively to other targets as necessary. In this case, `MathFunctions` will specify any needed include directories itself. Then, the consuming target `Tutorial` simply needs to link to `MathFunctions` and not worry about any additional include directories.

The starting source code is provided in the `Step3` directory. In this exercise, complete `TODO 1` through `TODO 3`.

First, add a call to [`target_include_directories()`](https://cmake.org/cmake/help/latest/command/target_include_directories.html#command:target_include_directories "target_include_directories") in `MathFunctions/CMakeLists`. Remember that [`CMAKE_CURRENT_SOURCE_DIR`](https://cmake.org/cmake/help/latest/variable/CMAKE_CURRENT_SOURCE_DIR.html#variable:CMAKE_CURRENT_SOURCE_DIR "CMAKE_CURRENT_SOURCE_DIR") is the path to the source directory currently being processed.

Then, update (and simplify!) the call to [`target_include_directories()`](https://cmake.org/cmake/help/latest/command/target_include_directories.html#command:target_include_directories "target_include_directories") in the top-level `CMakeLists.txt`.

### Build and Run

Make a new directory called `Step3_build`, run the [`cmake`](https://cmake.org/cmake/help/latest/manual/cmake.1.html#manual:cmake(1) "cmake(1)") executable or the [`cmake-gui`](https://cmake.org/cmake/help/latest/manual/cmake-gui.1.html#manual:cmake-gui(1) "cmake-gui(1)") to configure the project and then build it with your chosen build tool or by using [`cmake --build .`](https://cmake.org/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-build) from the build directory. Here's a refresher of what that looks like from the command line:

```shell
mkdir Step3_build
cd Step3_build
cmake ../Step3
cmake --build .
```

Next, use the newly built `Tutorial` and verify that it is working as expected.

### Solution

Let's update the code from the previous step to use the modern CMake approach of usage requirements.

We want to state that anybody linking to `MathFunctions` needs to include the current source directory, while `MathFunctions` itself doesn't. This can be expressed with an `INTERFACE` usage requirement. Remember `INTERFACE` means things that consumers require but the producer doesn't.

At the end of `MathFunctions/CMakeLists.txt`, use [`target_include_directories()`](https://cmake.org/cmake/help/latest/command/target_include_directories.html#command:target_include_directories "target_include_directories") with the `INTERFACE` keyword, as follows:

> [! todo]- TODO 1: MathFunctions/CMakeLists.txt
> ```cmake 
> target_include_directories(MathFunctions INTERFACE ${CMAKE_CURRENT_SOURCE_DIR})
> ```

Now that we've specified usage requirements for `MathFunctions` we can safely remove our uses of the `EXTRA_INCLUDES` variable from the top-level `CMakeLists.txt`.

Remove this line:

> [!todo]- TODO 2: CMakeLists.txt
> list(APPEND EXTRA_INCLUDES "${PROJECT_SOURCE_DIR}/MathFunctions")

And the lines:

> [! todo]- TODO 3: CMakeLists.txt
> target_include_directories(Tutorial PUBLIC"${PROJECT_BINARY_DIR}")

The remaining code looks like:

> [! todo] Remaining code after removing EXTRA_INCLUDES
> ```cmake
> # add the executable
> add_executable(Tutorial tutorial.cxx)
> target_link_libraries(Tutorial PUBLIC MathFunctions tutorial_compiler_flags)
> 
> # add the binary tree to the search path for include file
> # so that we will find TutorialConfig.htarget_include_directories(Tutorial PUBLIC "${PROJECT_BINARY_DIR}")
>```

Notice that with this technique, the only thing our executable target does to use our library is call [`target_link_libraries()`](https://cmake.org/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries "target_link_libraries") with the name of the library target. In larger projects, the classic method of specifying library dependencies manually becomes very complicated very quickly.

## Exercise 2 - Setting the C++ Standard with Interface Libraries

Now that we have switched our code to a more modern approach, let's demonstrate a modern technique to set properties to multiple targets.

Let's refactor our existing code to use an `INTERFACE` library. We will use that library in the next step to demonstrate a common use for [`generator expressions`](https://cmake.org/cmake/help/latest/manual/cmake-generator-expressions.7.html#manual:cmake-generator-expressions(7) "cmake-generator-expressions(7)").

### Goal

Add an `INTERFACE` library target to specify the required C++ standard.

### Helpful Resources

- [`add_library()`](https://cmake.org/cmake/help/latest/command/add_library.html#command:add_library "add_library")
    
- [`target_compile_features()`](https://cmake.org/cmake/help/latest/command/target_compile_features.html#command:target_compile_features "target_compile_features")
    
- [`target_link_libraries()`](https://cmake.org/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries "target_link_libraries")
    

### Files to Edit

- `CMakeLists.txt`
    
- `MathFunctions/CMakeLists.txt`
    

### Getting Started

In this exercise, we will refactor our code to use an `INTERFACE` library to specify the C++ standard.

Start this exercise from what we left at the end of Step3 exercise 1. You will have to complete `TODO 4` through `TODO 7`.

Start by editing the top level `CMakeLists.txt` file. Construct an `INTERFACE` library target called `tutorial_compiler_flags` and specify `cxx_std_11` as a target compiler feature.

Modify `CMakeLists.txt` and `MathFunctions/CMakeLists.txt` so that all targets have a [`target_link_libraries()`](https://cmake.org/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries "target_link_libraries") call to `tutorial_compiler_flags`.

### Build and Run

Since we have our build directory already configured from Exercise 1, simply rebuild our code by calling the following:

```shell
cd Step3_build
cmake --build .
```

Next, use the newly built `Tutorial` and verify that it is working as expected.

### Solution

Let's update our code from the previous step to use interface libraries to set our C++ requirements.

To start, we need to remove the two [`set()`](https://cmake.org/cmake/help/latest/command/set.html#command:set "set") calls on the variables [`CMAKE_CXX_STANDARD`](https://cmake.org/cmake/help/latest/variable/CMAKE_CXX_STANDARD.html#variable:CMAKE_CXX_STANDARD "CMAKE_CXX_STANDARD") and [`CMAKE_CXX_STANDARD_REQUIRED`](https://cmake.org/cmake/help/latest/variable/CMAKE_CXX_STANDARD_REQUIRED.html#variable:CMAKE_CXX_STANDARD_REQUIRED "CMAKE_CXX_STANDARD_REQUIRED"). The specific lines to remove are as follows:

> [!todo] CMakeLists.txt[] 
> set(CMAKE_CXX_STANDARD 11)
> set(CMAKE_CXX_STANDARD_REQUIRED True)

Next, we need to create an interface library, `tutorial_compiler_flags`. And then use [`target_compile_features()`](https://cmake.org/cmake/help/latest/command/target_compile_features.html#command:target_compile_features "target_compile_features") to add the compiler feature `cxx_std_11`.

>[! todo]- TODO 4: CMakeLists.txt
>add_library(tutorial_compiler_flags INTERFACE)
>target_compile_features(tutorial_compiler_flags INTERFACE cxx_std_11)

Finally, with our interface library set up, we need to link our executable `Target`, our `MathFunctions` library, and our `SqrtLibrary` library to our new `tutorial_compiler_flags` library. Respectively, the code will look like this:

> [!todo]- TODO 5: CMakeLists.txt
> target_link_libraries(Tutorial PUBLIC MathFunctions tutorial_compiler_flags)

this:

>[! todo]- TODO 6: MathFunctions/CMakeLists.txt
>target_link_libraries(SqrtLibrary PUBLIC tutorial_compiler_flags)

and this:

>[! todo]- TODO 7: MathFunctions/CMakeLists.txt
>target_link_libraries(MathFunctions PUBLIC SqrtLibrary)

With this, all of our code still requires C++ 11 to build. Notice though that with this method, it gives us the ability to be specific about which targets get specific requirements. In addition, we create a single source of truth in our interface library.