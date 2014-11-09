---
layout: post
title: "Android中service的使用"
date: 2014-11-09 18:07:03 +0800
comments: true
categories: [Android]
tags: [Android]
---

##Android 中service的使用 笔记

###Service是何物  
service是安卓四大组件（Activity、BroadcastReceiver、ContentProvider、Service）之一。Service用于执行耗时比较长的操作，在后台运行，没有界面显示。

**Service与进程**：  
Service可以在应用的主进程中运行，也可以在单独的进程中运行。只需要在Service的[Manifest声明][manifest]中指明进程名即可。同一个应用中所有具有相同进程名的组件（四大组件，包括Activity）均可以运行在同一个进程中。

**Service的寿命**：   
这里说的`寿命`只是service什么时候运行什么时候终止而已并非生命周期的概念。service的启动方式有两种：  
 1. 通过`Context::strtService`来启动一个Service，这个Service会一直在后台运行，即使启动该Service的组件已经结束。它只能自己结束自己，通过`Service::stopSelf()`或者是被其他组件显示的结束，通过`Context::StopService`。或者系统可用内存不够，android系统会选择性的kill掉一些service，在需要的时候再重新启动他们。当然如果进程自己crash也是会结束的(╯‵□′)╯︵┻━┻（这不是废话）。   
 2. 通过`Context::bindService`启动Service。一个绑定的Service一般是 C-S（客户端-服务器）类型的，通常会和其他组件进行通信，包括：发送请求，收取返回结果，甚至是进程间通信——IPC。一个绑定的Service的寿命和绑定他的组件相关，当所有绑定到他上面的组件都结束（或者取消绑定——通过`Context::unbindService`方法）的时候，这个service就自然结束。

<!--more-->

当然启动一个Service还可以同时用上面两个方法：先startService启动一个常驻service，然后bind到他上面进行通信——IPC。

> Service运行在进程的主线程上。所以如果要执行长耗时或CPU高消耗任务的话还是要自行创建线程，以免阻塞主进程导致service的声明周期方法不能及时回调。


###基础知识：  
创建一个Service时，必须创建一个Service的子类，并覆盖相应的声明周期回调方法，来进行相应的处理。你需要覆盖的最重要的几个声明周期回调是：  
 1. onStartCommand：当其他组件（比如Activity）通过startService方法启动Service的时候，系统就会回调这个方法。一旦这个方法被调用，该service就会永久的运行下去。因此你将有义务来结束这个service，通过service自己调用`stopSelf`或者在其他组件中调用`Context::stopService`。如果你只是希望通过bind来启动这个service，则没有什么必要来覆盖这个方法。这个方法有三个参数，第一个是启动这个Service的Intent，第二个是启动Flag，第三个是startID，每次这个方法回调的时候这个ID就会增加一次（保证每次都不一样）。  
 2. onBind：当其他组件调用`Context::bindService`来绑定到service上的时候，一般会在onBind中返回一个IBinder对象的实例，提供给Client调用Service中的方法。相应的如果不希望客户端绑定到service上就返回`null`好了。   
 3. onCreate：和Activity的onCreate一样，在整个生命周期中值调用一次——在service被创建的时候。   
 4. onDestroy：也是和Activity一样，在整个生命周期中也只调用一次——在service被销毁的时候。这个方法是service中最后一个执行的方法。

**重申**：   
> 如果Service是通过`Context::startService`来启动的话，它将一直运行下去，知道他结束自己（通过`Service::stopSelf`方法）或者其他组件结束掉他（通过`Context:stopService`方法）。**另外**：即使上面所说两个方法（`Service::stopSelf`和`Context:stopService`）已经调用，只要有bind到这个service上的组件没有unbind这个service也不会立即结束。

###在Manifest中声明你的service：   
语法如下：   

```xml
<service android:enabled=["true" | "false"]
         android:exported=["true" | "false"]
         android:icon="drawable resource"
         android:isolatedProcess=["true" | "false"]
         android:label="string resource"
         android:name="string"
         android:permission="string"
         android:process="string" >
    . . .
</service>
```

上面的attribute和大部分的组件都是一样的。  
 1. `android:isolatedProcess`：如果是true的话这个service将运行在一个隔离的特殊进程中，并且不具备任何权限（包括你在Manifest中声明的）。唯一能和service通信的方式就是bind和start。
 2. `android:process`：进程名。就是这个service运行的进程的名字。虽然其他三个组件也可以指定进程名，但是service才是真正需要这个属性的组件！因为一些进程往往需要长时间运行，在主进程之外运行。
	 1. 如果不指定这个属性的话，组件将在默认进程中执行，进程名就是包名。  
	 2. 如果指定了进程名，则运行在指定的进程中，其他组件也可以访问该service，只要满足service指定的权限。
	 3. 特殊情况：如果进程名以「冒号」开头（`:`），则该service是应用私有的service，其他应用不能访问到。

**bindService和unbindService：
bind和onBind必须成对出现，否则service不会终止。加入你的onBind卸载activity的onDestroy中，然后activity被系统终止而没有调用onDestroy，此时系统会帮你调用onBind并log一个warnning警告你！  
`boolean bindService(Intent service, ServiceConnection conn, int flags)`:其中intent是启动service的Intent，conn是回调。定义是：   

```java
public interface ServiceConnection {
	//service连接成功时的回调，IBinder就是service返回的Binder
    public void onServiceConnected(ComponentName name, IBinder service);
	//service**意外**终止时的回调，一般是service进程crash或者被系统杀掉。他并不会关闭与service的连接。
    public void onServiceDisconnected(ComponentName name);
}
```

`public void unbindService(ServiceConnection conn)`:unbind中有个conn参数，就是你在bind是传入的那个回调。

###Android中的进程间通信——IPC
这个是一个很精彩的内容，用过android的ipc机制才发现**IPC从未如此简单！**。    

####Android Interface Definition Language (AIDL)  
android的IPC通过`aidl`文件来指定接口，aidl的含义是「Android Interface Definition Language 」，其使用了一种很类似java的语法来制定IPC接口。  
<a name="aidl_chestnut">举个栗子</>，比如在com.example.service包中，写一个aidl文件，内容如下：  

```java
package com.example.service;

import com.example.service.ICallback;
import android.os.Bundle;

interface IDemoServiceController {
    int getPid();
    int add(int a, int b);
    void causeToStop();
    void paramInAndOut(in Bundle bundleIn, out Bundle bundleOut, inout Bundle bundleInOut);
}
```

可以看到基本上和JAVA一模一样！  
**需要注意**：  
 1. AIDL支持的数据类型<a name="aidl_types"></>：  
	 1. [AIDL默认支持的数据类型][aidl_default_type]  
	 2. [实现了Parcelable接口][parcelable]任意类  
 2. 另外你必须import所有使用到的class到你的AIDL文件中，即使他跟你的aidl文件在同一个包中！  
 3. 方法可以有0到多个参数，也可以返回void。  
 4. 参数中的所有的非java原始类型（必须指定一个参数的数据走向，是`int`，`out`，`inout`，三者之一）。  
 5. 参数中的所有的原始类型都是in，而且不能被修改。  

<a name="aidl_default_type"></a>AIDL默认支持的数据类型如下：   

 1. java语言中的所有原始类型（primitive type，比如：int, long, char, boolean)

 1. String  

 2. CharSequence  

 3. 支持数组！虽然文档没说，但经过实验证明是支持数组的。但是数组的元素必须是AIDL所支持的[数据类型][aidl_types]。

 3. List **注意**  
    1. List中的所有类型也必须是AIDL所支持的[数据类型][aidl_types]。  
    2. List可以被当做泛型类来使用（比如`List<String>`）。  
    3. 接收参数的另一端（对于client，另一端指service；对于service另一端指  client）收到的List实际类型总是ArrayList。    

 4. Map **注意**   
    1. Map所支持的类型同上。  
    2. 泛型Map并不支持。  
    3. 接收参数的另一端接收到的Map实际类型是HashMap。  

####实现Parcelable接口 

因为实例是要在进程间传递的因此必须序列化才行。Parcelable就是android定义的一个用于class序列化的即轻量级又高效的机制。  
Parcelable接口的定义如下：  

```java
public interface Parcelable {
    public int describeContents();
    public void writeToParcel(Parcel dest, int flags);
    public interface Creator<T> {
        public T createFromParcel(Parcel source);
        public T[] newArray(int size);
    }
}
```  

其中`describeContents()`用于描述数据类型，可以简单的返回0。
然后是用于序列化的方法`writeToParcel(Parcel dest, int flags)`：  
dest就是用于存储序列的类的容器，然后flags可以是普通的0，或者是` PARCELABLE_WRITE_RETURN_VALUE`用来告诉你这个object是被写回返回值的（比如下列方法中  `Parcelable someFunction()`, `void someFunction(out Parcelable)`, or `void someFunction(inout Parcelable)`），以此来告诉你该清理资源就赶紧的！

然后问题来了：怎么只有序列化没有反序列化！这只出不进不是要弹尽粮绝（~~精尽人亡~~）吗？！  
好了，Parcelable接口是有魔力的，他并不是一个普通的接口。android规定，要实现这个接口除了实现上面两个接口还要在类中定义一个static成员变量，名字必须叫“CREATOR”（此处需要注意配置proguard混淆，很明显android会用反射来获取这个变量，~~忍不住吐槽一句！google你怎么那么喜欢反射！！~~），然后这个CREATOR必须是`Parcelable.Creator<T>`的实现，android系统将使用这个实例来进行反序列化。

举个栗子（盗自android文档Parcelable篇）：  

```java
public class MyParcelable implements Parcelable {
     private int mData;

     public int describeContents() {
         return 0;
     }

     public void writeToParcel(Parcel out, int flags) {
         out.writeInt(mData);
     }

     public static final Parcelable.Creator<MyParcelable> CREATOR
             = new Parcelable.Creator<MyParcelable>() {
         public MyParcelable createFromParcel(Parcel in) {
             return new MyParcelable(in);
         }

         public MyParcelable[] newArray(int size) {
             return new MyParcelable[size];
         }
     };
     
     private MyParcelable(Parcel in) {
         mData = in.readInt();
     }
 }
```

####在Client和Service端调用aidl指定的方法
android sdk tool会自动根据aidl文件生成相应的java文件。因此可以直接使用之。

**在server端**  
前面说过onBind方法会返回一个IBinder的实例给client调用。这里返回的IBinder实例就和你的aidl有关。你需要在server中实现aidl中指定的接口的实现，还举[刚才的栗子](#aidl_chestnut)。你需要在server中这样：   

```java
private class MyBinder extends IDemoServiceController.Stub {
        @Override
        public int getPid() throws RemoteException {
            return android.os.Process.myPid();
        }

        @Override
        public int add(int a, int b) throws RemoteException {
            return a + b;
        }

        @Override
        public void causeToStop() throws RemoteException {
            log("causeToStop");
            stopSelf();
        }

        @Override
        public boolean addCallback(ICallback callback) throws RemoteException {
            clientCallback = callback;
            return true;
        }

        @Override
        public void invokeCallback() throws RemoteException {
            if (clientCallback != null) {
                clientCallback.call(0);
            }
        }

        @Override
        public void paramInAndOut(Bundle[] bundleIn, Bundle bundleOut) throws RemoteException {

        }
    }
```

其中的Stub是aldi工具自动生成的，[等会][aidl_implements]详细说为啥要继承自他而不是自己实现Interface即可。然后你在onBinde中返回这个实现的实例即可：   

```
private IBinder mBinder = new MyBinder();
public IBinder onBind(Intent intent) {
    log("onBind");
    return mBinder;
}
```

**client端**：
记得上面说的bindService的回调吗在`onServiceConnected`中：  

```java
public void onServiceConnected(ComponentName name, IBinder service) {
    log("service name:" + name);
    mDemoServiceBinder = IDemoServiceController.Stub.asInterface(service);
}
```

是的，这里还是要用那个Stub。然后你只需要在Client中调用mDemoServiceBinder 中的所有方法即可。因为Stub是实现了AIDL中的接口的，所以它提供给你了你定义的所有方法。  
**需要注意**：AIDL中定义的方法会抛出RemoteException，所以记得捕获之。

###好奇：“AIDL是怎么实现跨进程方法调用的  ”
这里点很类似于java EE中的RMI（Remote Method Invoke）。但是比他轻量级，简单，方便。想知道android中怎么实现RMI的，不妨从上面用的的神器Stub入手。于是我们就打开了sdk tool从aidl生成的java文件。看看Stub到底长啥样！！   

```java
public static abstract class Stub extends android.os.Binder implements com.example.service.IDemoServiceController {
    private static final java.lang.String DESCRIPTOR = "com.example.service.IDemoServiceController";

    /**
     * Construct the stub at attach it to the interface.
     */
    public Stub() {
        this.attachInterface(this, DESCRIPTOR);
    }

    /**
     * Cast an IBinder object into an com.example.service.IDemoServiceController interface,
     * generating a proxy if needed.
     */
    public static com.example.service.IDemoServiceController asInterface(android.os.IBinder obj) {
        if ((obj == null)) {
            return null;
        }
        android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
        if (((iin != null) && (iin instanceof com.example.service.IDemoServiceController))) {
            return ((com.example.service.IDemoServiceController) iin);
        }
        return new com.example.service.IDemoServiceController.Stub.Proxy(obj);
    }

    @Override
    public android.os.IBinder asBinder() {
        return this;
    }

    @Override
    public boolean onTransact(int code, android.os.Parcel data, android.os.Parcel reply, int flags) throws android.os.RemoteException {
        switch (code) {
            case INTERFACE_TRANSACTION: {
                reply.writeString(DESCRIPTOR);
                return true;
            }
            case TRANSACTION_paramInAndOut: {
                    data.enforceInterface(DESCRIPTOR);
                    android.os.Bundle _arg0;
                    if ((0 != data.readInt())) {
                        _arg0 = android.os.Bundle.CREATOR.createFromParcel(data);
                    } else {
                        _arg0 = null;
                    }
                    android.os.Bundle _arg1;
                    _arg1 = new android.os.Bundle();
                    this.paramInAndOut(_arg0, _arg1);
                    reply.writeNoException();
                    if ((_arg1 != null)) {
                        reply.writeInt(1);
                        _arg1.writeToParcel(reply, android.os.Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
                    } else {
                        reply.writeInt(0);
                    }
                    return true;
                }
        }
        return super.onTransact(code, data, reply, flags);
    }

    private static class Proxy implements com.example.service.IDemoServiceController { ... }
    
    ...
    static final int TRANSACTION_paramInAndOut = (android.os.IBinder.FIRST_CALL_TRANSACTION + 3);
    ...
        
}
```

所以说Stub是个抽象类，继承自Binder，实现了AIDL接口，我们在service端就是直接实现的这个类。在Stub有很长的一个方法叫`onTransact`他是Binder的方法，从上面可以看到（为了篇幅删了好几个case）。然后在case里面才调用到了aidl接口的实现，对边找一个case看看，会发现他是从Parcel中获取参数，然后调用真正的方法实现，最后在把返回值写回parcel。所以可以看到如果client调用某个方法，系统会调用service的onTransact。所以RMI最主要的还是数据（参数，返回值，Exception）的传输。

注意到Client中是把`onServiceConnection`返回的IBinder通过Stub的`asInterface`方法获取的ALDI实现，于是去看看`asInterface`是干嘛的。有点复杂，总之看最后一句`return new com.example.service.IDemoServiceController.Stub.Proxy(obj);`!哦！Stub里还有个Proxy类。所以我们最后拿到的是Proxy的实例咯。

其实从名字（Proxy）可以知道他是干啥的，就是个代理嘛，用到了面向对象的Proxy设计模式。所以我们在Client中调用的所有方法都是由Proxy实现的，于是看看Proxy。

举个栗子呗：

```java
@Override
public int paramInAndOut(android.os.Bundle bundleIn, android.os.Bundle bundleOut) throws android.os.RemoteException {
    android.os.Parcel _data = android.os.Parcel.obtain();
    android.os.Parcel _reply = android.os.Parcel.obtain();
    int _result;
    try {
        _data.writeInterfaceToken(DESCRIPTOR);
        if ((bundleIn != null)) {
            _data.writeInt(1);
            bundleIn.writeToParcel(_data, 0);
        } else {
            _data.writeInt(0);
        }
        mRemote.transact(Stub.TRANSACTION_paramInAndOut, _data, _reply, 0);
        _reply.readException();
        _result = _reply.readInt();
        if ((0 != _reply.readInt())) {
            bundleOut.readFromParcel(_reply);
        }
    } finally {
        _reply.recycle();
        _data.recycle();
    }
    return _result;
}
```

吼吼吼，所以就是把参数写进Parcel，调用Binder的transact，再从返回的parcel中取得数据，最后返回。其中readException会捕获service中抛出的异常，然后丢回给client。

###附录——Service回调Client
通过AIDL可以很方便的让client调用service的方法，但是有时候service需要回调Client。（比如报告任务的进度从而更新进度条。）

最简单粗暴的方式就是发广播！这个方法怎么样？好啊！真的不错，但是不够轻量级吧。而且有点不够方便。

> 有没有像AIDL中Client调Service中的方法呢，还是那样方便呀！
> 答案是：**有！**

好了，关子卖完了。说正事！

这里需要定义一个回调函数的AIDL接口（比如 "ICallback.aidl"），然后还要在Client——Service通信的AIDL中添加类似`boolean addCallback(in ICallback callback);`、`void invokeCallback();`的方法。

然后你在Client实现一个`ICallback.Stub`类，在`addCallback`中把他传给service，service收到之后存下来，当你调用`invokeCallback`的时候service就会调用刚才传进来的callback。

栗子——Client:    

```java
private ICallback mServiceCallback = new ICallback.Stub() {
    @Override
    public void call(int code) {
        log("pid:" + android.os.Process.myPid());
        mStartServiceButton.setBackgroundColor(Color.parseColor("#ff00ff"));
    }
};

if (mDemoServiceBinder != null) {
    try {
        mDemoServiceBinder.addCallback(mServiceCallback);
        log("add 1 + 2 = " + mDemoServiceBinder.add(1, 2));
    } catch (RemoteException e) {
        log("add 1 + 2 reveived remoteexception" + e.toString());
    }
} else {
    log("not binded yet");
}
```

栗子——Service：   

```java
private class MyBinder extends IDemoServiceController.Stub {
...
	@Override
    public boolean addCallback(ICallback callback) throws RemoteException {
        clientCallback = callback;
        return true;
    }

    @Override
    public void invokeCallback() throws RemoteException {
        if (clientCallback != null) {
            clientCallback.call(0);
        }
    }
...
}
```

很简单，就酱！

[aidl_default_type]: #aidl_default_type
[aidl_types]: #aidl_types
[parcelable]: #parcelable
[aidl_implements]: #aidl_implements

###参考资料
\[API Guide——Service\]：http://developer.android.com/guide/components/services.html

\[API Guide——AIDL\]: http://developer.android.com/guide/components/aidl.html

