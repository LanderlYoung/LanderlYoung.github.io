---
layout: post
title: "Android中的WakeLock使用"
date: 2014-10-30 19:08:26 -0700
comments: true
categories: [android]
tags: [android, wakelock]
---



android系统在手机屏幕锁定之后一般会让手机休眠，以提高电池的使用时间。但是休眠意味着CPU频率降低，有时候可能需要做一些需要大量运算的任务，所以需要唤醒CPU。WakeLock可以做到这一点。


<!--more-->

###WakeLock的创建是：



```java

PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);

Wakelock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,

        "MyWakelockTag");

```



另外如果要使用WakeLock需要在Manifest中添加如下权限

`<uses-permission android:name="android.permission.WAKE_LOCK" />`



###WakeLock的等级

上面的第一个参数是WakeLock levelAndFlag，分别代表了一种WakeLock等级，并且可以通过「或」位操作组合使用。他们是：



 1. PARTIAL_WAKE_LOCK：保证CPU保持高性能运行，而屏幕和键盘背光（也可能是触摸按键的背光）关闭。一般情况下都会使用这个WakeLock。

 2. ACQUIRE_CAUSES_WAKEUP：这个WakeLock除了会使CPU高性能运行外还会导致屏幕亮起，即使屏幕原先处于关闭的状态下。

 3. ON_AFTER_RELEASE：如果释放WakeLock的时候屏幕处于亮着的状态，则在释放WakeLock之后让屏幕再保持亮一小会。如果释放WakeLock的时候屏幕本身就没亮，则不会有动作。



被**弃用**的WakeLock：



 1. SCREEN_DIM_WAKE_LOCK：保证屏幕亮起，但是亮度可能比较低。同时键盘背光也可以不亮。

 2. SCREEN_BRIGHT_WAKE_LOCK ：保证屏幕全亮，同时键盘背光也亮。

 3. FULL_WAKE_LOCK：表现和SCREEN_BRIGHT_WAKE_LOCK 类似，但是区别在于这个等级的WakeLock使用的是**最高亮度**！



这三个Level在API17被弃用。被弃用说明肯定有替代品吗，上面三个类型的作用无非就是保持屏幕长亮。所以推荐是用WindowFlag`WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON`。使用方法是：

 1. 在Activity中： `getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);`

 2. 甚至可以在布局中添加这个属性：`android:keepScreenOn="true"`



被**隐藏**的WakeLock：



android中的部分api并不对用户应用开放，他们通过在注释中加入`{@hide}`来注明。但是在SDK提供的源代码中是可以看到的。



 * WAIT_FOR_PROXIMITY_NEGATIVE：用于和接近传感器配合使用，来实现电话应用中打电话时可以使屏幕黑掉，手机离开时又能使屏幕亮起来的功能。acqure的时候屏幕会暗下来，release之后屏幕会亮。其值是32（int）。虽然被hide起来，但是感觉这个超实用的好吗！！！为啥要hide起来。。。「话说在API21 上终于开放了（开放这么晚有个屁用啊(╯‵□′)╯︵┻━┻）」经试验，不过newWakeLock的时候flag直接用32代替是可以创建这个等级的WakeLock的，但是因为是非开放API，不能保证第三方OEM修改这个代码实现！因此使用起来并不安全。「说的好像开放的API第三方OEM就不会乱改一样。。。(╯‵□′)╯︵┻━┻」



###WakeLock的使用：

 * 获取WakeLock：

	 1. `void acquire()`:获得WakeLock

	 2. `void acquire(long timeOut)`:获得WakeLock timeOut时长，当超过timeOut之后系统自动释放WakeLock。

 * 释放WakeLock：`release()`

 * 判断是否已经获取WakeLock：`boolean isHeld()`

 * `void setReferenceCounted(boolean value)`：是否使用引用计数。类似于垃圾回收策略，只是把垃圾回收改成了WakeLock回收。如果value是true的话将启用该特性，如果一个WakeLock acquire了多次也必须release多次才能释放掉。但是如果释放次数比acquire多则会抛出`RuntimeException("WakeLock under-locked " + mTag)`异常。**默认是开启了引用计数的！**



###PowerManager的几个实用方法

 1. `boolean PowerManager::isScreenOn ()`判断屏幕是否亮着（不管是暗的dimed还是正常亮度），在API20被弃用，推荐`boolean PowerManager::isInteractive ()`

 2. `void PowerManager::goToSleep(long time)`time是时间戳，一般是System.currentTimeMillis()+timeDelay。强制系统立刻休眠，需要Manifest中添加权限`"android.permission.DEVICE_POWER"`。按下电源键锁屏时调用的就是这个方法。

 3. `void PowerManager::wakeUp(long time)`与上面对应。参数含义，所需权限与上同。按下电源键解锁屏幕时调用的就是这个方法。

 4. `void PowerManager::reboot(String reason)`重启手机，reason是要传给linux内核的参数，比如“recovery”重启进recovery模式，“fastboot”重启进fastboot模式。需要权限`"android.permission.REBOOT"`。
