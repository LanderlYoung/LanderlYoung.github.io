---
layout: post
title: "stepByStepAndroid-第一课"
date: 2014-05-13 12:04:19 +0800
comments: true
categories: [Android]
tags: [Android, Java]
---

<资源>  

 * git项目[github](https://github.com/LanderlYoung/stepByStepAndroid)
 * 详见[release note](https://github.com/LanderlYoung/stepByStepAndroid/releases) 
 * [项目wiki](https://github.com/LanderlYoung/stepByStepAndroid/wiki)

</资源>

梳理一下第一课学到的内容:

 1. 创建简单的用户界面
    * 简单的布局控制
 2. 启动另一个Activity
    * 给button添加回调函数
    * 使用Intent
<!--more-->

###创建用户界面
修改原来的fragment_main.xml文件，使用LinearLayout：
``` xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="horizontal" >
</LinearLayout>
```
上面的android:orientation属性把LinearLayout设置成水平线性布局，所有元素水平排列。
然后在LinearLayout中添加控件EditText和Button
``` xml
    <EditText 
        android:id="@+id/edit_message"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:hint="@string/edit_message" />
  <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/button_send" />
```
然后在相应的strings.xml中添加string值。
效果如图：

![device-2014-05-12-231827](https://cloud.githubusercontent.com/assets/5700847/2953445/c8028f00-da59-11e3-9800-89a5c859064b.png =360x)

接着控制一下布局：让EditText占据LinearLayout横向的剩余空间。只需要调整两个方面`android:layout_weight="1"`和`android:layout_width="0dp"`，其中layout\_weight=1可以让它占据剩下的空间，layout\_width=0改善性能。
看一下效果：

![device-2014-05-12-235041](https://cloud.githubusercontent.com/assets/5700847/2953442/b9d4597c-da59-11e3-886d-08d3f8e667a9.png =360x)


##为button添加click事件处理
在Button中添加一行`android:onClick="sendMessage"`这样就指定了button的click事件由`public void onClick(View view)`这样方法签名的方法来处理。
所以对应的去MainActicity.java中添加该函数：
``` java
//call back of the button
public void sendMessage(View view) {
    Intent intent = new Intent(getApplication(),DisplayMessageActivity.class);
	EditText editText = (EditText)findViewById(R.id.edit_message);
	String message = editText.getText().toString();
	intent.putExtra(EXTRA_MESSAGE,message);
	startActivity(intent);
}
```
上面的DisplayMessageActivity类是使用向导创建的新Activity。

###创建新Activity
使用向导创建新的Activity，然后需要在AndroidManifest.xml里注册Activity

``` xml
   <application
       ......
        <activity
            android:name="com.young.stepbystepandroid.DisplayMessageActivity"
            android:label="@string/title_activity_display_message"
            android:parentActivityName="com.young.stepbystepandroid.MainActivity" >
            <meta-data
                android:name="android.support.PARENT_ACTIVITY"
                android:value="com.young.stepbystepandroid.MainActivity" />
        </activity>
    </application>
```

###使用Intent
*启动Intent*
``` java
    Intent intent = new Intent(getApplication(),DisplayMessageActivity.class);
    EditText editText = (EditText)findViewById(R.id.edit_message);
	String message = editText.getText().toString();
	intent.putExtra(EXTRA_MESSAGE,message);
	startActivity(intent);
```
其中`public static final String EXTRA_MESSAGE = "com.young.stepByStepAndroid.MESSAGE";`
这个是一个显示Intent构造函数第一个参数是Context，可以使用this，因为Activity继承Context；但是推荐使用ApplicationContext防止内存泄漏。
*接收Intent*
``` java
	Intent intent = getIntent();
	String message = intent.getStringExtra(
			MainActivity.EXTRA_MESSAGE);
	
	TextView textView = new TextView(this);
	textView.setTextSize(40);
	textView.setText(message);
```
代码很明显，不多说什么了。当然在Intent里面附加信息推荐使用[Bundle](http://developer.android.com/reference/android/os/Bundle.html)。

看看成果：

![device-2014-05-13-002646](https://cloud.githubusercontent.com/assets/5700847/2953446/d6257c5a-da59-11e3-8e67-80bbecb4640f.png =360x)

![device-2014-05-13-002651](https://cloud.githubusercontent.com/assets/5700847/2953447/d71cdef0-da59-11e3-9d39-e3e5d4de150d.png =360x)

		


