---
image-auto-upload: false
---
## 更新时的输出信息

```
( 4/96) upgrading glibc                                                                          [#########################################################] 100%
warning: /etc/locale.gen installed as /etc/locale.gen.pacnew
Generating locales...
  en_US.UTF-8... done
Generation complete.
ldconfig: /usr/lib/wsl/lib/libcuda.so.1 is not a symbolic link

(58/96) upgrading pinentry                                                                       [#########################################################] 100%
New optional dependencies for pinentry
    gcr: GNOME backend
    gtk3: GTK backend
    kguiaddons: Qt6 backend
    kwayland5: Qt5 backend
    kwindowsystem: Qt6 backend
    qt5-x11extras: Qt5 backend

(62/96) upgrading pacman-mirrorlist                                                              [#########################################################] 100%
warning: /etc/pacman.d/mirrorlist installed as /etc/pacman.d/mirrorlist.pacnew

(77/96) upgrading systemd                                                                        [#########################################################] 100%
:: This is a systemd feature update. You may want to have a look at
   NEWS for what changed, or if you observe unexpected behavior:
     /usr/share/doc/systemd/NEWS
New optional dependencies for systemd
    libarchive: convert DDIs to tarballs [installed]

(78/96) upgrading pacman                                                                         [#########################################################] 100%
warning: /etc/makepkg.conf.d/rust.conf installed as /etc/makepkg.conf.d/rust.conf.pacnew
warning: /etc/pacman.conf installed as /etc/pacman.conf.pacnew
New optional dependencies for pacman
    base-devel: required to use makepkg

(93/96) upgrading sudo                                                                           [#########################################################] 100%
warning: /etc/sudoers installed as /etc/sudoers.pacnew
(94/96) upgrading systemd-sysvcompat                                                             [#########################################################] 100%
(95/96) upgrading vim-runtime                                                                    [#########################################################] 100%
(96/96) upgrading vim                                                                            [#########################################################] 100%
ldconfig: /usr/lib/wsl/lib/libcuda.so.1 is not a symbolic link
```

安装 fastfetch 时
```
(2/2) installing fastfetch                                                                       [#########################################################] 100%
Optional dependencies for fastfetch
    chafa: Image output as ascii art
    dbus: Bluetooth, Player & Media detection [installed]
    dconf: Needed for values that are only stored in DConf + Fallback for GSettings
    ddcutil: Brightness detection of external displays
    directx-headers: GPU detection in WSL
    glib2: Output for values that are only stored in GSettings [installed]
    hwdata: GPU output [installed]
    imagemagick: Image output using sixel or kitty graphics protocol
    libdrm: Displays detection
    libelf: st term font detection and fast path of systemd version detection [installed]
    libpulse: Sound detection
    libxrandr: Multi monitor support
    mesa: Needed by the OpenGL module for gl context creation.
    ocl-icd: OpenCL module
    python: Needed for zsh and fish completions
    vulkan-icd-loader: Vulkan module & fallback for GPU output
    xfconf: Needed for XFWM theme and XFCE Terminal font
    zlib: Faster image output when using kitty graphics protocol [installed]
```