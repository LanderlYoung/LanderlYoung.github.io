---
layout: post
title: "dictionary_Node.js-版本v1.0"
date: 2014-02-19 18:31:45 +0800
comments: true
categories: [Node.js, dictonary_Node.js]
---

&lt; 开场白 &gt;

[**基于Node.js的命令行词典应用**][0]

项目刚开始做，今天先做个铺垫吧。

&lt;/ 开场白 &gt;

这个小工具需要的功能有以下几个： 

 - 解析命令行参数
 - 发送http请求并取得返回的xml
 - 解析xml并得到单词的解释
 - 输出结果 
 
<!--more-->
最后还有一个，不过在v1.0中没有加入：

 - 发送http请求，获得单词发音，并播放出来


下面一部分一部分的把各个功能实现说明一下：

### 1.解析命令行参数

这里的重点是获取命令行参数，在Node.js里面命令行参数可以从`process.argv`获取。
得到的是一个string数组，数组的第一项是node解释器的调用名，一般是`node`;第二项是js脚本的绝对路径，后面的各项就是传进去的命令行参数。于是得到下面的解析命令行参数的代码。


``` cpp

//command line arguments
var argv = process.argv.splice(2);

(function(){
	if (argv.length == 0 || argv.length > 2) {
		usage();
		process.exit(1);
	} else if( argv.length == 1) {
		word = argv[0];
	} else {
		var swt = argv[0];
		word = argv[1];
		if( swt.search(/e|E/) != -1) {
			ee = true;
		}
		if( swt.search(/p|P/) != -1) {
			pnc = true;
		}
		if( swt.search(/v/) != -1) {
			ee = cc = true;
		}
		if(swt.search(/V/) != -1) {
			pnc = true;
			ee = cc = true;
		}
	}
})();

```

### 2.发送http请求并取得返回的xml
说到这个话题，最先想到的是AJAX，不过在Node.js里面对http request 有另一种封装。


代码中的 http 来自于源代码最前面的 `var  http = require("http"); `

``` cpp 
var req = http.request(queryURL,  function(res) {
	var chunks = [], length = 0;
	res.on('data', function(trunk) {
		length += trunk.length;
		chunks.push(trunk);
	});
	res.on('end', function() {
		var data = new Buffer(length),
		pos = 0, 
		l = chunks.length;
	for (var i = 0; i < l; i++) {
		chunks[i].copy(data, pos);
		pos += chunks[i].length;
	}

	res.body = data;
	//TODO
	//console.log(data.toString());
	var output = genOutput(data.toString());
	show(output);

	});
	res.on('error', function(err){
		//FIXME
		console.log("requesr error");
	});
});
req.end();

```
这里面主要做事的是三个回调函数，分别是当得到数据、数据下载结束、发生错误。
代码所做的事是，把每次得到的数据缓存起来；当数据下载结束时把缓存的数据拼接起来。需要说明的是：在代码中用到了Node.js的Buffer类，其中on 'data' 时的回调函数的参数就是Buffer类的实例。在一开始出现的问题是：设置了返回的xml的编码，然后就出现了乱码，猜测原因是每次on 'data' 时传来的数据段把utf-8编码截断了。解决方法是先把返回数据当成二进制来处理，最后拼接起来再转成字符串。


[0]:https://github.com/LanderlYoung/Dictinoary_Node.js
