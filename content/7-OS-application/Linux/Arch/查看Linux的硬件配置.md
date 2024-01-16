## 全局查看
使用`screenfetch`或`neofetch`工具查看全局硬件配置：
```shell
$ neofetch
```
![[neofetch.png]]
值得一提的是，`screenfetch`在执行时会有一则消息报错，看样子是读取内存信息时出错，而`neofetch`没有这样的情况出现。

## 查看当前用户
```shell
$ whoami
lsjarch
```

## 查看系统特定信息
```shell
$ uname --help
用法：uname [选项]...  
输出特定的系统信息。如果不带 <选项>，则视为使用了 -s 选项。  
  
 -a, --all                按如下次序输出所有信息，其中若 -p 和 -i 的  
                            探测结果为未知，则省略：  
 -s, --kernel-name        输出内核名称  
 -n, --nodename           输出网络节点的主机名  
 -r, --kernel-release     输出内核发行号  
 -v, --kernel-version     输出内核版本号  
 -m, --machine            输出主机的硬件架构名称  
 -p, --processor          输出处理器类型（不可移植）  
 -i, --hardware-platform  输出硬件平台（不可移植）  
 -o, --operating-system   输出操作系统名称  
     --help               显示此帮助信息并退出  
     --version            显示版本信息并退出

$ uname -a
Linux LsjsArch 5.19.3-arch1-1 #1 SMP PREEMPT_DYNAMIC Sun, 21 Aug 2022 18:55:22 +0000 x86_64 GNU/Linux
```

## 查看硬盘逻辑分卷
```shell
$ sudo lvdisplay
```

## 查看CPU详细信息
```shell
$ lscpu
架构：                   x86_64  
 CPU 运行模式：         32-bit, 64-bit  
 Address sizes:         39 bits physical, 48 bits virtual  
 字节序：               Little Endian  
CPU:                     12  
 在线 CPU 列表：        0-11  
厂商 ID：                GenuineIntel  
 型号名称：             Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz  
   CPU 系列：           6  
   型号：               158  
   每个核的线程数：     2  
   每个座的核数：       6  
   座：                 1  
   步进：               10  
   CPU(s) scaling MHz:  64%  
   CPU 最大 MHz：       4500.0000  
   CPU 最小 MHz：       800.0000  
   BogoMIPS：           5202.65  
   标记：               fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse ss  
                        e2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc art arch_perfmon pebs bts rep_good nopl xtopol  
                        ogy nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx est tm2 ssse3 sdbg fma cx16 xtp  
                        r pdcm pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm 3  
                        dnowprefetch cpuid_fault epb invpcid_single pti ssbd ibrs ibpb stibp tpr_shadow vnmi flexpriority ept vp  
                        id ept_ad fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid mpx rdseed adx smap clflushopt intel_pt x  
                        saveopt xsavec xgetbv1 xsaves dtherm ida arat pln pts hwp hwp_notify hwp_act_window hwp_epp md_clear flu  
                        sh_l1d arch_capabilities  
Virtualization features:    
 虚拟化：               VT-x  
Caches (sum of all):        
 L1d:                   192 KiB (6 instances)  
 L1i:                   192 KiB (6 instances)  
 L2:                    1.5 MiB (6 instances)  
 L3:                    12 MiB (1 instance)  
NUMA:                       
 NUMA 节点：            1  
 NUMA 节点0 CPU：       0-11  
Vulnerabilities:            
 Itlb multihit:         KVM: Mitigation: VMX disabled  
 L1tf:                  Mitigation; PTE Inversion; VMX conditional cache flushes, SMT vulnerable  
 Mds:                   Mitigation; Clear CPU buffers; SMT vulnerable  
 Meltdown:              Mitigation; PTI  
 Mmio stale data:       Mitigation; Clear CPU buffers; SMT vulnerable  
 Retbleed:              Mitigation; IBRS  
 Spec store bypass:     Mitigation; Speculative Store Bypass disabled via prctl  
 Spectre v1:            Mitigation; usercopy/swapgs barriers and __user pointer sanitization  
 Spectre v2:            Mitigation; IBRS, IBPB conditional, RSB filling, PBRSB-eIBRS Not affected  
 Srbds:                 Mitigation; Microcode  
 Tsx async abort:       Not affected
```

## 查看内存
```shell
$ free -h
              total        used        free      shared  buff/cache   available  
内存：       15Gi       4.1Gi       3.5Gi       1.0Gi       7.8Gi        10Gi  
交换：      4.0Gi          0B       4.0Gi
```

若要进一步查看，可以使用：
```shell
$ sudo dmidecode -q -t memory
Physical Memory Array  
       Location: System Board Or Motherboard  
       Use: System Memory  
       Error Correction Type: None  
       Maximum Capacity: 64 GB  
       Number Of Devices: 4  
  
Memory Device  
       Total Width: 64 bits  
       Data Width: 64 bits  
       Size: 8 GB  
       Form Factor: SODIMM  
       Set: None  
       Locator: ChannelA-DIMM0  
       Bank Locator: BANK 0  
       Type: DDR4  
       Type Detail: Synchronous  
       Speed: 2667 MT/s  
       Manufacturer: 8945  
       Serial Number: 08080808  
       Asset Tag: 9876543210  
       Part Number: GKE800SO102408-2666A  
       Rank: 1  
       Configured Memory Speed: 2667 MT/s  
       Minimum Voltage: 1.2 V  
       Maximum Voltage: 1.2 V  
       Configured Voltage: 1.2 V  
  
Memory Device  
       Total Width: Unknown  
       Data Width: Unknown  
       Size: No Module Installed  
       Form Factor: Unknown  
       Set: None  
       Locator: ChannelA-DIMM1  
       Bank Locator: BANK 1  
       Type: Unknown  
       Type Detail: None  
  
Memory Device  
       Total Width: 64 bits  
       Data Width: 64 bits  
       Size: 8 GB  
       Form Factor: SODIMM  
       Set: None  
       Locator: ChannelB-DIMM0  
       Bank Locator: BANK 2  
       Type: DDR4  
       Type Detail: Synchronous  
       Speed: 2667 MT/s  
       Manufacturer: 8945  
       Serial Number: 08080808  
       Asset Tag: 9876543210  
       Part Number: GKE800SO102408-2666A  
       Rank: 1  
       Configured Memory Speed: 2667 MT/s  
       Minimum Voltage: 1.2 V  
       Maximum Voltage: 1.2 V  
       Configured Voltage: 1.2 V  
  
Memory Device  
       Total Width: Unknown  
       Data Width: Unknown  
       Size: No Module Installed  
       Form Factor: Unknown  
       Set: None  
       Locator: ChannelB-DIMM1  
       Bank Locator: BANK 3  
       Type: Unknown  
       Type Detail: None
```

## 查看主机信息
```shell
$ hostnamectl
Static hostname: LsjsArch  
      Icon name: computer  
     Machine ID: 3031c4762ec04c72a59063045d3c8db1  
        Boot ID: 255917684d204a19b05eb221ee136f2f  
Operating System: Arch Linux                         
         Kernel: Linux 5.19.3-arch1-1  
   Architecture: x86-64  
Hardware Vendor: MECHREVO  
 Hardware Model: Z2-G Series GK5CP6Z  
Firmware Version: N.1.06
```