Wiki：[Chromium - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/Chromium#%E6%8C%81%E4%B9%85%E5%9C%B0%E5%BA%94%E7%94%A8_flags)

具体操作：

在 `./config/browser_name-flags.conf` 中写入：
```
--ozone-platform=wayland  
--enable-wayland-ime
```

PS. `browser_name` 字段请切换成所用浏览器的名字，如 `chromium`, `microsoft-edge-stable`, `chrome` 等 