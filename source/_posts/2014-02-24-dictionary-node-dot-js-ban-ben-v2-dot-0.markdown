---
layout: post
title: "dictionary_Node.js-版本v2.0"
date: 2014-02-24 22:31:59 +0800
comments: true
categories: [Node.js, dictonary_Node.js]
---

&lt; 开场白 &gt;

[**基于Node.js的命令行词典应用**][0]

&lt;/ 开场白 &gt;

版本2.0新加入发音功能，该功能的实现都在pnc.js文件内，分成一下几个功能模块：

1. 下载mp3格式的音频文件
2. 把文件存到临时文件里
3. 调用系统工具播放音频文件

其中第一步下载文件和1.0版本的下载xml是完全一样的，不再赘述。

首要说明存储文件这个。

## 保存临时文件
因为要保存到临时文件（播放完成之后还要删除），所以差了一下Node.js的文档，找到下面的方法。

``` cpp 
var fa = require('fs');

var count = 0;
while (true) {
	//avoid dead loop
	if( count++ > 10) return null;

	var fileName = '/tmp/NodeDict.' + genRandomString(6) + '.mp3';
	try {
		var fd = fs.openSync(fileName, 'wx');
		//console.log('S file: ' + fileName );
		return { fileName : fileName, fd : fd };
	} catch (e) {
		//file alreadyExist
		//console.log(e);
	}
}
```

其中`genRandomString(len)`返回长度为len的随机字符串。主要说明的是openSync方法，他是open方法的同步版，不过参数含义都是相同的。Node.js[官方文档][1]这么解释open的
{% blockquote %}
...

'w' - Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
'wx' - Like 'w' but fails if path exists.
'w+' - Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
'wx+' - Like 'w+' but fails if path exists.

...
{% endblockquote %}

也就是说当flags是'wx'时，如果文件已经存在会抛出异常（原文只说会fail，实验之后才确定是抛异常）。这样当检测到异常时在生成一个文件名看看能不能生成临时文件就行了。上诉代码就是这个思路。为了极端情况发生导致死循环，设置了循环的最大次数——10。

然后就是把缓存里的mp3文件写道文件中，这个更简单了：

``` cpp
function saveFile(data) {
	var file = makeTemp();
	if (!file) err_exit();
	fs.writeFileSync(file.fileName, data);
	fs.closeSync(file.fd);
	return file;
}
```
代码自解释，无需多言。

## 调用系统命令播放mp3文件
这里面用到了Node.js的child process技术。说来简单，还是先上代码:

```cpp
var spawn = require('child_process').spawn;
function playAndClean(file) {
	var play = spawn('play', [ file.fileName ]);
	play.on('exit', function (code, signal) {
			//delete temp file
			fs.unlinkSync(file.fileName);
			});
}
```
spawn函数的第一个参数是命令的名字，后面是一个数组存的是参数列表。假设这里的文件名是NodeDict.123456.mp3, 那么调用的系统命令就是`play NodeDict.123456.mp3`。这个play命令来自于sox软件包。然后给新进程添加退出时的事件，就是删除临时文件。

## 然后就是在主文件dict.js 中调用pnc.js
老规矩，先上代码:

```cpp 
var cp = require('child_process');
try {
	var pncUrl = genPncURL(word, pnc);
	cp.fork(pnc_js_Path, [ pncUrl ]);
} catch(e) {
	console.log('please set variable pnc_js_Path, which presents the absolute path of pnc.js');
}
```
这里使用了child process中的fork，于linux的fork不同，Node.js中的fork要指定运行的js脚本, 这里就指定了pnc.js脚本（要写绝对路径，因为要创建软链接，所以无奈只能手动制定了）。

这样就可以开两个进程了，一个下载解析xml显示单词解释，另一个进程下载发音文件在播放（其实播放又开了一个进程）。  
恩，还不错。


[0]:https://github.com/LanderlYoung/Dictinoary_Node.js
[1]:http://www.nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback
