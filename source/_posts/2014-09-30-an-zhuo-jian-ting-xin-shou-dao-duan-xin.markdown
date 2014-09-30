---
layout: post
title: "安卓监听新收到短信"
date: 2014-09-30 11:52:25 +0800
comments: true
categories: [Android]
tags: [Android]
---

安卓收到短信的事件是由系统发一个有序广播的，所以这里需要一个BroadcastReceiver。receiver收到的Intent里面并不是直接存储的短信内容，而是短信的原始数据。所以我们需要自己解码。

**获取短信的原始数据：**
原始数据被叫做[PDU][1]，一个PDU就是一个数据段，如果短信比较长的话可能是由几个PDU组成的。

```java
@Override
public void onReceive(Context context, Intent intent) {
    //监听到验证码短信后自动填写验证码
    Log.i(TAG, "SMSBroadcastReceiver SMS_RECEIVED");
    Bundle smsBundle = intent.getExtras();

    if (smsBundle != null) {
        Object[] pdus = (Object[]) smsBundle.get("pdus");
    }
}
```

<!--more-->

上面的`smsBundle.get("pdus")`返回的实际类型是`byte[][]`，二位数组的每一个子数组就是一个pdu。

**解码短信内容：**
这里主要使用到的是[`SmsMessage.createFromPdu`][2]方法。

```java
private String parseMessageFromRawData(Object[] pdus) {
    if (pdus == null) return null;

    try {
	    StringBuilder message = new StringBuilder();
        for (Object pdu : pdus) {
            SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
            if (smsMessage == null) continue;
            message.append(smsMessage.getDisplayMessageBody());
        }
        return message.toString();
    } catch (Exception e) {
        Log.e(TAG, "SMSBroadcastReceiver read sms failed", e);
    } catch (OutOfMemoryError oom) {
        Log.e(TAG, "SMSBroadcastReceiver caused OOM =_=!", oom);
        //为了避免后续操作出现问题，gc一下
        System.gc();
        System.gc();
    }
    return null;
}
```

上面的重点就是`SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);`这一句了。需要注意的是这个操作容易导致OOM（已经有好多Crash上报了。。。），所以要特别处理一下。

**另外：**
上面的[`SmsMessage.createFromPdu`][2]方法已经被官方文档说明即将被废弃（deprecated）原因是为了同时支持[3GPP][3]和[3GPP2][4]，他们是移动系统通信标准的拟定组织分别拟定了`GSM/UMTS/LTE`标准和`CDMA/LTE`标准。因此推荐是用的方法是`createFromPdu(byte[] pdu, String format)`其中fotmat可以是`SmsConstants.FORMAT_3GPP`或者`SmsConstants.FORMAT_3GPP2`。

出于好奇我看了一眼[`SmsMessage.createFromPdu`][2]的代码实现，发现他本身就做了制式判断的（=_=!），代码写的还是不错的，粘出来。万一以后这个方法被废弃了，还有个参考。

```java
public static SmsMessage createFromPdu(byte[] pdu) {
     SmsMessage message = null;

    // cdma(3gpp2) vs gsm(3gpp) format info was not given,
    // guess from active voice phone type
    int activePhone = TelephonyManager.getDefault().getCurrentPhoneType();
    String format = (PHONE_TYPE_CDMA == activePhone) ?
            SmsConstants.FORMAT_3GPP2 : SmsConstants.FORMAT_3GPP;
    message = createFromPdu(pdu, format);

    if (null == message || null == message.mWrappedSmsMessage) {
        // decoding pdu failed based on activePhone type, must be other format
        format = (PHONE_TYPE_CDMA == activePhone) ?
                SmsConstants.FORMAT_3GPP : SmsConstants.FORMAT_3GPP2;
        message = createFromPdu(pdu, format);
    }
    return message;
}
```


[1]:http://en.wikipedia.org/wiki/Protocol_data_unit 
[2]:http://developer.android.com/reference/android/telephony/SmsMessage.html#createFromPdu(byte[]) 
[3]:http://en.wikipedia.org/wiki/3GPP 
[4]:http://en.wikipedia.org/wiki/3GPP2 


