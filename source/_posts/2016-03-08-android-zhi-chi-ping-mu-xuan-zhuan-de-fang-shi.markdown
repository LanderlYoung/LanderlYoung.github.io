---
layout: post
title: "Android 支持屏幕旋转的方式"
date: 2016-03-08 01:13:23 +0800
comments: true
categories: [Android]
tags: [Android]
---

<h1>Android 支持屏幕旋转的方式</h1>

目录

[TOC]

###0. Preface
在Android中activity默认是支持屏幕旋转操作的。在屏幕旋转过程中所在的Activity会重建。

所谓的重建大致是这样一个流程：

1. onSaceInstanceState
2. Destroy current activity
3. reCreate current activity

因此Activity的状态都是保存在“InstanceState”中的，于是我们需要在重建Activity的时候恢复其状态。

###1.  关于旋转

####1.1 配置/禁用旋转
屏幕旋转是在Manifest可以配置的，对应的attribute是`android:screenOrientation`，常用的配置有`portrait`和`landscape`，分别对应 “竖屏”和“横屏”。可以配置支持多种方向，中间用管道符号`|`隔开，像酱紫`portrait|landscap`.

如果你只配置一个方向，就相当于禁用了屏幕旋转了。

这个属性的取值还是相当丰富的，详细内容请参阅[官方文档][0]。

当然还可以在代码中设置屏幕方向和获取当前方向。

**设置**
```java
//set orentation in java code programatically

//For Landscape mode
setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);

//For Portrait Mode
setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

//For ANYTHING, please RTFM
setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_<ANYTHING>);
```

**获取**
```java
//get current screen orientation
public String getOrientation() {
    Display display = ((WindowManager) getSystemService(WINDOW_SERVICE)).getDefaultDisplay();
    int orientation = display.getRotation();
    switch (orientation) {
        case Surface.ROTATION_0:
            return "portrait";
        case Surface.ROTATION_90:
            return "land";
        case Surface.ROTATION_180:
            return "portrait reverse";
        case Surface.ROTATION_270:
            return "land reverse";
        default:
            throw new AssertionError("not gonna happen");
    }
}
```

####1.2 资源
我们知道Android的`Resources`是配置了一个`android.content.res.Configuration`的，这个配置内容很丰富，其中就包括了屏幕方向。`Resources`会根据配置去取得相应的资源，比如根据语言去哪字符资源。
在Resources的强力支持下，你可以给不同的屏幕方向相应的资源文件，默认都是竖屏的，把横屏的放在 xxx-land，如`layout-land`，你可以引用同一个资源id，在`Resources`加载资源时会根据`Configuration`自动选择。

###2. Configuration
根据Android的`android.content.res.Configuration`文档说明，这些“配置”是能够影响Resources怎么拿到资源的所有信息的集合。举个例子，系统语言设置会影响Resources拿到字符串资源，中文还是英文？详细信息可以参看[官方文档][1].
因此当`Configuration`变化的时候，Activity能拿到的resources也会发生变化。于是Android系统会重建该Activity，来更新界面。其中屏幕方向也是`Configuration`中的一个维度。因此屏幕旋转时也会导致Activity重建。

但是有时候Activity希望自行处理相应的`Configuration`变化事件，这时候系统给我们提供了这样的机会。

在Manifest的Activity标签中有这样一个attribute `android:configChanges`，在这里声明希望自行处理的事件，多个事件之间用管道符号`|`来分隔，举个栗子

```xml
<activity
    android:name=".mediacodec.MediaCodecActivity"
    android:theme="@style/AppTheme"
    android:label="MediaCodec"
    android:configChanges="orientation|screenSize|locale"
    >
```

需要注意一点：在Android3.2 （API 13）之后，屏幕旋转会同时触发`orientation`和`screenSize`两个变化。

然后在`Activity::onConfigurationChanged(Configuration)`中处理相应的变化即可，这时候不会重新创建Activity。

**notice**：
>即使不重建Activity，屏幕旋转的时候，界面也会跟着转过来，只是布局还是之前那个布局。

###3. 状态保存

我们知道Activity重建时ActivityThread直接通过反射创建了一个新的Activity实例，之前的所有实例相关的内容都会丢失。
那么，界面重建时，==**状态怎么保存**==。


前面我们说到了`onSaveInstanceState`，但是这个方法有一个超级，及其，特别严重的问题：他只能存可以被序列化的值类型。想象这样的场景，我正在下载文件，于是我有一个tcp的socket，我当然希望界面重建不会打断下载过程。我可以序列化下载进度，但是要让我序列化socket！！！请恕臣妾做不到啊！！！

然后这时候脑海里开始蹦出来黑魔法：static变量！存在Application里！使用单例！

嗯~淡定，淡定。系统已经考虑到这种情况了。并且专门提供了相应的方法给我们用。

####3.1 Activity保存状态的方法

```java
//1
Object Activity::onRetainNonConfigurationInstance();

//2
Object Activity::getLastNonConfigurationInstance();
```

Activity可以覆盖1，然后return需要保存的实例（比如Socket，数据库Cursor）。然后在onCreate中通过方法2拿到上面返回的内容。

所以大致是这样一个使用方式：

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    mDownloadTcpSocket = (Socket) getLastNonConfigurationInstance();
}

@Override
public Object onRetainNonConfigurationInstance() {
    return mDownloadTcpSocket;
}
```

关于`onRetainNonConfigurationInstance`需要注意的是：
1. 文档中说你可以在中返回任何实例，甚至是Activity自身。但是这个只是理论上，因为这里返回的实例会被新创建的Activity引用住，如果真的返回了Activity自身，估计屏幕旋转几次就会OOM了。

2. 尽量不要在这个方法中保存Resources相应的东西，甚至是View。因为Configuration变换本身会导致Resource（可能）拿到不同的资源。（取决于res的内容）。如果一定要保存，请三思而行，并留下充足的文档说明。

3. 避免Activity自身实现一些回调的interface。原因你懂得。因为当前的实例会销毁，新创建的实例和前一个引用是不一样的。所以在Activity销毁之前发出的请求，永远不会回调给新创建的Activity。另外如果这个回调是被强引用的就更危险了，当你旋转几次屏幕时，系统就会给你发来贺电“恭喜你OOM了”。

4. 文档中还说，这个方法再`onStop`和`onDestroy`之间调用。并且在`onDestroy`调用之后，会立即创建一个新的Activity，在这段时间里会阻止主线程的消息分发。

5. 然后官方文档有一句是这样的话，让我很困惑
	> This function is called purely as an optimization, and you must not rely on it being called.  When it is called, a number of guarantees will be made to help optimize configuration switching...
	
	这让我很害怕，如果这个方法不一定会调用那不是很糟！！于是我被迫看了看系统源代码，在`ActivityClientRecord ActivityThread::performDestroyActivity(...)`中找到了蛛丝马迹。只要Configuration change，`onRetainNonConfigurationInstance`一定会调用。API文档的意思估计是说非Configuration change的时候不调用吧\_\_(:3」∠)\_

6. 这个方法被废弃了。。。。

####3.2 Fragment保存状态的方法

蛤？刚才说那个方法被废除了。嗯，是的，看到文档有这一句我也是这个心情。原话这么说的

> @deprecated Use the new {@link Fragment} API {@link Fragment#setRetainInstance(boolean)} instead; this is also available on older platforms through the Android compatibility package.

既然如此去了解一下Fragment的这方面内容吧。

`Fragment::setRetainInstance`的文档是这么说的.

> Control whether a fragment instance is retained across Activity re-creation (such as from a configuration change).

原来这个方法也是做状态保存的,通过设置这个flag为true你可以做到：
1. 保证Fragment在Activity重建的过程中不被销毁
2. 保存Fragment的实例，并在新的Activity重建的时候自动恢复所有Fragment的状态（包括BackStack）

啊哈！新API果然牛叉！这次连Fragment自身都能保留了。

> もう何も怖くない（已经没什么好害怕的了） —— ともえ まみ



于是新的Fragment就可以在旋转屏幕的时候无缝切换了。简直爽呀！！！

关于`setRetainInstance`需要注意的地方：
1. 该方法的文档中说到
	> This can only be used with fragments not in the back stack.

	然而经过亲身实践和查阅源代码我发现这里和BackStack并没有半毛钱的关系\_\_(:3」∠)\_，不信找代码看看。
	```java
	public void Fragment::setRetainInstance(boolean retain) {
        if (retain && mParentFragment != null) {
            throw new IllegalStateException(
                    "Can't retain fragements that are nested in other fragments");
        }
		//直接set不判断是够在BackStack
        mRetainInstance = retain;
    }
	
    ArrayList<Fragment> FragmentManager.FragmenagerImpl::retainNonConfig() {
        ArrayList<Fragment> fragments = null;
        if (mActive != null) {
            for (int i=0; i<mActive.size(); i++) {
                Fragment f = mActive.get(i);
				//这里只判断是否retainInstance，并没有判断BackStack之类的。
                if (f != null && f.mRetainInstance) {
                    if (fragments == null) {
                        fragments = new ArrayList<Fragment>();
                    }
                    fragments.add(f);
                    f.mRetaining = true;
                    f.mTargetIndex = f.mTarget != null ? f.mTarget.mIndex : -1;
                    if (DEBUG) Log.v(TAG, "retainNonConfig: keeping retained " + f);
                }
            }
        }
        return fragments;
    }
	```
	所以不知这句doc意义何在。StackOverFlow有人说如果BackStack中有Fragment会retain有的不会retain，这样会导致问题，但是我觉得理由有点牵强，不retain的也会重新创建然后恢复状态呀。

###4. 生命周期

####4.1 Activity
在发生ConfigurationChange时，Activity会经历先销毁再重新创建的过程。该过程的生命周期和一般情况无疑。
在从onPause开始的销毁过程中可以通过`Activity::isChangingConfigurations()`方法判断是因为ConfigurationChange导致销毁。

####4.2 Fragment
如果是一般的Fragment，和Activity一样会经历 **销毁->FragmentManager恢复Fragment->重建新Fragment** 的过程。
如果调用了上面说到的`Fragment::setRetainInstance(true)`，则

Fragment的声明周期会发生细微差别。总体的销毁创建的生命周期方法都会调用，除了下面的这一对

* onDestroy
* onCreate

因为Fragment并没有真正的销毁，在Activiyt重建之后使用的Fragment引用还是重建之前的那一个。我认为这样处理也是很合理的。
如果需要在onPause和onStop中判断是否彻底释放相应资源可以通过`getActivity().isConfigurationChanges()`来判断。

整个生命周期变成这样子。

```text
graph TD;

	subgraph destroy
	A(Configuration change) -- destroy --> B[onPause]
	B --> C[onStop]
	C --> D[onDestroyView]
	D --> E[onDetach]
	end

	subgraph restart
	AA(Configuration change) -- restart --> F[onAttach]
	F --> G[onCreateView]
	G --> H[onActivityCreated]
	H --> I[onStart]
	I --> J[onResume]
	end

	D -.not called.-> onDestroy[onDestroy]
	onDestroy -.-> E;
	F -.not called.-> onCreate[onCreate]
	onCreate -.-> G;
```

[0]:http://developer.android.com/intl/zh-cn/guide/topics/manifest/activity-element.html
[1]:http://developer.android.com/intl/zh-cn/reference/android/content/res/Configuration.html
