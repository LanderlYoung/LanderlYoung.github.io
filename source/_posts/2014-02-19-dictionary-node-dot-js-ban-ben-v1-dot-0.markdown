---
layout: post
title: "dictionary_Node.js-版本v1.0"
date: 2014-02-19 18:31:45 +0800
comments: true
categories: [Node.js, dictonary_Node.js]
---

&lt; 开场白 &gt;

[**基于Node.js的命令行词典应用**][0]


&lt;/ 开场白 &gt;

这个小工具需要的功能有以下几个： 

- 解析命令行参数
- 发送http请求并取得返回的xml <!--more-->
- 解析xml并得到单词的解释
- 输出结果 

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
这里面主要做事的是三个回调函数，分别是当得到数据、数据下载结束、发生错误。代码所做的事是，把每次得到的数据缓存起来；当数据下载结束时把缓存的数据拼接起来。需要说明的是：在代码中用到了Node.js的Buffer类，其中on 'data' 时的回调函数的参数就是Buffer类的实例。在一开始出现的问题是：设置了返回的xml的编码，然后就出现了乱码，猜测原因是每次on 'data' 时传来的数据段把utf-8编码截断了。解决方法是先把返回数据当成二进制来处理，最后拼接起来再转成字符串。

###3.解析xml
在浏览器下的javascript解析xml是原生支持的，不过在Node.js里面就要依赖于第三方的扩展库了。这里解析xml我选择了xmlreader库。安装方式相当简单`npm install xmlreader`就能把xmlreader安装到当前目录下。使用该xml库解析xml也是相当简单的。还是先上代码吧。

``` cpp
function genOutput(xml) {
	var res = [];
	xmlreader.read(xml, function (err, response) {
			if (err) return console.log(err);

			var basic = response.yodaodict.basic;

			if(!basic) return;

			for (var i = 0; i < basic.count(); i++) {
			var expand = false;
			//english chinese --default
			var type = basic.at(i).type.text().toLowerCase();
			if ( (type === 'ec' && cc) ||
				(type === 'ee' && ee) ||
				(type === 'ce' && cc) ) {
			res.push({
type : basic.at(i).name.text(), 
word : []
});
			expand = true;
			}

if (expand) {
	//console.log(res[res.length - 1].type);
	var xword = basic.at(i)['authoritative-dict'].word;

	if (!xword) continue;

	var word = res[res.length - 1].word;
	for( var word_c = 0; word_c < xword.count(); word_c++) {
		word.push( { type : '', trs : []});

		var xtrs = xword.at(word_c).trs;

		if (!xtrs) continue;

		var trs = word[word.length -1].trs;
		trs.push({type : '', exp : []});
		var exp = trs[trs.length - 1].exp;
		for(var trs_c = 0; trs_c < xtrs.count(); trs_c++) {
			if( xtrs.at(trs_c).pos ) {
				trs[trs.length -1].type = xtrs.at(trs_c).pos.text();
			}
			var xtr = xtrs.at(trs_c).tr;

			if (!xtr) continue;

			for( var tr_c = 0; tr_c < xtr.count(); tr_c++) {
				try {
					exp.push(xtr.at(tr_c).l.i.text());
				} catch (e) {
				}
			}
		}
	}
} else {
	//console.log(basic.at(i).name.text());
}
}

});
return res;
}
```
这里面回调函数的参数就是遍历xml的关键，其相当与整个xml的父节点。在xmlreader库中，获取字节点只需要使用`.`即可取得，比如html有个字节点body可以使用html.body来取得body节点。对于每个节点有几个方法，text()是获取该节点内的文本内容。如果某一父节点有多个相同标签的字节点，那么就要用count和at来取得每一个字节点。还有一个attributes（）方法来获取标签内的属性。

### 4.输出结果
没什么好解释的，使用`console.log`输出。值得说明的只是bash的文本显示格式，bash可以控制文字的颜色，和样式（包括：正常，下划线，加粗等）。使用方法如下：

``` cpp
RED = "\033[1;31m";
GREEN = "\033[1;32m";
DEFAULT = "\033[0;49m";

BOLD = "\033[1m";
UNDERLINE = "\033[4m";
NORMAL = "\033[m";
p('  ' + GREEN + BOLD + trs[trs_c].type + NORMAL);
```

-----------
### 即将添加到V2.0中的新功能

 - 可以实现异步发音

即发音和词典显示分两个进程进行，不会因为发音文件硕大影响单词显示速度，进而产生阻塞感。  

预计实现方式，是使用Node.js的http request下载下来发音的mp3文件，放到临时文件中，使用ffplay或其他工具播放，然后删除掉mp3文件。

如果可能的话不是用ffplay，而是使用ffmpeg库开发一个mp3播放小程序，增强可移植行。


[0]:https://github.com/LanderlYoung/Dictinoary_Node.js
