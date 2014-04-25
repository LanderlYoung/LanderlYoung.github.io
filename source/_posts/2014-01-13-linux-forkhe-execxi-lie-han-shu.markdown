---
layout: post
title: "linux fork和exec系列函数"
date: 2014-01-13 00:31:29 +0800
comments: true
categories: [ linux ]
tags: [linux]
---
linux 中的[fork][0]和[exec][2]函数是进程相关的两个函数，最早在大二的操作系统课上了解到。今天要写个小东西偶尔用到就研究了一下。
## 1.fork
fork的功能是创建一个和进程完全一样的子进程。完全的意思是指子进程的堆和栈和父进程是完全相同的。在子进程创建完成时，子进程和父进程共享内存。但是一旦共享的内存区域要被写入时（不管是父进程要写还是子进程要写）这块区域就会从父进程的进程空间复制到子进程，然后再执行写入。这就是通常说的[copy on write][1]，目的很明显，就是要节省不必要的内存消耗 。

<!--more-->

这一点在安卓的虚拟机孵化进程zygote被使用，zygote在开机时就把所有系统java类的字节码加载到内存，当一个app启动时zygote就fork一下然后fork的子进程去执行app。这样所有app可以调用系统class而整个系统的内存中只有一份系统类，可以很大程度的节省内存, 同时也加快了app的启动。  


linux系统中的所有进程都是init进程fork出来的，查看的话可以发现他的pid是1, 是系统内所有进程的父进程（或者祖先进程）。其实init也有个pid为0的父进程，开机完成后就不存在了，本文不涉及这方面。

fork包含在<unistd.h>头文件中， 其原型是：` pid_t fork(void)`其中pid\_t是进程pid的数据结构，可以被cast成int等类型，当frok成功时在父进程中的返回值是子进程的pid, 子进程中是0, 若没能创建子进程则返回负值。

写个小程序看看：

``` cpp
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>//for exit()

int main(void) {
	pid_t pid;
	printf("parent pid:%d\n", getpid());
	if(pid = fork()) {
		// pid != 0, in parent process
		printf("in parent child pid:%d\n", pid);
		exit(0);
	}

	//in child process
	printf("I\'m Child process.\n"
			"My pid :%d, parent pid:%d\n",
			getpid(), getppid());

	return 0;
}
```

编译运行看看

``` cpp
young@Y470:~/Desktop$gcc f.c -o f
young@Y470:~/Desktop$./f
parent pid:8627
in parent child pid:8628
I'm Child process.
My pid :8628,  parent pid:8627
```
getpid()返回当前进程的pid，getppid（）返回父进程的pid。

这里在fork之后通过返回值知道自己是父进程还是子进程，然后通过if判断进行流程控制，父、子进程各自执行自己的任务。

## 2.exec系列函数
刚才说道linux系统内所有进程都是init进程的子孙进程，但是可能会让人不解：“这样的话所有进程不都是一样的吗”。这里我们要用到exec系列函数了。

exec系列函数在执行时会首先清空当前进程（调用exec函数的进程）的栈和堆等内存空间。然后创建新的空间。但是进程的pid和父进程等信息不会变。

exec系列函数有一下几个：

``` cpp
int execl(char const *path,  char const *arg0,  ...);
int execle(char const *path,  char const *arg0,  ...,  char const *envp);
int execlp(char const *file,  char const *arg0,  ...);
int execv(char const *path,  char const *argv);
int execve(char const *path,  char const *argv,  char const *envp);
int execvp(char const *file,  char const *argv);
```

可以看出来他们的后缀不一样，各个后缀的含义是：

<pre>
e - 给函数传入一个环境变量`environment virables`来搜索可执行文件
l - 命令的参数通过函数的参数一一传入`list`方式
p - 使用系统环境变量PATH搜索可执行文件
v - 命令的参数通过一个数组`vector`传入
</pre>

需要说明的是：

 1. 如果使用带`l`的函数，即execl、execle、execlp应该在参数列表最后传入一个NULL标记参数完毕。
 2. 如果是带v的函数就应该在数组的最后一项设置成NULL标记数组的完毕。
 3. 并且arg0（就是第一个参数）通常情况下都是可执行文件自身的名字，否则可能会导致函数调用失败，<a name="list"></a>当然也有特例，为了行文通畅，放到<a href="#appendix"> 最后</a>再说。
 4.  如果使用带有e的函数那么环境变量数组envp的最后也要有NULL标记数组的结束。
 5. 实验证明对于带有e的函数在传入正确的envp的前提下还要写对正确的路径，否则不能执行。

函数返回0表示正常。

写个小程序试试看：

``` cpp
#include <stdio.h>
#include <unistd.h>
int main() {
	printf("process pid: %d\n", getpid());
	execlp("./child", "child", NULL);
	printf("hello\n");
	return 0;
}
```

编译执行：
``` cpp
young@Y470:~/Desktop$./a
process pid: 12369
pid: 12369
```
执行了`./child`命令，第一行输出是原进程的输出，第二行输出是新进程（不是子进程）child的输出，注意printf没有执行。那是因为exec函数执行是清理了当强进程的内存空间整个进程可以说是直接换成了child进程。这个child是一个小程序，代码如下：

``` cpp
#include <stdio.h>
#include <unistd.h>
int main(void) {
	printf("pid: %d\n", getpid());
	return 0;
}
```
通过这段代码我们也可以证明，**exec创建的进程和调用进程pid一样**。

然后我们写个程序测试并说明上述所有exec函数的用法：

``` cpp
#include <stdio.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
	char c = argv[1][0];
	pid_t p;
	char* m_argv[] = {
		"echo", "echo", "Hello world", NULL, 
	};
	char *envp[] = {
		"/usr/bin", 
		"/bin", 
		NULL, 
	};

	printf("parent pid: %d\n", getpid());


	switch (c){
		case '1':
			if (!fork()) {
				printf("from execl pid: %d\n", getpid());
				execl("/bin/echo", "echo", "Hello world", NULL);
			}
			break;
		case '2':
			if (!fork()) {
				printf("from execle pid: %d\n", getpid());
				execle("/bin/echo", "echo", "Hello world", NULL, envp);
			}
			break;
		case '3':
			if (!fork()) {
				printf("from execlp pid: %d\n", getpid());
				execlp("echo", "echo", "Hello world", NULL);
			}
			break;
		case '4':

			if (!fork()) {
				printf("from execv pid: %d\n", getpid());
				execv("/bin/echo", m_argv);
			}
			break;
		case '5':
			if (!fork()) {
				printf("from execve pid: %d\n", getpid());
				execve("/bin/echo", m_argv, envp);
			}
			break;
		default:
			if (!fork()) {
				printf("from execvp pid: %d\n", getpid());
				execvp("echo", m_argv);
			}
	}
	return 0;
}
```

编译执行看看能不能出来结果：

``` cpp 
young@Y470:~/Desktop$for ((i = 1; i < 7; i++));do ./exec_test $i; echo ;done
parent pid: 11046
from execl pid: 11047

Hello world
parent pid: 11048
from execle pid: 11049

Hello world
parent pid: 11050
from execlp pid: 11051

Hello world
parent pid: 11052
from execv pid: 11053

echo Hello world
parent pid: 11054
from execve pid: 11055

echo Hello world
parent pid: 11056
from execvp pid: 11057

echo Hello world
```
共六个hello world，虽然有点乱，不过也是没办法的事，谁让人家来自不同进程呢！想想也够吊的，六个hello world来六个自不同进程。

这里也展示了**如何开启一个进程**，就是fork之后在子进程执行exec。

##3.附录
<a name="appendix"></a>
在<a href="#list">上面</a>说到arg0和可执行文件名不一样的情况。比如大家读知道的busybox就这一个例子。

在c/c++语言中main函数想使用命令行参数的话就得使用下面的声明方式：
<pre>
int main(int argc, char *argv[])
</pre>
在程序执行是，argc至少是1, 所以argv[0]始终有值，他就是程序调用的可执行文件的名字。比如ls命令他的argv[0]始终都是“ls“。不妨写个程序测试：

``` cpp
#include <stdio.h>
int main(int argc, char *argv[]) {
	printf("%s\n", argv[0]);
	return 0;
}
```
编译执行，请看仔细：

``` cpp
young@Y470:~/Desktop$make name
cc     name.c   -o name
young@Y470:~/Desktop$./name
./name
young@Y470:~/Desktop$ln -s name some
young@Y470:~/Desktop$./some
./some
young@Y470:~/Desktop$/home/young/Desktop/name 
/home/young/Desktop/name
young@Y470:~/Desktop$../Desktop/name 
../Desktop/name
```

想必你已经看明白了，我也不用多解释了。当我们使用软链接时，argv[0]的名字就是软链接的名字。busybox就是对自身设置了好多软链接比如:`ln -s busybox ls`这样再调用ls时，argv[0]就是”ls“这样就能知道用户的目的然后执行ls的功能。

最后在写个程序测试一下：

``` cpp

#include <stdio.h>
#include <unistd.h>

int main(void) {
	if(!fork()) {
		execlp("busybox", "busybox", NULL);
	}
	if(!fork()) {
		//arg0 和可执行文件名不一样
		execlp("busybox", "ls", "-l", NULL);
	}
	return 0;
}
```

看一下结果：
``` cpp
young@Y470:~/Desktop/busy$Copyright (C) 1998-2011 Erik Andersen,  Rob Landley,  Denys Vlasenko
and others. Licensed under GPLv2.
See source distribution for full notice.

Usage: busybox [function] [arguments]...
   or: busybox --list[-full]
   or: busybox --install [-s] [DIR]
   or: function [arguments]...

	BusyBox is a multi-call binary that combines many common Unix
	utilities into a single executable.  Most people will create a
					…………
	cttyhack,  cut,  date,  dc,  -rwxr-xr-x    1 young    young       697656 Jan 13 03:29 busybox
dd,  -rwxr-xr-x    1 young    young         6935 Jan 13 03:35 t
deallocvt,  -rw-r--r--    1 young    young          476 Jan 13 03:35 t.c
depmod,  df-rw-r--r--    1 young    young            0 Jan 13 03:30 ??
,  diff, 
					…………
```
busybox 的输出太长了，我删掉了一部分并用省略号标记。可以看到ls的输出（夹杂在busybox之间，因为是两个进程的输出）。

大功告成，没想到好好写一篇博客需要3个小时！！！困死我了，怒睡！

[0]: http://en.wikipedia.org/wiki/Fork_(system_call)
[1]: http://en.wikipedia.org/wiki/Fork_(system_call)
[2]: http://en.wikipedia.org/wiki/Exec_(operating_system)
