---
layout: post
title: "retro-lambda 测试报告"
date: 2016-01-11 00:10:42 +0800
comments: true
categories: [Android]
tags: [Andriod, java]
---
#retrolambda测试报告

先说结论

1. 堆栈行号完全匹配！没有任何问题，包括最新的android build tools自身支持的switch string，MultiCatch，和retrolambda的所有特性都没问题。
2. lambda是通过生成class来实现的，而且是生成static class而不是anonumous class，因此没有this$0引用。且支持**[method reference （推荐阅读）](https://docs.oracle.com/javase/tutorial/java/javaOO/methodreferences.html)**。
3. 但是lambda会生成冗余方法，每个Lambda类4个方法（下面有代码），其中一个是原接口的方法；增加3个，一个是构造方法，两个是静态工厂方法。
4. 支持MultiCatch。
5. 支持interface加default方法，亲测可行，但是使用该特性必须禁用增量编译。
6. 支持interface加static方法，亲测不可行（可能版本bug），同上需要禁用增量编译。
7. 支持tryWithResource但是估计这个用的不多，问题在于默认会吞掉Exception。同时Android Studio会报错说API19才能用，但是可以编译。
8. 不支持Java8的新增API，包括Lambda相关的function包，和其他新包比如stream api。



下面是测试细节以及源代码和反编译代码对比：

## switch string（这个是java7自身的语法糖）

源代码：

```cpp
private static void switchWithString(String str) {
    System.out.println("switchWithString");
    switch (str) {
        case "hello":
            System.out.println("Hello");
            break;
        case "World":
        case "world":
            new Throwable().printStackTrace();
            break;
    }
}
```

class反编译：

```cpp
private static void switchWithString(String str) {
    System.out.println("switchWithString");
    byte var2 = -1;
    switch(str.hashCode()) {
    case 83766130:
        if(str.equals("World")) {
            var2 = 1;
        }
        break;
    case 99162322:
        if(str.equals("hello")) {
            var2 = 0;
        }
        break;
    case 113318802:
        if(str.equals("world")) {
            var2 = 2;
        }
    }

    switch(var2) {
    case 0:
        System.out.println("Hello");
        break;
    case 1:
    case 2:
        (new Throwable()).printStackTrace();
    }

}
```

## lambda

源代码：

```cpp
findViewById(R.id.stop).setOnClickListener((v) -> {
    //Yes! use "this" to refer to the MainActivity.this
    Toast.makeText(this, "Hello lambda", Toast.LENGTH_SHORT).show();

    System.out.println("crash in lambda");
    new Throwable().printStackTrace();
});
```

class反编译：


```cpp
this.findViewById(2131492943).setOnClickListener(MainActivity$$Lambda$1.lambdaFactory$(this));
final class MainActivity$$Lambda$1 implements OnClickListener {
    private final MainActivity arg$1;

    private MainActivity$$Lambda$1(MainActivity var1) {
        this.arg$1 = var1;
    }

    private static OnClickListener get$Lambda(MainActivity var0) {
        return new MainActivity$$Lambda$1(var0);
    }

    public void onClick(View var1) {
        MainActivity.access$lambda$0(this.arg$1, var1);
    }

    public static OnClickListener lambdaFactory$(MainActivity var0) {
        return new MainActivity$$Lambda$1(var0);
    }
}
```

可以看到生成的class中两个工厂方法get$Lambda和lambdaFactory$其实除了名字其他都一样，而且代码中只调用了后者，因此proguard混淆之后，会删除get$Lambda方法。这样和之前的InnerClass比起来就只是多了LambdaFactory$一个工厂方法。然而lambda的实现中会在MainActivity中添加一个 MainActivity.access$lambda$0 ，然后该方法会调用 MainActivity.lambda$onCreate$0 方法（这个命名和java8的lambda是一致的）。然而这里其实没必要使用access方法，因为lambda方法（即上文的MainActivity.lambda$onCreate$0 ）是编译器生成的，不会被其他方法引用。（嗯！java8就没有access方法！），不过没关系retrolambda是开源的，不爽可以自己改（就是这么任性！）。

优：

   1. 把InnerClass改成了外部static class。避免了this$0逸出。

劣：

    1. 所以总体方法数多了两个。可以改成只多一个。
    2. lambda内部的堆栈dump会多几层，但是最后还是会定位到lambda内部。

下面是lambda内部crash堆栈dump：

```bash
08-14 09:30:46.402  11348-11348/young.com.demo I/System.out﹕ crash in lambda
08-14 09:30:46.402  11348-11348/young.com.demo W/System.err﹕ java.lang.Throwable
08-14 09:30:46.402  11348-11348/young.com.demo W/System.err﹕ at young.com.demo.MainActivity.lambda$onCreate$0(MainActivity.java:81)
08-14 09:30:46.402  11348-11348/young.com.demo W/System.err﹕ at young.com.demo.MainActivity.access$lambda$0(MainActivity.java)
08-14 09:30:46.402  11348-11348/young.com.demo W/System.err﹕ at young.com.demo.MainActivity$$Lambda$1.onClick(Unknown Source)
08-14 09:30:46.402  11348-11348/young.com.demo W/System.err﹕ at android.view.View.performClick(View.java:4781)
08-14 09:30:46.402  11348-11348/young.com.demo W/System.err﹕ at android.view.View$PerformClick.run(View.java:19873)
08-14 09:30:46.402  11348-11348/young.com.demo W/System.err﹕ at android.os.Handler.handleCallback(Handler.java:739)
08-14 09:30:46.403  11348-11348/young.com.demo W/System.err﹕ at android.os.Handler.dispatchMessage(Handler.java:95)
08-14 09:30:46.403  11348-11348/young.com.demo W/System.err﹕ at android.os.Looper.loop(Looper.java:135)
08-14 09:30:46.403  11348-11348/young.com.demo W/System.err﹕ at android.app.ActivityThread.main(ActivityThread.java:5289)
08-14 09:30:46.403  11348-11348/young.com.demo W/System.err﹕ at java.lang.reflect.Method.invoke(Native Method)
08-14 09:30:46.403  11348-11348/young.com.demo W/System.err﹕ at java.lang.reflect.Method.invoke(Method.java:372)
08-14 09:30:46.403  11348-11348/young.com.demo W/System.err﹕ at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:904)
08-14 09:30:46.403  11348-11348/young.com.demo W/System.err﹕ at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:699)
```

## Lambda Method Reference：

源代码：

```cpp
private interface StringConsumer {
    void consumeAString(String str);
}

private static void testMethodReference(StringConsumer sc) {
    sc.consumeAString("testStringConsumer");
}

testMethodReference(System.out::println);
```

class反编译：

```cpp
testMethodReference(MainActivity$$Lambda$4.lambdaFactory$(var10000));

final class MainActivity$$Lambda$4 implements StringConsumer {
    private final PrintStream arg$1;

    private MainActivity$$Lambda$4(PrintStream var1) {
        this.arg$1 = var1;
    }

    private static StringConsumer get$Lambda(PrintStream var0) {
        return new MainActivity$$Lambda$4(var0);
    }

    public void consumeAString(String var1) {
        this.arg$1.println(var1);
    }

    public static StringConsumer lambdaFactory$(PrintStream var0) {
        return new MainActivity$$Lambda$4(var0);
    }
}
```

## MultiCatch

源代码：

```cpp
private static void testMultiCatch(int i) {
    System.out.println("testMultiCatch");
    try {
        switch (i) {
            case 0:
                throw new NullPointerException();
            case 1:
                throw new IllegalStateException();
            case 2:
                throw new IOException();
            case 3:
                throw new RuntimeException();
        }
    } catch (NullPointerException | IllegalStateException | IOException e) {
        e.printStackTrace();
    } catch (RuntimeException ex) {
        //make this branch different to suppress warnings
        int a = ex.hashCode();
        ex.printStackTrace();
    }
}
```

class反编译：

```cpp
private static void testMultiCatch(int i) {
    System.out.println("testMultiCatch");

    try {
        switch(i) {
        case 0:
            throw new NullPointerException();
        case 1:
            throw new IllegalStateException();
        case 2:
            throw new IOException();
        case 3:
            throw new RuntimeException();
        }
    } catch (IllegalStateException | IOException | NullPointerException var3) {
        var3.printStackTrace();
    } catch (RuntimeException var4) {
        int a = var4.hashCode();
        var4.printStackTrace();
    }

}
```

    好像没什么区别，不是我粘错了，估计是JVM本来就支持这个特性。

## tryWithResource

源代码：

```cpp

private static void testTryWithResource(ServerSocket ss) {
if (ss == null) return;

try (Socket in = ss.accept();
     InputStream is = in.getInputStream()) {
    is.read();
} catch (IOException e) {

}

```

class反编译：

```cpp

private static void testTryWithResource(ServerSocket ss) {
    if(ss != null) {
        try {
            Socket in = ss.accept();
            Throwable var2 = null;

            try {
                InputStream is = in.getInputStream();
                Throwable var4 = null;

                try {
                    is.read();
                } catch (Throwable var29) {
                    var4 = var29;
                    throw var29;
                } finally {
                    if(is != null) {
                        if(var4 != null) {
                            try {
                                is.close();
                            } catch (Throwable var28) {
                                ;
                            }
                    } else {
                            is.close();
                        }
                    }

                }
            } catch (Throwable var31) {
                var2 = var31;
                throw var31;
            } finally {
                if(in != null) {
                    if(var2 != null) {
                        try {
                            in.close();
                        } catch (Throwable var27) {
                            ;
                        }
                    } else {
                        in.close();
                }
                }

            }
        } catch (IOException var33) {
            ;
        }

    }
}

```

好™啰嗦啦！绝对不要用这个。

附录
关于androidBuildTool对java7的支持，原文来自：

[http://tools.android.com/tech-docs/new-build-system/user-guide#TOC-Using-sourceCompatibility-1.7]()

Using sourceCompatibility 1.7
With Android KitKat (buildToolsVersion 19) you can use the diamond operator, multi-catch, strings in switches, try with resources, etc. To do this, add the following to your build file:

```cpp

android {
    compileSdkVersion 19
    buildToolsVersion "19.0.0"

    defaultConfig {
        minSdkVersion 7
        targetSdkVersion 19
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_7
        targetCompatibility JavaVersion.VERSION_1_7
    }
}

```

Note that you can use minSdkVersion with a value earlier than 19, for all language features *except try with resources*. If you want to use try with resources, you will need to also use a minSdkVersion of 19.

You also need to make sure that Gradle is using version 1.7 or later of the JDK. (And version 0.6.1 or later of the Android Gradle plugin.)

#匿名类 VS Lambda

今天修复了几个listener导致内存泄露的问题。
在review代码的过程中发现很多泄露是匿名类的this$0导致的，事实上挺多时候匿名类并没有显式的使用到this。

##匿名类

**匿名类必然会引用this，不管代码中是否真正用到。**
java中的匿名类和非static内部类（标准叫法是嵌套类nested class，内部类专指static inner class），都会有外部类的引用，通过构造函数传进来，并在内部类的this$0成员变量中保存；但是我们通常不会注意到他们，因为java编译器帮我们做了这些；如果我们查看反编译的class文件会发现他们是真真切切的存在。

比如：

```cpp

private BroadcastReceiver mCollectionReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
     		//...
        }
    };

```

反编译javac生成的class

```cpp

class BroadcastDetailFragment$4
  extends BroadcastReceiver
{
  BroadcastDetailFragment$4(BroadcastDetailFragment this$0) {}
  
  public void onReceive(Context context, Intent intent)
  {
   	//...
  }
}

```

可以看到构造函数中是有个this$0的参数的。

##Lambda

**lambda不一定会引用this，具体看lambda里面是否用到。**
Lambda中所有引用到的外部的变量都是通过参数的形式传给实现lambda的函数的。如果lambda中用到this或非static成员方法、非static成员变量，那么lambda就必须引用this，这个this就是作为参数传给实现lambda的函数；反之，若lambda不需要this，编译器就不会传this作为参数，这时候该lambda生成的类就不会泄露我们的Fragment，Activity。

##总结：

使用Lambda除了可以使代码更优雅，还可以减少不必要的this泄露。
之前我曾担心过：retro-lambda会给每个lambda生成一个类，会不会带来性能，内存之类的压力；但是想到scala语言就是用这种方式实现的lambda，而且玩的很欢乐，想必不用过度担心。

###附录：

1. 关于scala和java8是怎么分别实现lambda的，可以参看[这篇文章](http://blog.takipi.com/compiling-lambda-expressions-scala-vs-java-8/)。PS：retro-lambda是模仿了scala的做法（因为android中不支持invokedynamic虚拟机指令，其在java7中引入，所以理论上javac生成的lambda在java7上也是能跑的）

2. retrolambda测试报告，在项目引入retro-lambda之前，我做了几个实验，验证之前的疑问点。下面是之前的结论，再贴一遍~方便翻阅~


