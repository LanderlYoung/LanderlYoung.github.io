---
layout: post
title: "一次对非静态内部类引用final变量的研究"
date: 2014-08-10 13:57:38 +0800
comments: true
categories: [Android]
tags: [Android, Java]
---

前几天遇到一个奇怪的问题，问题的起因是我把以前的RingfriendDialogBuilder（以下简称builder，没有IDE的自动补全打完全名还是很长的。。）修改了一下，添加了一个clear()方法。目的是避免每次创建一个Dialog都new一个builder的实例，这样一个builder可以用于创建多个dialog，以提高效率。接下来的问题就是因为这个修改导致的。

<!--more-->

##描述现象
这个DialogBuilder允许构建Dialog，set其中的标题，监听器之类的变量。然后clear掉所有设置，重新再重新构建一个Dialog。问题出现在构建的多个（> 1）Dialog之后，当某个Dialog显示出来时，点击其按钮时，会出现NullPointerException。

##定位Bug：
起初我觉得这很奇怪，因为每一个Dialog明明都设置了回调函数的呀。然后看到create方法其中一个setOnClickListener的代码段。
因为Dialong中的内容是普通的View，而Dialog的Listener与View的Listener不同，因此代码中做了如下adapt：

<a name="anonymousClass"></a>
```java
if (mNegativeButtonLinstener != null) {
    negBtn.setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View v) {
		mNegativeButtonLinstener.onClick(mDialog, DialogInterface.BUTTON_NEGATIVE);
        }
    });
}
```
因为dialog的onclick需要传入dialog自身的引用，所以就很 「随意」的把builder的mDialog成员传了过来，这个mDialog是在create的时候new出来的新的Dialog：

``` java
//定义
private Dialog mDialog;
//创建
mDialog = new Dialog(mContext, mTheme);
```
此时我突然明白了，因为内部匿名类的onClick回调函数使用了外部类（《java编程思想》中称作 enclosing object that made it）的成员变量 mDialog，所以每次onClick，内部类都会resolve外部类的这个成员变量。然而这是不应该发生的，因为：

> **当一个dialog被create之后，builder还有可能再创建一个dialog，或者builder的clear方法可能被调用，其会恢复所有成员变量至默认值，包括设置mDialog为null。所以当某个dialog的按钮被按下时，外部类的mDialog成员可能已经被修改，而不再对应这个dialog。**

##解决方案
解决的思路很简单，就是在onClick的<a href="#anonymousClass">内部类</a>中把dialog「定死」，不因成员变量mDialog的变化为转移！这时突然想起来匿名类引用局部变量是必须给局部变量加final修饰符的问题，于是就有了以下解决方案：

在create中声明一个变量
```java
final Dialog d = mDialog;
```
然后下面需要传入mDialog的地方全部使用d代替。于是问题就顺利的解决了！

##思考
对于上面解决方案为什么生效，首先说一下**匿名类引用局部变量为什么必须声明final，为什么引用外部类的成员变量又不需要是final**。

首先：
 1. static修饰的内部类和外部类是不能相互引用的，即内部类不能直接引用外部类的任何非static成员变量。因为static内部类不依赖于外部类就可以创建比如`new AlertDialog.Builder`是可以成功执行的。
 2. 然内非static的内部类是不能这样new出来的，比如：

```java
public class Outer {
	public A() {
	}
	public class Inner {
		public Inner() {
		}
	}
}
```
Inner想要被new出来必须这样做：

```java
Outer outer  = new Outer();
Outer.Inner inner = outer.new Inner();

/*
 * can not pass compile, the compiler would complain
 */
 //Outer.Inner inner = new Outer.Inner();
```
那么为什么非静态内部类就可以使用外部类的成员变量了呢，那是因为**内部类会保存一个外部类的引用**。可以通过如下方式在内部类中获取该引用。
```java
//in inner class
Outer.this
```
怎么样！是不是好熟悉，是不是觉得我用过！没错，就是他！

问题逐渐明朗了，需要说明一件事：**anonymous class肯定全都是非static内部类**。

那么匿名类就可以访问外部类的成员变量，这一点和常识想通。但是匿名类一般是在方法体内被创建的，当匿名类想引用方法体内的变量或者方法的参数时该变量必须声明final才行。这是为什么呢？！

这个说来话长，因为方法的参数，乃至方法内的局部变量都是临时性的，他们储存在栈（stack）中。当方法return的时候他们便不复存在。所以匿名类不可能通过外部类的引用来获取局部变量。
而final修饰的变量是不能修改的，因此内部类并不「引用」这个变量，而是在内部直接copy一下！反正她是不会变的，我copy一下也不会导致不一致的问题。（这里需要说明一个事实，copy一个实例的引用时，并不会copy这个实例，只是copy了「指针」而已！）

所以，结论是：
{% blockquote %}
  **final的作用就是告诉编译器，这个变量不会修改的，内部类想用的话可以自己copy一份过去**

{% endblockquote %}

对于上述的解决方案，因为我们使用了一个final变量代替成员变量，因此内部类会直接使用该final变量的copy，而不像原来那样每次都去resolve外部类的成员，这就保证了这个变量在内部类是「定死」的！

##优化升级
该才说到，非静态内部类会保留一个外部类的引用。在builder这个实例中，dialog的onclick Listener是builder的内部类，因此该listener会保留Builder的引用。但是builder只是辅助构建Dialog用的，当dialog构造出来之后不应该在和builder保有引用。否则会导致builder不能被垃圾回收掉！
因此做一个修改，把dialog的onclick listener改成静态类，如下：

```java
 if (mPositiveButtonLinstener != null) {
            final DialogInterface.OnClickListener listener = mPositiveButtonLinstener;
            posBtn.setOnClickListener(new DialogButtonOnClickListener(dialog,
                    DialogInterface.BUTTON_POSITIVE,
                    listener));
        }
```
其中`DialogButtonOnClickListener`定义如下：
```java
private static class DialogButtonOnClickListener implements View.OnClickListener {
        private Dialog mDialog;
        private int mWhich;
        private DialogInterface.OnClickListener mListener;

        public DialogButtonOnClickListener(
                Dialog dialog,
                int whichButton,
                DialogInterface.OnClickListener l) {

            mDialog = dialog;
            mWhich = whichButton;
            mListener = l;
        }

        @Override
        public void onClick(View v) {
            if (mListener != null && mDialog != null) {
                mListener.onClick(mDialog, mWhich);

            }

        }
    }
```

###[完]








