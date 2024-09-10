### 13-kde 小部件

安装目录位于`~/.local/share/plasma/plasmamoids`。

#### 0300. Panon

直接在KDE商店中下载该插件会缺少很多python依赖，诸如`qt5-websockets python-docopt python-numpy python-pillow python-pyaudio python-cffi python-websockets`，

而万能的Archer在AUR中提交了依赖于`python-soundcard>=0.4.2`的[panon软件包](https://aur.archlinux.org/packages/plasma5-applets-panon)，那么直接从AUR中下载即可：

```shell
yay -S plasma5-applets-panon
```

下载好之后别忘了进行配置，需要修改视觉特效及音频数据源(改为PulseAudio，输入设备选择内置音频，模拟立体声)

如果不是Arch Linux，可以查看这篇[issue](https://github.com/rbn42/panon/issues/78)中的解决办法。