---
layout: post
title: "java序列化实践"
date: 2015-04-04 18:06:20 +0800
comments: true
categories: [java]
tags: [java]
---

java中实例的序列化是指将一个实例专程二进制流以用于网络传输或者固化存储之用。事实上，简单点说就是把一个类实例的成员变量存储下来，然而这个过程根据成员变量的类型的不同，可能会很简单，也可能会很复杂。序列化的用处还是很大的，比如跨进程通信（IPC，安卓中的IPC用到了序列化，只是安卓自身实现了一个比java更轻量级、更简单的序列化方式。但是原理大同小异），远程方法调用（RMI，事实上这个和安卓中的Binder通讯很类似）;此外还常见的是把实例序列化到数据库中以blob的形式存储。并且因为java语言本身就是跨平台设计的，序列化之后的数据也是平台无关的，因此你无需关心大小端之类的问题（以及类似于C语言的内存对齐问题）！既然序列化这个有用还是有必要学习一下的。（BTW，java EE中提供了更加严格的固化方案Java Date Object，或着也可以考虑使用Hibernate框架。）

参考的资料是《Thinking in java》，和[IBM的一篇博文][1]。下面来做几个实验，一边学习一边实践一下。

<!--more-->

序列化其实是很简单的，你只需要给需要序列化的类实现Serializable接口（这个接口只是标签接口，没有方法）。你的类就被标记为了可序列化。然后序列化的过程是使用ObjectOutputSteram::writeObject()方法;反序列化是使用ObjectInputStream::readObject()。

###1. `Serializable`方式
这种方式可以说是由jvm来全权掌控的。序列化的时候，java会把类的每一个实例成员变量（不包括static成员变量）写下来，比较好理解的是原始类型。如果类中有成员是其他Object，就会递归的去序列化这个Object。

比如如下代码：

```java
package com.young;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

class A implements Serializable {
    private static int instances = 0;

    public A next;
    private int num;

    public A(int num, A next) {
        this.num = num;
        System.out.println("Constructor #" + (instances++));
        this.next = next;
    }

    @Override
    public String toString() {
        return Integer.toString(num) + " " + next;
    }
}

public class Main {

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        A a = new A(7, new A(8, null));

        System.out.println("serialize");
        ObjectOutputStream oo = new ObjectOutputStream(
                new FileOutputStream("oo.out"));
        oo.writeObject(a);
        oo.close();
        System.out.println("deserialize");
        ObjectInputStream oi = new ObjectInputStream(
                new FileInputStream("oo.out"));
        A a1 = (A) oi.readObject();
        oi.close();
        System.out.println("a:" + a);
        System.out.println("a1:" + a1);
    }
}
```

输出如下：

```bash
Constructor #0
Constructor #1
serialize
deserialize
a:7 8 null
a1:7 8 null
```

然而在反序列化的过程中，**构造函数并没有被调用**！所以Serializable方式的反序列化是直接从数据中“填充”一个实例出来！看上去有点神奇的样子。

####1.1 `transient`关键字
在Serializable方式中如果有些成员变量（比如密码等敏感信息）不想被序列化的话，你可以使用transient关键字来修饰之。

####1.2 static fields
序列化时static变量不会被序列化进去。因为其是class的信息，和实例没什么关系。如果要序列化的话可以自己用方式2或3手动write。

###2. `Enternalizable`方式
了解Serializable方式的序列化会发现：在整个序列化过程中我们好像什么都没做，只是实现了Serializable接口而已，对于这种打酱油的行为我表示不安心！感觉局面不在自己的掌控之中呀！好在java中还有另一种序列化方式`Externalizable`方式。这个接口中有两个方法：`void writeExternal(ObjectOutput out)`和`void readExternal(ObjectInput in)`。直接看例子：

```java
package com.young;

import java.io.Externalizable;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectInputStream;
import java.io.ObjectOutput;
import java.io.ObjectOutputStream;

class B implements Externalizable {
    private static int instances = 0;

    private int n;

    public B() {
        System.out.println("Constructor1 #" + (instances++));
    }

    public B(int n) {
        System.out.println("Constructor2 #" + (instances++));
        this.n = n;
    }

    @Override
    public void writeExternal(ObjectOutput out) throws IOException {
        out.writeInt(n ^ 100);
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
        n = in.readInt() ^ 100;
    }

    @Override
    public String toString() {
        return "b:" + n;
    }
}

public class Main {


    public static void main(String[] args) throws IOException, ClassNotFoundException {
        B b1 = new B(7);
        B b2 = new B(9);
        System.out.println("serialize");
        ObjectOutputStream oo = new ObjectOutputStream(
                new FileOutputStream("oo.out"));
        oo.writeObject(b1);
        oo.writeObject(b2);
        oo.close();
        System.out.println("deserialize");
        ObjectInputStream oi = new ObjectInputStream(
                new FileInputStream("oo.out"));

        B b = (B) oi.readObject();
        System.out.println(b);
        b = (B) oi.readObject();
        System.out.println(b);
        oi.close();
    }
}
```

输出如下：

```bash
Constructor2 #0
Constructor2 #1
serialize
deserialize
Constructor1 #2
b:7
Constructor1 #3
b:9
```

从中可以看出：我们需要在writeExternal中对该类需要序列化的数据进行操作，在readExternal中相应的进行读取，需要注意的是：读和写的顺序要一致。在这种方式下java自身是不会干涉实例的序列化的，所有的序列化、反序列化工作是有开发者自己定义的。这种方式下开发人员有了足够的自由度！比如我可以writeExternal中对数据加密，在readExternal中对数据解密，以此保证序列化的数据是安全的。（上面的代码中使用亦或进行的简单的加解密操作）。

和Serializable不同的是我们看到在反序列化的时候**默认构造函数被调用了**！所以这种方式是比较纯粹的实现接口+接口回调，而不是Serializable中实例直接被java填充出来的黑魔法那样！

因为要调用默认构造函数，因此实现Externalizable接口的类必须有一个public的默认构造函数！这样jvm才能初始化一个类，然后调用其接口实现来进行反序列化。

###3. 第三种序列化方式
这种序列化方式更像是前两种的综合体，TIJ中称这种方法为“An alternative to Externalizable”。（并且这种方式并不是很符合通常的java语言习惯，因此看起来很奇怪。在Thing in java一书中被作者Bruce Eckel喷得不轻！不过我们还是看一下什么情况。）

实现方式是实现Serializable接口，然后在你的类中加入如下两个方法，而且方法签名要一模一样！：

```java
private void writeObject(ObjectOutputStream stream)
throws IOException;

private void readObject(ObjectInputStream stream)
throws IOException, ClassNotFoundException;
```

没错，你没有看错他们的确是private方法！看仔细咯，这个方法和Externalizable中的两个方法的参数是不一样的，这里面是ObjectOutputStream，而后者是ObjectOutput。

然后在两个方法中你可以手动控制序列化，这一点和方式2相同。不同的是他还和方式1结合了！不过到底怎么结合的呢？关键在于`ObjectOutputStream：：defaultWriteObject()`方法和`ObjectOutputStream：：defaultReadObject()`。你可以在writeObject最开始调用相应的defaultWriteObject方法。他的作用就是使用默认的序列化实现方式来操作当前实例，在这之后你可以自由其他的操作序列化过程。对于read亦是如此。

是不是显得很奇怪，我调用了ObjectInputStream的方法，而且都没有把this传进去，可是jvm却把“我”给序列化了！对于这真的只能说不要在意细节，java语言就是这么设计的，不喜欢可以不用这种方式嘛～（反正我最喜欢方式2

好!现在"show me the code":

```java
class T implements Serializable {
    public static int instances = 0;
    private int num;
    private transient String passwd;

    public T(int n) {
        num = n;
        passwd = n + "0";
        System.out.println("Constructor #" + (instances++));
    }

    private void writeObject(ObjectOutputStream stream)
            throws IOException {
        stream.defaultWriteObject();
        stream.writeObject("NO PASSWORD");
        System.out.println("writeObject");

    }

    private void readObject(ObjectInputStream stream)
            throws IOException, ClassNotFoundException {
        stream.defaultReadObject();
        passwd = (String) stream.readObject();
        System.out.println("readObject");
    }

    @Override
    public String toString() {
        return num + " " + passwd;
    }
}

public class Main {

    public static void main(String[] args) throws IOException, ClassNotFoundException {

        T t = new T(10);
        T t1 = new T(11);
        //
        System.out.println("serialize");
        ObjectOutputStream oo = new ObjectOutputStream(
                new FileOutputStream("oo.out"));

        oo.writeObject(t);
        oo.writeObject(t1);

        //
        oo.close();
        System.out.println("deserialize");
        ObjectInputStream oi = new ObjectInputStream(
                new FileInputStream("oo.out"));
        T tmp;
        tmp = (T) oi.readObject();
        System.out.println(tmp);
        tmp = (T) oi.readObject();
        System.out.println(tmp);

        //
        oi.close();
    }
}
```
输出
```bash
Constructor #0
Constructor #1
serialize
writeObject
writeObject
deserialize
readObject
10 NO PASSWORD
readObject
11 NO PASSWORD
```

可以看出这种**方式3仍然不会调用构造函数**！

###4. serialVersionUID 常量
不管是上述的那一种序列化方式，都可以使用`serialVersionUID`控制class的版本问题。`serialVersionUID`是一个定义在类内部的成员常量比如：`private static final int serialVersionUID = 1L;`。他的作用是标记class的版本（这是我个人的理解，下面解释一下）。一个类如果定义了这个常量，在系列话时会存储下来这个常量。当反序列化时jvm会先比较加载的class和序列化数据中的类的serialVersionUID是否相同，如果不同的话就认为class版本不一样，抛出`java.io.InvalidClassException`异常，拒绝反序列化。直白一点说就是“当一个类序列化时候的serialVersionUID和反序列化时候的serialVersionUID相同是，其反序列化才会成功。

当你的某个用于固化的class被更新的时候，他的成员和原来相比已经不再完全相同了，此时之前被序列化的数据——为了避免逻辑混乱——已经不能再反序列化到新的class中了。此时你可以更改新的class的serialVersionUID来达到这一目的。

------

>   事实上因为Externalizable方式的序列化、反序列化全部是由程序员一手掌握的，因此它显得范围额比较简单，所有逻辑（哪些要序列化，如何序列化）都可以在接口的两个方法中控制。然而Serializable方式由于是由jvm全权负责的，要控制一些逻辑反而会显得不那么简单明了。


###5. 一些特殊情况
1. 相同的instance问题：比如一个List中包含了同一个实例的多出引用。那么序列化时**同一个引用只会序列化一次**。反序列化是这些相同的引用最中还是得到的引用仍然是相同的。所以循环引用也不会发生死循环的情况！（不得不说这一点很是机智！
2. 基于1,**当序列化时写入同一个实例（引用相同）时，第二次写入并不会触发其序列化**，因此只是第一次写入时进行了序列化，即使后来写入的时候实例的状态已经发生了改变。所以这一点会需要特别注意。
3. 父类没有实现序列化接口而子类实现的时候（Drived extends Base)：

	这里序列化接口有两种（Serializable、Externalizable）分两种情况叙述：
	* Serializable：此时Base因为没有实现Serializable而不能序列化，但是Drived因为实现了接口所以可以序列化。我们知道实现Serializable接口的类不需要调用构造函数就能反序列化。我们还知道类的初始化顺序是首先要初始化父类的。这里发序列化时就会出现要初始化父类的情况，因此需要父类有public默认构造函数。同时如果是方式3的话自然也可以手动序列化父类中的数据。
	* Externalizable：这个最好说父类子类都要有public默认构造函数。至于哪些会序列化，哪些不会，就自己掌控了。


###总结
1. `Serializable`方式(方式1、3)反序列化时不会调用构造函数。
2. `Externalizable`方式反序列化会调用默认（无参）构造函数，如果没有public默认构造函数会抛异常。
3. `static` 变量默认不会序列化。
4. `transient` 关键字修饰的变量默认也不会序列化。
5. `serialVersionUID`控制class版本信息，防止出现不正常序列化
6. 相同引用的实例序列化时只会序列化一次。反序列化后引用也是相同的。
7. 父类没有序列化而子类序列化的情况。

[1]: http://www.ibm.com/developerworks/cn/java/j-lo-serial/index.html
