---
layout: post
title: "用git下载单个分支"
date: 2014-01-06 16:45:34 +0800
comments: true
categories: [git, octpress搬迁编辑位置]
---

最近在玩octpress。开始一直在我的Debian系统里面玩的，后来因为一夹些软件必须在windows下面跑，只能在虚拟机里写博客了。然后就打算把github上的网页项目下载下来。但是这个项目有点不一样。github.io的博客项目有两个分支，master和source;其实他们根本不是分支的概念，没有什么交集的。在octpress项目文件夹里面是source分支里的内容，除了\_deploy目录内的东西是用gitignore忽略的，\_deploy里面的内容就是master分支的东西了。

所以我的需求是把两个分支单独下载下来，开始的方案失败（其实是不完美），后来搜了好多东西在stackoverflow上面找到了解决方案。
<!--more-->

---

 1.新建一个文件夹，假设名字是blog

 2.cd进去输入
``` cpp
	git init
```

 3.配置git，比如 
``` cpp
	git remote add origin git@xxx
```

 4.然后是
``` cpp
	git fetch origin
```
   把仓库的状态取回来

 5.因为_deploy目录里面也是这个项目，所以索性把.git目录复制进去
``` cpp
	cp -r .git _deploy/
```

 6.然后是下载分支，可以使用 
``` cpp
	git branch -b branch_name origin/source
```
   从source分支新建一个分支。或者简单点，用：
``` cpp
	git branch -t origin/source
```
   直接吧source分支搞下来，其作用等同于
``` cpp
	git branch -b source origin/source
```

 7.cd 到_deploy目录，干同样的事：
``` cpp
	git branch -t origin/source
```
---

这样两个分支就放到了不同的目录里面，接着按照octpress官方教程安装jekyll和rake等就可以开始博客了！

对了，顺便提一句。Debian里不允许使用gem安装ruby软件，只能使用apt安装bundler之类的东西。不过我在fedoral和基于Ubuntu的Deepin Linux上都没发现这个问题。

