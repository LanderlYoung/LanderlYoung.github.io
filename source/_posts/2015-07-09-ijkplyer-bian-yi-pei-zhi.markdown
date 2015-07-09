---
layout: post
title: "ijkplyer 编译配置"
date: 2015-07-09 03:53:18 -0700
comments: true
categories: [linux]
tags: [bilibili,ijkplyer]
---

#IjkMediaPlayer 使用手册

>taylorcyang@tencent.com


1. 首先编译环境是OS X或者linux或者其他\*nix系统（Windows暂不支持，因为ijkplayer中使用了软链接o(╯□╰)o）。
2. 其次系统中需要安装以下工具：
    1. git
    2. Android ndk 并配置环境变量 `ANDROID_NDK`
    3. Android sdk 并配置环境变量 `ANDROID_SDK`

项目地址：[https://github.com/Bilibili/ijkplayer]()


**note**:

如果你觉得TL;DR。不想知道ijkmediaplayer是怎么编译的那就执行`./init.sh`脚本。让他来帮你做初始化（就是下面的1-3步），然后使用`./make.sh`做编译甚至是编译之后so的拷贝工作，下文就不用看了。

三个需要的文件分别是：

1. [init.sh](https://gist.github.com/LanderlYoung/046f4b90b0da26484d5e)
2. [make.sh](https://gist.github.com/LanderlYoung/63d4c59260bce20c4a0f)
3. [module.sh](https://gist.github.com/LanderlYoung/a28ddb1fb1e575be91ec)

<!--more-->

##编译步骤：

###1. 下载代码

```bash
git clone https://github.com/Bilibili/ijkplayer.git

```

###2. 切换到稳定分支

在开发视频播放组件时ijkplayer的稳定版本是n0.2.2因此本手册以n0.2.2为实例。若发布新版本可以切换分支并测试兼容性。可以使用`git tag`命令查看release版本。

```bash
git checkout -B n_0.2.2 n0.2.2

```

###3. 初始化

首先进入工程根目录

```bash
cd ijkplayer

```

然后执行

```bash
./init-android.sh

```

执行初始化操作：包括下载ffmpeg源代码，配置ffmpeg编译选项，下载。


**注意**：n0.2.2版本的ffmpeg仓库换成了videolan的，如果发现不能下载可以把init-android.sh中的

```bash
IJK_FFMPEG_UPSTREAM=git://git.videolan.org/ffmpeg.git

```

替换成

```bash
IJK_FFMPEG_UPSTREAM=https://github.com/bbcallen/FFmpeg.git

```

然后再进行初始化操作。

这里初始化会生成ffmpeg编译配置文件，主要配置需要哪些组件。因为android端希望尽量减小so库的大小，因此会disable掉很多组件。这里可以使用我准备的这个module.sh文件覆盖掉 项目根目录下的config/module.sh文件。

这个module.sh文件已经去处了绝大部分不用的组件，并且启用了硬件加速。

###4. 编译

进入项目根目录下的android目录

```bash
cd android
```

编译 ffmpeg 依赖库。由于大多数设备都为 armv7a 架构，故在这里使用之。使用 armv5|armv7a|x86 作为输入来设定平台，或传入 all|clean|check 进行[编译所有平台/清理/检查]。
```bash
./compile-ffmpeg.sh clean
./compile-ffmpeg.sh armv7a
```

若报错，请检查以上各项配置是否正确；否则耐心等待编译完毕即可。

接下来就可以编译 ijkplayer 了：
```bash
./compile-ijk.sh

```

##使用ijkplayer

android目录下的ijkmediaplayer就是ijk播放器的本体了，编译完成之后会在libs目录中生成相应的so动态库。这时候只需要把这些库拷到工程目录的ijkmdediaplayer module的libs下就好了。

当然你可以把整个android目录导入Android Studio，作者已经写好了gradle配置，这里是一个demo工程。它有三个module：



1. ijkmediademo是demo本体，是个很好的教学示例
2. ijkmediaplayer就是播放器了，这里是一个library module
3. ijkmediawidget是基于ijkmediaplayer的各种控件，主要提供类似VideoView的控件方便使用。当然这个是可选组件。



如果看到这说明你很有研究精神，给自己点个赞吧n(*≧▽≦*)n


###附录-关于module.sh

module.sh中配置了ffmpeg使用哪些decoder，demuser等信息。我给的模板中配置了如下信息

####解码器
| 解码器 | 支持格式 |
| :----: | :----: |
| aac、aac\_latm | aac 音频 |
| ac3 | ac3 音频 |
| mp3\* | mp3 音频|
| flv | flv 视频 |
| h263、h263i、h263p | h263 视频（可以考虑舍弃）|
| h264 | h264 视频（重要！）|
| msmpeg4v\_crystalhd、msmpeg4v1、msmpeg4v2、msmpeg4v3 | wmv 视频 |
| wmav1、wmav2、wmavoice | wmv 音频 |

###解容器
| 解容器 | 支持容器格式 |
| :---: | : -------: |
| aac | aac 音频容器 |
| ac3 | ac3 音频容器 |
| flv | flv 视频容器 |
| hls | HTTP Live Streaming |
| latm | aac latm封装格式|
| live\_flv |直播 flv格式|
| loas| aac loas封装格式|
| m4v | m4v/mp4 视频 |
| mov | mov 视频 |
| mp3| mp3 音频|
|matroska | mkv 视频|
|avi | avi 视频|
|mpegps、mpegts、mpegvideo| mpeg封装格式|
|asf | wmv 格式|

