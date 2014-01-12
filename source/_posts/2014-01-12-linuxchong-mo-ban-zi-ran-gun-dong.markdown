---
layout: post
title: "linux触摸板自然滚动"
date: 2014-01-12 20:11:36 +0800
comments: true
categories: [linux]
---

触摸板的自然滚动最早是乔帮主发明的。 

所谓自然滚动是指触摸板双指滚动的功能，当用两个手指向上滑动触摸板时，屏幕向上滚动，当双指向下化时，屏幕向下滚动。若是反过来就和鼠标一样了。自然滚动让人觉是得在用爽指控制屏幕而不是在控制触摸板。  

开始觉得反人类，谁知道用习惯了才知道那真的很爽！爽到不想再用鼠标了。但是在linux系统里面触摸板还不是自然滚动。

我是synaptics的触摸板，方法一对其他触摸板不见得管用。如果不是synaptics的触摸板貌似也有利用xorg来改的方法，在文章后面再介绍。

###1. synaptics 触摸板
首先要安装synapclient的驱动：`xserver-xorg-input-synaptics`。
其实在大多数linux系统内动已经默认按装了。
<pre>
sudo apt-get install xserver-xorg-input-synaptics
</pre>
然后你可以用两个命令来设置垂直滚动和水平滚动的`速度`:
<pre>
synclient VertScrollDelta=-103
synclient HorizScrollDelta=-103
</pre>
这里把速度设置成负值意思就是让触摸板按照与原来方向的相反方向移动。需要说明的是数值的绝对值越大滚动越慢。 

然后我们就达到目的了。为了让这两个命令开机的之后就能自动执行可以

 1. 把他们加到home目录里的`.bashrc`文件里。
 2. 或者在`/etc/profile.d/`里面创建一个脚本，比如我建立的是  
`/etc/profile.d/synaptics\_natural\_scrolling.sh`
``` cpp
###################################################################
# File Name:		/etc/profile.d/synaptics_natural_scrolling.sh
# Author:			Landerl Young
# e-Mail:			LanderlYoung@gmail.com
# Created Time:		Thu 31 Oct 2013 01:41:46 PM HST
###################################################################
#!/bin/bash
synclient VertScrollDelta=-103
synclient HorizScrollDelta=-103

```
最后别忘了加可执行权限
<pre>
sudo chmod a+x /etc/profile.d/synaptics_natural_scrolling.sh
</pre>
大功告成。

### 2. 其他方法（所有触摸板通用）
xorg有个`xinput`命令。如果，我是说如果，你没有这个命令的话，我帮你查好了它所在的软件包名——`xinput`：
<pre>
young@Y470:~/Documents/octopress$dpkg -S /usr/bin/xinput 
xinput: /usr/bin/xinput
</pre>
输入之后（不加任何参数），有如下输出：

``` cpp
young@Y470:~/Documents/octopress$xinput
⎡ Virtual core pointer						id=2	[master pointer  (3)]
⎜   ↳ Virtual core XTEST pointer				id=4	[slave  pointer  (2)]
⎜   ↳ SynPS/2 Synaptics TouchPad				id=14	[slave  pointer  (2)]
⎣ Virtual core keyboard						id=3	[master keyboard (2)]
    ↳ Virtual core XTEST keyboard				id=5	[slave  keyboard (3)]
    ↳ Power Button								id=6	[slave  keyboard (3)]
    ↳ Video Bus									id=7	[slave  keyboard (3)]
    ↳ Power Button								id=8	[slave  keyboard (3)]
    ↳ Sleep Button								id=9	[slave  keyboard (3)]
    ↳ Video Bus									id=10	[slave  keyboard (3)]
    ↳ Lenovo EasyCamera							id=12	[slave  keyboard (3)]
    ↳ AT Translated Set 2 keyboard				id=13	[slave  keyboard (3)]
    ↳ Ideapad extra buttons						id=15	[slave  keyboard (3)]
    ↳ ACPI Virtual Keyboard Device				id=16	[slave  keyboard (3)]
```

这里面就是各个输入设备了，看名字就猜得出来。可以使用`xinput --get-button-map <设备名>`显示按键映射，显示如下：

<pre>
young@Y470:~/Documents/octopress$xinput --get-button-map "SynPS/2 Synaptics TouchPad" 
1 2 3 4 5 6 7 8 9 10 11 12 
</pre>

于是下面要做的事就很明显了——改按键映射！既然有个`--get-button-map`参数肯定也有`--set-button-map`，没错，看了man手册发现真的有。经过测试各个按键的功能发现如下：
4、5、6、7四个值是控制触摸板滚动方向的，修改如下：
<pre>
young@Y470:~/Documents/octopress$xinput --set-button-map "SynPS/2 Synaptics TouchPad" 1 2 3 5 4 7 6 8 9 10 11 12
</pre>
为了使命令开机自动执行，可以使用方法一中介绍的两个方法。

当然方法二放在后面说是因为他有缺点——在一些少数程序比如文件管理器`nautilus`里面自然滚动失效的T\^T。
