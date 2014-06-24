---
layout: post
title: "Android 中的Handler相关源代码浅析"
date: 2014-06-24 17:01:09 +0800
comments: true
categories: [ Android ]
tags: [ Android, Android源代码 ]
---

简单用法示例：

``` java
//在主线程中
private Handler handler = new Handler() {
    // 处理子线程给我们发送的消息。
    @Override
        public void handleMessage(android.os.Message msg) {
            byte[] data = (byte[])msg.obj;
            Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
            imageView.setImageBitmap(bitmap);
            Log.v("handler", "thread:" + Thread.currentThread().getName() +
                    " msg.target=" msg.getTarget());
            if(msg.what == DOWNLOAD_IMG){
                dialog.dismiss();
            }
        }
}
```

然后开启新的线程，在新的线程里面完成后台任务，任务完成后给这个handler发一个消息让它来处理。因为Handler是在主线程实例化(并且在实例化的时候没有指明Looper)，因此handler的handleMessage方法也是在主线程被调用的。

// 使用Handler Message MessageQueue Looper等方式去访问网络资源的时候，我们必须要开启一个子线程

```
public class MyThread implements Runnable{
    // 在run方法中完成网络耗时的操作
    @Override
        public void run() {
            HttpClient httpClient = new DefaultHttpClient();
            HttpGet httpGet = new HttpGet(imgPath);
            HttpResponse httpResponse = null;
            try {
                Log.v("debug", "start download picture in thread:" +
                        Thread.currentThread().getName());
                httpResponse = httpClient.execute(httpGet);
                Log.v("debug", "download complete with status code" +
                        httpResponse.getStatusLine().getStatusCode());
                if(200 == httpResponse.getStatusLine().getStatusCode()){
                    byte[] data = EntityUtils.toByteArray(httpResponse.getEntity());
                    // 这里的数据data我们必须发送给UI的主线程，所以我们通过Message的方式来做桥梁。
                    Message message = Message.obtain();
                    message.obj = data;
                    message.what = DOWNLOAD_IMG;
                    handler.sendMessage(message);
                }
            } catch (Exception e) {
                // TODO: handle exception
            }
        }
}
```

分析一下整个过程的大致流程,首先从Handler的sendMessage下手：从源代码中看，sendMessage最终会调用到Handler中的sendMessageAtTime。

``` java
public boolean sendMessageAtTime(Message msg, long uptimeMillis)
{
    boolean sent = false;
    MessageQueue queue = mQueue;
    if (queue != null) {
        msg.target = this;
        sent = queue.enqueueMessage(msg, uptimeMillis);
    }
    else {
        RuntimeException e = new RuntimeException(
                this + " sendMessageAtTime() called with no mQueue");
        Log.w("Looper", e.getMessage(), e);
    }
    return sent;
}
```

看得出来主要做的事情就是把消息的target设置成自己，然后把消息存入到消息队列MessageQueue中去，
接着首先去看看MessageQueue mQueue的定义

在Handler类的最后，既然是final的那初始化一定在构造函数了：
默认构造函数，代码中的注释写道“默认构造函数，把这个handler和当前线程的消息队列联系起来，如果没有（当前线程的消息队列），这个handler就不能接收消息了。

```
/**
 * Default constructor associates this handler with the queue for the
 * current thread.
 *
 * If there isn't one, this handler won't be able to receive messages.
 */
public Handler() {
    ...
        mLooper = Looper.myLooper();
    if (mLooper == null) {
        throw new RuntimeException(
                "Can't create handler inside thread that has not called Looper.prepare()");
    }
    mQueue = mLooper.mQueue;
    mCallback = null;
}
```

使用提供的消息队列，而不是使用默认的。

``` java
/**
 * Use the provided queue instead of the default one.
 */
public Handler(Looper looper) {
    mLooper = looper;
    mQueue = looper.mQueue;
    mCallback = null;
}
```

从上面两个函数可以看出来消息队列是Looper的，handler的sendMessage只是把Message加到了消息队列去。接着去看看Looper对消息对了mQueue做了什么。

Looper中的MessageQueue的定义如下：



然后是Looper 中的loop方法

``` java
/**
 * Run the message queue in this thread. Be sure to call
 * {@link #quit()} to end the loop.
 */
public static void loop() {
    final Looper me = myLooper();
    if (me == null) {
        throw new RuntimeException("No Looper; Looper.prepare() wasn't called on this thread.");
    }
    final MessageQueue queue = me.mQueue;

    // Make sure the identity of this thread is that of the local process,
    // and keep track of what that identity token actually is.
    Binder.clearCallingIdentity();
    final long ident = Binder.clearCallingIdentity();

    for (;;) {
        Message msg = queue.next(); // might block
        if (msg == null) {
            // No message indicates that the message queue is quitting.
            return;
        }

        // This must be in a local variable, in case a UI event sets the logger
        Printer logging = me.mLogging;
        if (logging != null) {
            logging.println(">>>>> Dispatching to " + msg.target + " " +
                    msg.callback + ": " + msg.what);
        }

        msg.target.dispatchMessage(msg);

        if (logging != null) {
            logging.println("<<<<< Finished to " + msg.target + " " + msg.callback);
        }

        // Make sure that during the course of dispatching the
        // identity of the thread wasn't corrupted.
        final long newIdent = Binder.clearCallingIdentity();
        if (ident != newIdent) {
            Log.wtf(TAG, "Thread identity changed from 0x"
                    + Long.toHexString(ident) + " to 0x"
                    + Long.toHexString(newIdent) + " while dispatching to "
                    + msg.target.getClass().getName() + " "
                    + msg.callback + " what=" + msg.what);
        }

        msg.recycle();
    }
}
```

注意到中间的死循环 `for(;;;){...}`
以及关键的这一句：


猜测target就是这个message对应处理他的handler，于是我圆润的滚过去看看：
Message中的target是这么定义的：

看来八九不离十了。继续看target赋值的语句：

当然还有各种带有Handler参数的obtain方法，都会给target赋值。
于是看看Handler.dispatchMessage(Message)是做什么的：

``` java
public void dispatchMessage(Message msg) {
    if (msg.callback != null) {
        handleCallback(msg);
    } else {
        if (mCallback != null) {
            if (mCallback.handleMessage(msg)) {
                return;
            }
        }
        handleMessage(msg);
    }
}
```

如果msg的callback不为null就调用callback，否则如果就看看mCallback有没有设置，如果有的话就让callback来处理消息，如果没有就是用默认的处理方法。默认的处理方法是什么都不多，但是子类如果覆盖了handleMessage方法就可以执行子类想要做的代码了。

但是 事情没有那么简单！还有一个无参数的obtain方法，那么没有指定target的message是怎么成功发送到相应的handler的呢？还是圆润的滚过去看Looper的代码吧。



