---
layout: post
title: "dictionary_Node.js-项目启航"
date: 2014-01-05 22:32:13 +0800
comments: true
categories: [Node.js, dictonary_Node.js]
---

&lt; 开场白 &gt;

[**基于Node.js的命令行词典应用**][0]

项目刚开始做，今天先做个铺垫吧。

&lt;/ 开场白 &gt;

一直以来都很想学习一下web技术，HTML5, CSS3, Javascript，前段时间算是终于闲下来了（其实是好多课没有意思，不想去上了），于是学习了一下，同时还写了一个Chrome 应用  [Magent2Torrent][1]。了解javascript之后发现她真是一个灵活可爱的语言，也可能是我接触的第一个动态语言（或者叫弱类型语言），总觉得她有着无限的魅力。同时还喜欢上了JSON！

前一段时间（在这个github博客搭建之前）玩了一下[Node.js][2]，发现这真是个好东西，我可以在本地执行javascript脚本了, 尽管Node.js的设计初衷并非如此……（我这是玩得有点偏了）虽然和python等本地执行的脚本语言在API上还有差距，鉴于Node.js可以使用C++模块（add on），也算是功能完备了。

之前用过一个python写的脚本，可以请求有道网页版的词典，然后解析得到的html内容，行命令行输出单词解释，于是我冒出了用javascript+Node.js实现上述功能的想法。
与之前的python脚本不同的是，我打算使用有到的API来查询单词。

鉴于有到词典的查询API需要申请，且免费用户查询次数有限，我决定使用wireshark抓包来得到官方
API。抓包的应用是win8上的有道词典。得到的数据如下：

``` cpp
GET /search?keyfrom=metrodict.main&xmlDetail=true&doctype=xml&xmlVersion=8.1&dogVersion=1.0&q=node&le=eng&keyfrom=metrodict.input&client=metrodict&id=3019615280104595010663601040404140109040186114402823410158212201782429070109&appVer=1.1.49.6663.beta&vendor=store HTTP/1.1

Host: dict.youdao.com

... ...
```

可以从中看到各个参数，其中参数q就是我们要查询的单词，此处是node。其他参数事实上并不需要考虑太多，不过秉承着geek精神还是看一下为好。

------------------

 * keyfrom明显意思是数据来源，此处是metrodict.main和win8客户段吻合。
 * xmlDetail看来是个bool类型，此处为true，可以猜测如果为false可能返回解释会比较简单。
 * doctype肯定是文档类型，此处是xml。
 * xmlVersion，xml文档的版本。
 * dog.Version, 又是某个东西的版本。
 * **q**就是要查询的单词了。
 * le看来是语言的意思，le = language，值是eng表示英语english。
 * kerfrom和前文一样。client是客户端，这里是metrodict就是win8的词典啦。
 * id，卧槽！这么长，估计申请到的id就是这样，这个id肯定是有道官方使用的id（绝对没有查询次数限制，哦吼吼！）
 * appVersion指定客户端应用版本。
 * vender不清楚什么意思，不管他啦。

------------------

总结下来两个有用的参数xmlDetail和q。打开chrome验证一下看看是不是。

 1.xmlDetail=true版的hello查询。[戳这里][3]

 2.xmlDetail=false版的hello查询。[戳这里][4]

额。。。有种坑爹的感觉，这TM不是一样的吗！！！ 嘛，嘛。淡定，就当他是一样的好啦。这么说来只有 **q** 参数有实际用处了。

接下来再瞅瞅发音是怎么回事，老方法。wireshark抓包得到的结果是：

``` cpp
GET /dictvoice?audio=world&type=2 HTTP/1.1
Accept: */*
If-Modified-Since: Sun,  05 Jan 2014 14:04:56 GMT
User-Agent: Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)
GetContentFeatures.DLNA.ORG: 1
Pragma: getIfoFileURI.dlna.org
Accept-Language: zh-Hans-CN, zh-Hans;q=0.8, en-US;q=0.5, en;q=0.3
UA-CPU: AMD64
Accept-Encoding: gzip,  deflate
Host: dict.youdao.com
Connection: Keep-Alive
```

蛮长的嘛。话说这个更简单了。只有两个参数audio和type。老衲闭着眼睛都能算出来audio参数是干嘛的："那就是！要发音的单词！"。"喂！我说，你太聪明了吧"。唉，一不小心人格分裂症又犯了, 最近期末考试，药停了两天没办法。另一个type参数经过实验发现是英音和美音。当type == 1时是英音，等于2时是美音，其他情况我没试，猜测是默认发音（英音或美音）。
然后再测试一下:

tomato的英发音, [戳这里][5]。

tomato的美发音, [戳这里][6]。

恩，不错。这次就对了嘛。

好吧，今天晚上刚考完智能卡的说。。。。这个项目这几天内估计不会有进展的，期待期末快结束吧。不知道下一篇什么时候写了。

[0]:https://github.com/LanderlYoung/Dictinoary_Node.js
[1]:https://github.com/LanderlYoung/Magnet2Torrent
[2]:http://www.nodejs.org
[3]:http://dict.youdao.com/search?keyfrom=metrodict.main&xmlDetail=true&doctype=xml&xmlVersion=8.1&dogVersion=1.0&q=node&le=eng&keyfrom=metrodict.input&client=metrodict&id=3019615280104595010663601040404140109040186114402823410158212201782429070109&appVer=1.1.49.6663.beta&vendor=stor
[4]:http://dict.youdao.com/search?keyfrom=metrodict.main&xmlDetail=false&doctype=xml&xmlVersion=8.1&dogVersion=1.0&q=node&le=eng&keyfrom=metrodict.input&client=metrodict&id=3019615280104595010663601040404140109040186114402823410158212201782429070109&appVer=1.1.49.6663.beta&vendor=stor
[5]:http://dict.youdao.com/dictvoice?audio=tomato&type=1
[6]:http://dict.youdao.com/dictvoice?audio=tomato&type=2
