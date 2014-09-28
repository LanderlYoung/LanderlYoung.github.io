---
layout: post
title: "Java(Android)中线程池的使用"
date: 2014-09-23 17:39:40 +0800
comments: true
categories: [java]
tags: [java, android]
---

java SE5提供了`java.util.concurrent.Executors`类来实现线程池的功能。
Thing in Java 中这么解释Executors：

>`Executors`允许你执行异步的任务（task）而不用显式的去管理线程的生命周期。 

可以说Executors是线程们的管理者，让线程们的生存方式从**放养**变成了**圈养**。Executors来处理一次能同时运行多少个线程，哪个线程在哪个线程的后面执行。总的来说Executors之于线程就像操作系统止于进程一样——管理者与被管理者的关系。 

<!--more-->

**new Thread的弊端如下：**

 1. 每次new Thread新建对象性能差。

 2. 线程缺乏统一管理，可能无限制新建线程，相互之间竞争，及可能占用过多系统资源导致死机或oom。

 3. 缺乏更多功能，如定时执行、定期执行、线程中断。

**相比new Thread，Java提供的四种线程池的好处在于：**

1. 重用存在的线程，减少对象创建、消亡的开销，性能佳。

2. 可有效控制最大并发线程数，提高系统资源的使用率，同时避免过多资源竞争，避免堵塞。

3. 提供定时执行、定期执行、单线程、并发数控制等功能。

（上述比较摘自：http://www.trinea.cn/android/java-android-thread-pool/ ）

Executors的使用静态方法来创建相应的`ExecutorService`接口实现，如下：

 * `Executors.newCachedThreadPool()`
 * `Executors.newFixedThreadPool()`
 * `Executors.newScheduledThreadPool()`
 * `Executors.newSingleThreadExecutor()` 
 
 
 这些线程池分别具有不同的能力： 
 （Java Concurrency in Pratice——java编程实践，如下解释）
 
 * newFixedThreadPool：创建一个定长的线程池，每提交一个任务就创建一个线程，直到达到池的最大长度，这时线程池会保持长度不再变化（如果一个线程由于未预期的Exception而结束，线程池会补充一个新线程）。
 
 * newCachedThreadPool：创建一个可缓存的线程池，如果当前线程池的长度超过了处理的需要时，它可以灵活的回收空闲的线程，当需要增加时，它可以灵活的添加新的线程，而不会对池的长度作任何限制。
 
 * newSingleThreadExecutor：创建一个单线程化的executor，它只创建唯一的worker线程来执行任务，如果这个线程异常结束，会有另一个取代它。executor会保证任务依照任务队列规定的顺序（FIFO，LIFO，优先级）执行。
 
 * newScheduledThreadPool：创建一个定长的线程池，而且支持定时的以及周期性的任务执行，类似于Timer。
 
###ExecutorService的使用

`ExecutorService`接口继承自Executor的接口定义，他提供了一个线程池应该实现的方法定义，包括运行/提交新任务的方法，结束任务的方法，等等。
`ExecutorService`的接口有：

**提交任务**：

 * `execute`（该方法继承自Executor）提交一个runnable接口封装的task，没有返回值

 * `submit` 提交一个Callable或者Runnable接口封装的任务，返回一个Feature。

 *  `invokeAll`传入一个task的容器，执行其包含的所有task。

 * `invokeAny`传入一个task的容器，只要其中一个task异常终止，就结束其他task（如果还没执行就不再执行）。
 
**终止线程池**：

 * `shotdown`线程池停止接受新的task，所有已有task执行完后线程池随即关闭

 * `shutdownNow`立即终止线程池内的所有task，关闭线程池

**重要的一点**：因为只要有一个非Daemon线程运行着，就会阻止JVM的正常退出。所以线程池一定要记得shutdown！ 

所以向ExecutorService提交的任务可以是通过`Runnable`或者`Callable`接口封装的，其中Callable接口带有一个类型参数，表示返回值的类型。Runable可以使用execute方法，提交。但是Runnable和Callable都可以使用submit方法提交。execute方法没有返回值，submit方法会返回一个Future<T>类型，可以查看任务的执行状态以及获取任务的返回）。所以当你想要一个任务完成时返回一个返回值，submit将是你的不二之选（不要三四千，不要一两千，只要998，submit抱回家）。

**关于Future<T>**

Future功能强大，提供了对任务的各种操作：

 * `isDone()` 返回任务是否已经执行完成

 * `get()`返回任务的返回值，如果调用get的时候任务还没有完成，则会阻塞知道任务完成

 * `get(long timeout, TimeUnit unit)`同上，但是多了个参数，表示阻塞的最大时长。如果在设定的最大阻塞时长内没有指定任务没有顺利结束并返回结果，该方法会抛出一个`java.util.concurrent.TimeoutException`。

 * `cancel(boolean mayInterruptIfRunning)` 尝试去取消一个任务的执行，如果一个任务已经结束，或者已经被取消，或者因为一些什么原因不能够取消，则会取消失败，同时返回false。如果一个任务还没有开始执行就被取消了，那么它将不再执行。如果这个方法被调用的时候，任务正在执行，则将由参数`mayInterruptIfRunning`决定是否终止正在运行的task。

 * `isCancelled()` 返回任务是否已经被取消

了解过强大的Future是否觉得execute可以去死了，连个Future都返回不了，事实上并非如此，因为submit最终调用的还是execute-_-其实现方法是给execute传入一个RunnableFuture接口的实例（在标准库里有一个很好的实现叫FutureTask），RunnableFuteure接口定义了一个觉有Future功能的Runnalbe。想自定义Future就可以通过这种方式。

submit也是可以传入Runnable的，当传入Runnable时会怎样呢：

 * 当使用 `submit(Runnable)`时，返回一个`Future<?>`，它的get方法会返回null，除此之外其他方法调用表现正常。

 * 当使用`submit(Runnable task, T result)`时，返回一个Future<T>，它的get方法会返回result。就好比task是一个会返回result的Callable。


另外一个小tip就是Executors提供了Runnable转Callabe的静态方法：

 * `public static <T> Callable<T> callable(Runnable task, T result)`将Runnable转换成能返回result的Callable接口

 * `public static Callable<Object> callable(Runnable task)`将Runnable转换成返回null的Callable接口



