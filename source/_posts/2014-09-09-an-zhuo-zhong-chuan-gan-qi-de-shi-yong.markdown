---
layout: post
title: "安卓中传感器的使用"
date: 2014-09-09 19:12:22 -0700
comments: true
categories: [android]
tags: [sensor]
---

由于需要一个像系统电话应用那样：打电话时可以使屏幕黑掉，手机离开时又能使屏幕亮起来的功能。所以需要能够获取「接近传感器」的数据。

Android中的传感器只是一个抽象，它可能是硬件传感器，也可能是通过软件模拟的一个传感器。但是不管哪一种，对程序员来说都是一样的。

Android中的传感器分为两类：

 * 连续性的传感器 比如：接近传感器，加速度传感器等。可以连续的反馈数据

 * 触发性的传感器 比如：significant motion sensor（好吧，我不知道他是啥；看名字貌似是监听用户的什么动作的）。总之就是那种会再特定情况下触发的传感器。

<!--more-->

Sensor的使用过程如下：


```java
public class SensorActivity extends Activity implements SensorEventListener {
    private final SensorManager mSensorManager;
    private final Sensor mAccelerometer;

    public SensorActivity() {
        //获取SensorManager
        mSensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        //获取对应的Sensor
        mAccelerometer = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
    }

    protected void onResume() {
        super.onResume();
        //注册一个Sensor的监听器，监听器的回调函数是在主线程中被调用的，因此要尽量避免阻塞主线程！
        mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);
    }

    protected void onPause() {
        super.onPause();
        //取消注册一个Sensor的监听器
        mSensorManager.unregisterListener(this);
    }

    /**
     * SensorEventListener的回调方法
     *
     * @param sensor
     * @param accuracy
     */
    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    /**
     * SensorEventListener的回调方法
     *
     * @param event
     */
    @Override
    public void onSensorChanged(SensorEvent event) {
        float[] values = event.values;
        /**
         * 这是传感器传送来的数据，根据不同的传感器，其值和数组长度会有所不同。
         */
    }
}
```
 
上面的注册监听器是针对以连续性的传感器，如果是触发性的传感器相应的换成：

 * 注册： [`boolean SensorManager::requestTriggerSensor(TriggerEventListener listener, Sensor sensor)`](http://developer.android.com/reference/android/hardware/SensorManager.html#requestTriggerSensor(android.hardware.TriggerEventListener, android.hardware.Sensor)

 * 取消注册：[`boolean SensorManager::cancelTriggerSensor(TriggerEventListener listener, Sensor sensor)`](http://developer.android.com/reference/android/hardware/SensorManager.html#cancelTriggerSensor(android.hardware.TriggerEventListener, android.hardware.Sensor)
 
 * 监听器：[`TriggerEventListener `](http://developer.android.com/reference/android/hardware/TriggerEventListener.html)

上面registerListener中最后一个参数是传感器的频率，频率越高单位时间内数据采集就越多，相应的也就更费电！频率从高到低分别是：

 1. `SensorManager.SENSOR_DELAY_FASTEST` : 获取数据尽可能的快
 
 2. `SensorManager.SENSOR_DELAY_GAME` : 适合游戏的频率
 
 3. `SensorManager.SENSOR_DELAY_NORMAL`： 正常的频率，一般实时性要求不高都可以用这个设定。
 
 4. `SensorManager.SENSOR_DELAY_UI`：适合普通用户界面的平率。由于频率低，所以，延时大，但是也会更省电。
 
