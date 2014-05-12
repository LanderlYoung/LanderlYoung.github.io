---
layout: post
title: "Git中创建tag和release"
date: 2014-05-12 21:28:57 +0800
comments: true
categories: [git]
tags: [git]
---
今天开始学习Android Design，也详细了解一下Android的应用开发，方便暑假的实习。于是打算创建一个github的仓库，记录学习的过程。然后想到没学习一个新功能都应该有一个tag（或者叫release）不然别人看你的仓库的时候怎么知道一学习的步步过程。然后就学习了一下git tag的相关内容，如下：

<!--more-->
##创建
 * 这个很简单`git tag -a <tagname> -m "comment"` 或者`git tag -a <tagname>`和commit差不多只是多了一个tagname，使用后面那个命令会打开一个文本编辑器写入comment信息。总的来说 和commit是一样的。
 * 轻量级tag，输入`git tag <tagname>`。

##列出所有tag
 * `git tag`会直接列出当前可用tag。
 * `git tag -l "pattern"`列出tagname符合正则表达式的所有tag。

##查看tag信息
 * `git show <tagname>`会列出tag的相关信息，包括tagname，打tag时写入的comment信息，以及diff信息。

##push tag
 * `git push origin --tags`

##删除tag
 1. 删除本地tag`git tag -d <tagname>`。
 2. 删除远端tag`git push origin :refs/tags/<tagname>`, 这个命令和删除远端branches很神似。

以上只说了一些简单的操作，还有是用签名的tag，这些就比较复杂一点了，更多内容请参考：[git-scm.com](http://git-scm.com/book/en/Git-Basics-Tagging)
