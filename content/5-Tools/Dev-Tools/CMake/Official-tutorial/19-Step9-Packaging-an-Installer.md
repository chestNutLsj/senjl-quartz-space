Next suppose that we want to distribute our project to other people so that they can use it. We want to provide both binary and source distributions on a variety of platforms. This is a little different from the install we did previously in [`Installing and Testing`]( https://cmake.org/cmake/help/latest/guide/tutorial/Installing%20and%20Testing.html#guide:tutorial/Installing%20and%20Testing "tutorial/Installing and Testing"), where we were installing the binaries that we had built from the source code. In this example we will be building installation packages that support binary installations and package management features. To accomplish this we will use CPack to create platform specific installers. Specifically we need to add a few lines to the bottom of our top-level `CMakeLists.txt` file.

>[!todo]- CMakeLists.txt
> ```cmake
>include(InstallRequiredSystemLibraries)
set(CPACK_RESOURCE_FILE_LICENSE "${CMAKE_CURRENT_SOURCE_DIR}/License.txt")
set(CPACK_PACKAGE_VERSION_MAJOR "${Tutorial_VERSION_MAJOR}")
set(CPACK_PACKAGE_VERSION_MINOR "${Tutorial_VERSION_MINOR}")
set(CPACK_SOURCE_GENERATOR "TGZ")
include(CPack)
>```

That is all there is to it. We start by including [`InstallRequiredSystemLibraries`](https://cmake.org/cmake/help/latest/module/InstallRequiredSystemLibraries.html#module:InstallRequiredSystemLibraries "InstallRequiredSystemLibraries"). This module will include any runtime libraries that are needed by the project for the current platform. Next we set some CPack variables to where we have stored the license and version information for this project. The version information was set earlier in this tutorial and the `License.txt` has been included in the top-level source directory for this step. The [`CPACK_SOURCE_GENERATOR`](https://cmake.org/cmake/help/latest/module/CPack.html#variable:CPACK_SOURCE_GENERATOR "CPACK_SOURCE_GENERATOR") variable selects a file format for the source package.

Finally we include the [`CPack module`](https://cmake.org/cmake/help/latest/module/CPack.html#module:CPack "CPack") which will use these variables and some other properties of the current system to setup an installer.

The next step is to build the project in the usual manner and then run the [`cpack`](https://cmake.org/cmake/help/latest/manual/cpack.1.html#manual:cpack(1) "cpack(1)") executable. To build a binary distribution, from the binary directory run:

```shell
cpack
```

To specify the generator, use the [`-G`](https://cmake.org/cmake/help/latest/manual/cpack.1.html#cmdoption-cpack-G) option. For multi-config builds, use [`-C`](https://cmake.org/cmake/help/latest/manual/cpack.1.html#cmdoption-cpack-C) to specify the configuration. For example:

```shell
cpack -G ZIP -C Debug
```

For a list of available generators, see [`cpack-generators(7)`](https://cmake.org/cmake/help/latest/manual/cpack-generators.7.html#manual:cpack-generators(7) "cpack-generators(7)") or call [`cpack --help`](https://cmake.org/cmake/help/latest/manual/cpack.1.html#cmdoption-cpack-h). An [`archive generator`](https://cmake.org/cmake/help/latest/cpack_gen/archive.html#cpack_gen:CPack%20Archive%20Generator "CPack Archive Generator") like ZIP creates a compressed archive of all _installed_ files.

To create an archive of the _full_ source tree you would type:

```shell
cpack --config CPackSourceConfig.cmake
```

Alternatively, run `make package` or right click the `Package` target and `Build Project` from an IDE.

Run the installer found in the binary directory. Then run the installed executable and verify that it works.