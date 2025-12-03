## What is OpenCL?

OpenCL（Open Computing Language）是一个开放、免版税的标准，用于跨平台、并行编程各种超级计算机、云服务器、个人计算机、移动设备和嵌入式平台中的加速器。OpenCL 由 Khronos Group 创建和管理。OpenCL 通过使应用程序能够使用系统或设备中的并行处理能力，从而提高应用程序的运行速度和流畅度。

OpenCL 在整个行业中得到广泛应用。许多芯片供应商为其 GPU、DSP 和 FPGA 等处理器提供 OpenCL。OpenCL API 规范使每个芯片都能针对其特定架构进行 OpenCL 驱动程序的调整。在许多系统上提供相同的标准化 API，使开发人员能够广泛部署其应用程序，以覆盖更多客户，同时最大限度地减少移植和支持成本。

![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/widely_used.jpg)

应用程序们能够利用 OpenCL 加速并行编程的功能，大幅提高了各种应用程序、引擎和库的速度和响应能力——包括专业创意工具、科学和医疗软件、视觉处理以及神经网络训练和推理。除了由开发者直接编程外，OpenCL 还越来越多地被用作需要可移植 API 以便将生成的代码传递到硬件加速的语言、编译器和机器学习堆栈的后端目标。

## How Does OpenCL Work?

OpenCL 是一个编程框架和运行时环境，程序员可以使用 OpenCL 创建小型程序，称为内核程序（kernel），这些程序可以被编译并在系统中的任何处理器上并行执行。这些处理器可以是不同类型的任意组合，包括 CPU、GPU、DSP、FPGA 或张量处理器——这就是 OpenCL 所谓的异构并行编程解决方案。

OpenCL 框架包含两个 API。
![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/how_it_works.jpg)
- **平台层 API**（*Platform Layer*）在主机 CPU 上运行，首先用于让程序发现系统中可用的并行处理器或计算设备，通过查询可用的计算设备，应用程序可以在不同的系统上可移植地运行——适应不同的加速器硬件组合。一旦发现计算设备，平台 API 就能启用应用程序选择并初始化它想要使用的设备。
- **运行时 API**（Runtime）使应用程序的 kernel 能够在它们将要运行的计算设备上进行编译、并行地加载到这些处理器上并执行。一旦 kernel 完成执行，就使用运行时 API 来收集结果。

OpenCL C 是用于编写在可用的并行处理器上编译和执行的 kernel 的最常用编程语言。OpenCL C 基于 C99，并作为 OpenCL 规范的一部分进行定义。使用其他编程语言编写的内核可以通过编译到中间件（例如 SPIR-V）来使用 OpenCL 执行。

OpenCL 是一个 low-level 的编程框架，程序员可以直接显式控制内核的运行位置和时间，控制它们使用的内存分配，以及计算设备和主机 CPU 如何同步它们的操作以确保数据和计算结果正确流动——即使主机和计算内核在并行地运行。

### Executing an OpenCL Program

OpenCL 将 kernel 视为可执行代码的基本单元（类似于 C 的一个函数）。内核可以以数据并行或任务并行的方式执行。OpenCL 程序是一组内核和函数的集合（类似于具有运行时链接的动态库）。

OpenCL 命令队列（command queue）由主机应用程序调用，将内核和数据传输函数发送到设备以执行。通过将命令入队到命令队列中，内核和数据传输函数可以异步并行执行，与应用程序主机代码并行。命令队列中的内核和函数可以按顺序或乱序执行。计算设备可以拥有多个命令队列。
![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/executing_programs.jpg)

执行 OpenCL 程序的完整顺序是：
1. 查询可用的 OpenCL 平台和设备
2. 在一个平台中为一个或多个 OpenCL 设备创建上下文
3. 在上下文中为 OpenCL 设备创建和构建程序
4. 从程序中选择要执行的内核
5. 为内核创建用于操作的内存对象
6. 为在 OpenCL 设备上执行命令创建命令队列
7. 将数据传输命令入队到内存对象中（如果需要）
8. 将内核入队到命令队列以执行
9. 将命令入队以将数据传回主机（如果需要）

## Programming OpenCL Kernels

OpenCL 应用程序分为主机代码和设备内核代码。主机代码通常使用 C 或 C++ 等通用编程语言编写，并由传统编译器编译以在主机 CPU 上执行。其他语言也可以与 OpenCL 绑定，例如 Python。

### Online/Offline Compilation

用 OpenCL C 编写的设备内核（基于 C99）可以在应用程序执行期间被 OpenCL 驱动程序摄取和编译，这一过程通过 runtime OpenCL API 调用，称为**在线编译**（online compilation）。OpenCL C 是 ISO C99 的一个子集，具有用于并行性的语言扩展、明确定义的数值精度（IEEE 754 舍入，指定最大误差）以及丰富的内置函数集，包括叉乘、点乘、正弦、余弦、幂、对数等。

![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/opencl_kernels.jpg)

OpenCL 规范还支持离线编译（offline compilation），其中 kernel 被预编译成特定驱动程序可以加载的二进制格式。离线编译有以下显著优势：
- 通过消除或最小化内核代码编译时间来加速 OpenCL 应用程序的执行
- 利用替代的内核语言和工具来生成可执行二进制文件。

离线编译有两种方法：
1. 由驱动程序在线编译的内核可以通过应用程序使用 `clGetProgramInfo` 调用来获取。这些缓存的、设备特定的内核之后可以在同一设备上重新加载以执行，而不是从源代码重新编译这些内核。
2. 离线编译器可以在 OpenCL 应用程序执行之前独立调用，以生成二进制文件，在应用程序执行期间加载并在设备上运行。

![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/online_vs_offline_comp.jpg)


### SPIR-V

早期的 OpenCL 实现主要使用专有二进制格式和驱动程序编译的二进制文件缓存来实现离线编译。然而，特定设备驱动程序中编译器创建的二进制文件无法移植到其他设备，因此使用缓存二进制文件的应用程序失去了通过 OpenCL C 在线编译实现的任何设备的可移植性。为了解决这种可移植性问题，并支持更丰富的语言和编译器生态系统，Khronos 定义了一种跨厂商、可移植的中间程序表示形式，称为 **SPIR-V**。越来越多的 OpenCL 实现支持在 SPIR-V 格式中摄取离线编译的内核程序。

SPIR-V 的作用是使编译器和硅片制造商独立创新。只要是能够生成 SPIR-V kernel 的编译器前端，都可以被任何理解 SPIR-V 格式的 OpenCL 驱动程序摄取和执行。例如，C++ for OpenCL 开源前端和 SYCL 的编译器可以生成 SPIR-V 代码。这两种语言都为 OpenCL 编程扩展了 C++ 功能。虽然 C++ for OpenCL 允许在传统的 OpenCL 内核代码中使用 C++ 特性，但 SYCL 提供了单源 C++ 解决方案，能够同时适用于主机代码和内核代码。目前还有关于在非 C/C++ 语言（例如 Julia）中提供 SPIR-V 支持的工作正在进行中。

SPIR-V 还允许 OpenCL C 和 C++ 编写的 OpenCL 内核由非 OpenCL 的运行时执行，为那些已经投资于 OpenCL 内核编程的开发者提供了更多的部署灵活性。例如，Google 的 clspv 开源编译器可以从 OpenCL C 内核源代码生成 Vulkan SPIR-V 着色器，Microsoft 正在开发一个可以将 OpenCL SPIR-V 内核导入 DX12 的编译器链，并且已经有早期的工作在使用 SPIR-V 工具（如 SPIRV-Cross）将 OpenCL SPIR-V 内核带到 Metal 中，以便在 Apple 平台上执行。

这种多样的 OpenCL 语言生态系统反过来也为特定领域的语言提供了丰富的选择，例如 Halide 图像处理框架，它可以使用源到源的转换或生成 SPIR-V 来编译成 OpenCL C 内核。
![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/opencl_and_spirv.jpg)

## OpenCL Programming Model

### Platform Model

平台模型用于描述 OpenCL 如何理解系统中拓扑连接的计算资源。

主机连接到一个或多个 OpenCL 计算设备。每个计算设备是由一个或多个计算单元组成的集合，其中每个计算单元由一个或多个处理单元组成。处理单元通过 SIMD（单指令多数据）或 SPMD（单程序多数据）并行性执行代码。
![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/platform_model.jpg)
例如，一个计算设备可以是 GPU，计算单元则对应 GPU 内部的流式多处理器（SM），而处理单元对应每个 SM 内部的单个流式处理器（SP）。处理器通常通过共享指令调度和内存资源，将处理单元组合成计算单元，以提高实现效率，并增加处理器间局部通信。

### Execution Model

OpenCL 的 `clEnqueueNDRangeKernel` 命令允许单个内核程序在 N 维数据结构上并行启动。以二维图像为例，图像的大小将是 NDRange，每个像素称为一个工作项（work-item），内核的单个副本将在单个处理单元上运行并操作该工作项。

如在前面的平台模型部分所见，为了提高执行效率，处理器通常将处理单元组块为计算单元。因此，在使用 `clEnqueueNDRangeKernel` 命令时，程序指定工作组（work-group）大小，该大小表示可以在计算单元上容纳的 NDRange 中的单个工作项的组数。同一工作组中的工作项可以共享本地内存，更容易使用工作组屏障进行同步，并使用 `async_work_group_copy` 等工作组函数更高效地协作，这些函数在独立工作组的工作项之间不可用。
![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/ndrange.jpg)

### Memory Model

OpenCL 具有层次结构的内存类型：
![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/memory_model.jpg)
- 主机内存（host）：供主机 CPU 使用
- 全局/常量内存（global/constant）：供计算设备中的所有计算单元使用
- 局部内存（local）：供计算单元中的所有处理单元使用
- 私有内存（private）：仅供单个处理单元使用

OpenCL 内存管理是显式的。以上提到的内存都不会自动同步，因此应用程序需要显式地在不同内存类型之间移动数据。

## C++ for OpenCL

OpenCL 工作组已经从 OpenCL 2.2 中首次定义的原始 OpenCL C++内核语言过渡到社区开发的 [C++ for OpenCL](https://www.iwocl.org/wp-content/uploads/iwocl-syclcon-2020-stulova-13-slides.pdf) 内核语言，该语言提供了改进的功能并兼容 OpenCL C。

C++ for OpenCL 使开发者能够在内核代码中使用大多数 C++功能，同时保留熟悉的 OpenCL 结构、语法和语义。这促进了现有 OpenCL 应用程序对新 C++功能的平滑过渡，并且不需要更改熟悉的开发生命周期或工具。C++ for OpenCL 的主要设计目标是在与 OpenCL C 将 OpenCL 特定概念应用于 C 相同的方式下，将 OpenCL 特定概念应用于 C++。除了少数例外，OpenCL C 是 C++ for OpenCL 的有效子集。总的来说，用 C++ for OpenCL 编写的内核代码看起来就像用 OpenCL C 编写的代码，只是有一些额外的 C++功能可用于方便。C++ for OpenCL 支持 C++17 的功能。

![](https://github.com/KhronosGroup/OpenCL-Guide/blob/main/images/cpp_for_opencl.jpg)

资源：
- 在 [Compiler Explorer ](https://godbolt.org/z/NGZw9U) 中查看支持编译 C++ for OpenCL；
- OpenCL C++的语言文档可以在 [OpenCL-Docs](https://github.com/KhronosGroup/OpenCL-Docs/releases) 的发布版本中找到；

示例：使用 C++ 特性实现使用复数计算的 kernel：
```c++
// This example demonstrates a convenient way to implement
// kernel code with complex number arithmetic using various
// C++ features.

// Define a class Complex, that can perform complex number
// computations with various precision when different
// types for T are used - double, float, half...
template<typename T>
class complex_t {
T m_re; // Real component.
T m_im; // Imaginary component.

public:
complex_t(T re, T im): m_re{re}, m_im{im} {};
complex_t operator*(const complex_t &other) const
{
  return {m_re * other.m_re - m_im * other.m_im,
           m_re * other.m_im + m_im * other.m_re};
}
int get_re() const { return m_re; }
int get_im() const { return m_im; }
};

// A helper function to compute multiplication over
// complex numbers read from the input buffer and
// to store the computed result into the output buffer.
template<typename T>
void compute_helper(global T *in, global T *out) {
  auto idx = get_global_id(0);	
  // Every work-item uses 4 consecutive items from the input
  // buffer - two for each complex number.
  auto offset = idx * 4;
  auto num1 = complex_t{in[offset], in[offset + 1]};
  auto num2 = complex_t{in[offset + 2], in[offset + 3]};
  // Perform complex number multiplication.
  auto res = num1 * num2;
  // Every work-item writes 2 consecutive items to the output
  // buffer.
  out[idx * 2] = res.get_re();
  out[idx * 2 + 1] = res.get_im();
}

// This kernel can be used for complex number multiplication
// in single precision.
kernel void compute_sp(global float *in, global float *out) {
  compute_helper(in, out);
}

// This kernel can be used for complex number multiplication
// in half precision.
#pragma OPENCL EXTENSION cl_khr_fp16: enable
kernel void compute_hp(global half *in, global half *out) {
  compute_helper(in, out); 
}
```

## OpenCL 3.0

OpenCL 3.0 通过使供应商能够专注于客户所需的功能，使 OpenCL 生态系统更加灵活。这是通过将 OpenCL 1.2 以外的所有功能切片为可在 API 中查询的可选功能，并使用宏来指示 OpenCL C 语言的可选功能是否存在来实现的。这种灵活性为新的扩展奠定了基础，这些扩展可以广泛使用并逐步集成到新的 OpenCL 核心规范中。

OpenCL 3.0 正式从 Specification 中移除了 OpenCL C++ 语言，并推荐使用 C++ for OpenCL 前端编译器，供那些希望使用 C++17 编写内核程序的开发者使用。

开发者会发现 OpenCL 3.0 更易于使用，因为它使用一个统一的规范，在一个地方描述了所有版本的 OpenCL，而不是每个版本有单独的规范。这会帮助开发者快速导航，同时也更容易一致地应用规范的修复和澄清。统一的 OpenCL 3.0 规范还描述了规范演进的背景。

OpenCL 3.0 规范的[源代码](https://github.com/KhronosGroup/OpenCL-Docs)托管在 Khronos 的 GitHub 上，方便访问，OpenCL 工作组欢迎社区提交错误报告和 pull request 来帮助改进规范，以便所有人使用。

## Tools for Offline Compilation of OpenCL Kernels

除了在应用程序执行期间进行在线编译外，OpenCL 核心源代码还可以离线编译成可加载到驱动程序中的二进制文件，这需要使用特殊的 API 调用（例如 `clCreateProgramWithBinary` 或 `clCreateProgramWithIL` ）。

有以下开源工具可以使用：
- **clang**：clang 是 C/C++ 语言系列的编译器前端，包括用于 OpenCL 的 OpenCL C 和 C++。它可以生成可执行二进制文件（例如 AMDGPU），或可移植二进制文件（例如 SPIR）。它是 LLVM 编译器基础设施项目的一部分，有关 OpenCL 核心语言支持和标准头文件的信息。
- **SPIRV-LLVM Translator**：SPIRV-LLVM 译码器提供了一个库和 llvm-spirv 工具，用于在 LLVM IR 和 SPIR-V 之间进行双向翻译。
- **clspv 编译器和 clvk 运行时**：使 OpenCL 应用程序能够使用 Vulkan 驱动程序执行。
- **SPIR-V Tools**：SPIR-V 工具提供了一套处理 SPIR-V 二进制文件的实用程序，包括 spirv-opt 优化器、spirv-link 链接器、spirv-dis/spirv-as（反）汇编器和 spirv-val 验证器。

使用这些开源工具，可以将 OpenCL kernel 代码编译为 SPIR-V 格式：
![](https://github.com/KhronosGroup/OpenCL-Guide/raw/main/images/opencl_to_spirv_tooling.jpg)

当工具用于目标 OpenCL 驱动程序时，它们会在 OpenCL 版本的 SPIR-V 上操作，而当工具目标 Vulkan 驱动程序时，它们会在 Vulkan 版本的 SPIR-V 上操作。一些工具可以同时摄取这两种 SPIR-V 方言。然而，通常无法转换或混合不同 SPIR-V 版本的模块。例如，通常无法使用 spirv-link 来链接 OpenCL 和 Vulkan 格式的 SPIR-V 模块。