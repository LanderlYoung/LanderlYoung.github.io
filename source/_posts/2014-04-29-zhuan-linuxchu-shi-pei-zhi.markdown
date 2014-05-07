---
layout: post
title: "[转]Linux初始配置"
date: 2014-04-29 10:11:07 +0800
comments: true
categories: [Linux]
tags: [转贴]
---
转载自：<a target="_blank" href="http://www.2cto.com/Article/201304/200418.html">http://www.2cto.com/Article/201304/200418.html</a>

昨天折腾了 Kali Linux 1.0，把大概的配置过程记录下来，希望对想接触或使用Kali Linux的同学有所帮助。 
 
<!--more-->
请注意： 
 
1.本文为<strong>面向新手的教程</strong>，没技术含量，没事瞎折腾，感觉好玩…..如果您可以熟练使用Debian Linux或者使用过Arch Linux、Gentoo或者是自己LFS你完全可以无视本文。 
 
2.如果您使用kali Linux只作为渗透测试之用，rootoorotor建议您在kali.org直接<a target="_blank" href="http://www.2cto.com/soft" class="keylink" style="color:rgb(51, 51, 51); text-decoration:none">下载</a>Kali Linux VMware版本在虚拟机里使用（当然双系统也可以）。 
 
3.如果您只是想试用或者感受Linux桌面环境，我建议您先使用Ubuntu 、LinuxMint、Deepin Linux 、 Fedora、Debian、OpenSUSE这几个发行版。 
 
4.如果您是一名信息安全爱好者，并且对GNU/Linux有过一点点使用经验，<strong>想使用Kali Linux作为日常学习和使用</strong>，那么本文你适合你参考哦~ 
 
5.rootoorotor接触GNU/Linux发行版的时间不长，也是个新手。如果发现本文有疏漏，欢迎提醒！在下感激不尽~ 
 
6.kali Linux中的各种hacking软件本文不做讨论 
 
Kali Linux 介绍： 
 
http://cn.docs.kali.org/category/introduction-cn 
 
（官方文档） 
 
Kali Linux 下载： 
 
http://www.kali.org/downloads/ 
 
安装Kali Linux： 
 
请参考官方文档，以及在线搜索“Deiban Linux安装教程”或者 “Debian windows 双系统”。 
 
比如： http://wenku.baidu.com/view/2b5b3149767f5acfa1c7cd51.html 
 
强烈建议参考官方在线文档： 
 
http://cn.docs.kali.org/category/installing-kali-linux-cn 
 
没有Linux安装经验的朋友建议先用虚拟机折腾 
 
rootoorotor下载的是kali Linux 1.0 64位版本，在安装好之后就会进入kali linux默认的桌面环境(gnome-fallback)，如图所示： 
 
{% img center http://www.2cto.com/uploadfile/2013/0405/20130405053037648.png 345 614 %}
 
然后打开终端，输入 
 
`cat /etc/apt/sources.list`  
 
看看里面有没有一下三行kali官方源的地址（如果是断网安装，kali的默认源可能不会写入到这个文件里），如果没有，请在`/etc/apt/sources.list`中入这三行。
 
``` cpp
deb http://http.kali.org/kali kali main non-free contrib
deb-src http://http.kali.org/kali kali main non-free contrib
deb http://security.kali.org/kali-security kali/updates main contrib non-free
```
 
加入之后就可以对系统进行更新了，终端中输入： 
 
``` cpp
apt-get update &amp;&amp; apt-get dist-upgrade
```
 
安装BCM43XX系列无线网卡驱动： 
 
由于我的本本比较渣，kali 默认不识别我的无线网卡（博通 BCM 4312） 
 
``` cpp
aptitude install firmware-b43-lpphy-installer
```

关于BCM43XX系列的无线网卡驱动请参考Debian官方文档： 
 
http://wiki.debian.org/bcm43xx 
 
安装完成之后重启在终端中输入： 
 
*iwconfig*
 
看无线网卡是不是已经识别 
 
安装英伟达显卡驱动请参考我上一篇博文： 
 
Kali Linux 1.0安装NVIDIA显卡驱动 
 
<strong>中文化：</strong> 
 
Kali Linux的国际化做得真心不错，安装时如果你选择了中文语言，进入系统之后已经发现汉化完成了。如果安装时没有选择中文那么请参考一下的方法吧系统语言设置成中文： 
 
点击右上角root —— System Settings —— Region and Language —— 点击“+”按键 —— Chinese（china） —— Select —— Chinese（simplified），重启电脑即可。 
 
如果还不行也有可能是中文包没有安装，在终端中运行： 
 
``` cpp
dpkg-reconfigure locales
```
 
汉化浏iceweasel<a target="_blank" href="http://www.2cto.com/os/liulanqi/" class="keylink" style="color:rgb(51, 51, 51); text-decoration:none">浏览器</a>（Firefox） 
 
``` cpp
apt-get install iceweasel-l10n-zh-cn
```
 
在提示框中往下拉，开头位zh_CN的全部选择，然后确定，r然后在设置本地中文语言环境时选择 zh_CN.GBK 或者 zh_CN.UTF-8 确定，如果提示已经安装请，按照第一步的办法进入System Settings设置为中文。 
 
<strong>输入法安装：</strong> 
 
ibus: 
 
``` cpp
apt-get install ibus ibus-pinyin
```
 
或者 
 
fcitx 
 
``` cpp
apt-get install fcitx fcitx-pinyin fcitx-module-cloudpinyin fcitx-googlepinyin
```
 
安装完成之后，打开终端输入： 
 
``` cpp 
im-config
```
 
确认手工配置，选择你喜欢的输入法，如图： 
 
 
{% img center http://www.2cto.com/uploadfile/2013/0405/20130405053039870.png 440 610 %}
然后重启系统~ 
 
如果你使用的是ibus： 
 
右键点击右上角的输入法图标 —— 首选项 —— 输入法+中文 —— 高级——勾上所有程序共享使用同一个输入法 
 
如果你使用的是fcitx（小企鹅）： 
 
小企鹅无需做过多配置，重启过后即可用。当然你也可以点击小企鹅输入法的托盘图标，做一些输入法的配置，比如字体、皮肤和云输入提示等 
 
我个人比较喜欢fcitx，因为带云输入，感觉也比ibus流畅。 
 
<strong>建立普通用户<span style="color:rgb(255, 0, 0)">（非必要）：</span></strong> 
 
Kali Linux 与 Backtrack Linux一样，默认直接使用root用户，如果你想和其他Linux发行版一样使用普通用户请按照下面的步骤操作： 
 
<strong>1、建立一个普通用户：</strong> 
 
打开终端： 
 
``` cpp
adduser 用户名
```
 
如图所示： 
 
{% img center http://www.2cto.com/uploadfile/2013/0405/20130405053040253.png 415 745 %}
 
在终端下输入： 
 
``` cpp
visudo
```
 
按i之后进入编辑模式（插入），然后在文件的 root ALL=(ALL:ALL) ALL 的下方添加一个新的sudo用户例如XXX用户：XXX&nbsp;&nbsp; ALL=(ALL:ALL) 
 
（ALL在文件visudo中被定义授予用户所有的命令权限） 
 
如图所示： 
 
{% img center http://www.2cto.com/uploadfile/2013/0405/20130405053041263.png 514 659 %}
 
完成后按Esc键进入命令行模式，键入:w来保存 
 
保存之后新建立就可以使用sudo命令了，重启或者注销来切换成新建立的用户即可。 
 
（注意：使用普通用户时，默认的权限是比较低的，以至于一些程序无法正常运行，这是需要使用sudo命令来执行，比如sudo apt-get update，或者使用su命令在终端中切换至root用户之后执行） 
 
然后把原有/root/目录下的配置文件复制到新建立的用户目录下（/home/新建立的用户名），并修改所有者为新建立的用户 
 
终端中输入（root权限）： 
 
``` cpp
cp -rf /root/. /home/新用户名
 
chown -R 新用户名:新用户名 /home/新用户名
```
 
这样普通用户的配置就完成了。 
 
开启Gnome 3的标准模式：
 
Kali Linux的桌面环境已经升级为Gnome 3，但默认运行在fallback模式。想<strong>临时</strong>切换成gnome3的标准模式请在终端输入： 
 
``` cpp
gnome-shell –replace

```
 
gnome 3的标准模式支持一些桌面特效开启还有很多gnome-shell插件，如果您觉得比较好用请输入下面的命令使系统在启动时，自动进入gnome-shell的标准模式。 
 
``` cpp
gsettings set org.gnome.desktop.session session-name gnome
```
 
若想还原默认的桌面请输入： 
 
``` cpp 
gsettings set org.gnome.desktop.session session-name gnome-fallback
```
 
注销或者重启之后进入桌面即可直接进入您要切换的模式。 
 
关于如何定制gnome，请参考： 
 
[archlinux wiki](https://wiki.archlinux.org/index.php/GNOME_%28%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%29)
 
另外，如果您实在不喜欢gnome-shell桌面环境，可以参考这里或者自行上网搜索 
 
[kali linux doc](http://cn.docs.kali.org/live-build-cn/%E5%AE%9A%E5%88%B6kali%E7%9A%84%E6%A1%8C%E9%9D%A2%E7%B3%BB%E7%BB%9F)
 
<strong>一些常用软件：</strong> 
 
1.官方源中的软件（可以通过apt-get install直接安装）： 
 
``` cpp
apt-get install gnome-tweak-tool 
 
（gnome-shell管理软件可以修改字体、管理插件、管理桌面主题。必备！） 
 
apt-get install gdebi 
 
(有了这个安装软件就不用在终端中dpkg -i 安装了，提供图形化软件安装方式) 
 
apt-get install nautilus-open-terminal 
 
(鼠标右键在当前目录打开终端) 
 
apt-get install flashplugin-nonfree 
 
（浏览器flash插件） 
 
apt-get install synaptic 
 
（新立得软件包管理器） 
 
apt-get install file-roller 
 
（压缩文件管理工具） 
 
apt-get install amule 
 
（电骡） 
 
apt-get install remmina* 
 
（远程桌面+扩展） 
 
apt-get install geany 
 
（一个轻巧的IDE，如果您喜欢折腾emacs或者VIM就不用安装这个了） 
 
apt-get install bluefish 
 
（一个强大的Web编辑器） 
 
apt-get install&nbsp; meld 
 
（一款可视化的文件及目录对比、合并工具） 
 
apt-get install audacious<br>
（一个轻量级音乐播放器） 
```
 
3.安装QQ2012： 
 
Kali Linux 1.0 （64位）安装 QQ2012 
 
4.安装WPS office for Linux： 
 
Kali Linux 1.0 （64位）安装WPS office for Linux 
 
5.Virtualbox<a target="_blank" href="http://www.2cto.com/os/xuniji/" class="keylink" style="color:rgb(51, 51, 51); text-decoration:none">虚拟机</a>： 
 
使用前要先 
 
``` cpp
apt-get install libqt4-opengl 
```
 
https://www.virtualbox.org/wiki/Linux_Downloads 
 
Gnome3有扩展系统，可以在线安装扩展， 
 
Gnome Extensions网站 
 
<strong>一些美化工作：</strong> 
 
进入标准模式之后，鼠标往屏幕左上角一戳即可打开程序窗口，点击全部程序会看到很多满屏幕的黑龙图标，感觉略丑 
 
如图： 
 
{% img  center http://www.2cto.com/uploadfile/2013/0405/20130405053042483.png 440 614 %}
 
如果想隐藏图标，可以打开系统工具——主菜单 来选择隐藏，如果您再使用这个工具时没有看见Kali Linux菜单, 请下载我修改好的文件放入 /home/你的用户名/.config/menus 文件夹，然后使用组合键alt+F2输入r ——回车，既可重启gome-shell 
 
然后在重新打开系统工具——主菜单即可，去掉构√即可隐藏图标： 
 
下载地址：http://dl.vmall.com/c09noj4d81 
 
（注意：“.”开头的目录或文件是隐藏的，按ctrl+H才可查看，或者在终端中输入 ls -a） 
 
{% img center http://www.2cto.com/uploadfile/2013/0405/20130405053044953.png 364 446 %}
 
##安装Faenza图标：

``` cpp
wget http://faenza-icon-theme.googlecode.com/files/faenza-icon-theme_1.3.zip
 
unzip faenza-icon-theme_1.3.zip
 
chmod u+x INSTALL
 
./INSTALL
```
 
然后根据提示安装即可，安装完成之后使用gnome-tweak-tool工具更换图标： 
 
{% img center http://www.2cto.com/uploadfile/2013/0405/20130405053045872.png 499 643 %}
 
<strong>优化字体显示：</strong> 
 
Kali Linux的默认中文字体显示已经比较不错了，但我个人还是喜欢文泉驿的字体。 
 
`apt-get install ttf-wqy-microhei ttf-wqy-zenhei xfonts-wqy`
 
安装完成之后打开这个网页 
 
[http://wenq.org/cloud/fcdesigner.html]()
 
把你喜欢的字体优先级调到最高，然后点击”生成“保存成.fonts.conf文件放入home/你的用户名目录下，最好root目录下也拷贝一份，因为有些程序是以root账户来运行的。 
 
最后在gnome-tweak-tool工具中更改字体 
 
关于Deiban字体显示优化，可以看看 [这里](http://edyfox.codecarver.org/html/debian_testing_chinese.html)
 
如果通过以上设置的字体显示效果还无法满足你的需求，你可以折腾Debian的字体渲染Infinality补丁（在Fedora下很出名的字体渲染补丁，渲染效果极好） 
 
使用这个补丁之前，请先apt-get install devscripts 安装包构建脚本 ，然后根据dpkg-checkbuilddeps中显示缺少什么依赖就用apt-get 安装什么，步骤比较简单本文就不做详细描述了 
 
[debian forums](http://forums.debian.net/viewtopic.php?f=16&t=88545)
 
渲染之后的显示效果截图： 
 
{% img center http://www.2cto.com/uploadfile/2013/0405/20130405053046521.png" 544 587 %}
 
<strong>修改启动分辨率：</strong> 
 
感觉启动引导菜单和tty的分辨率比较蛋疼？按照如下方法修改即可： 
 
（root权限运行） 
 
1.使用编辑器编辑/etc/default/grub 这个文件 
 
比如我使用vim 
 
`vim /etc/default/grub`
 
找到 #GRUB_GFXMODE=640×480&nbsp; 取消这一行前面的注释符“#”并将后面的数字修改为一个合适的值，不需要太高，比如1024×768。这个值同时会影响grub启动菜单和控制台里文字的分辨率。 
 
2.修改 /etc/grub.d/00_header 这个文件 
 
`vim /etc/grub.d/00_header`
查找关键字`set gfxmode=${GRUB_GFXMODE}`，然后在这行下面添加新行， 内容是：`set gfxpayload=keep`
 
3.更新Grub配置 
 
`update-grub`
 
<strong>总结：</strong> 
 
如果使用Kali&nbsp;<a target="_blank" href="http://www.2cto.com/os/linux/" class="keylink" style="color:rgb(51, 51, 51); text-decoration:none">Linux</a>用与日常使用统，按照以上的配置也差不多了，以后我会继续补充。 
 
到此为止，Kali Linux的桌面环境基本折腾完成，上图： 
 
{% img center  http://www.2cto.com/uploadfile/2013/0405/20130405053047828.png 345 614 %}
 
{% img center http://www.2cto.com/uploadfile/2013/0405/20130405053049272.png 345 614 %}
