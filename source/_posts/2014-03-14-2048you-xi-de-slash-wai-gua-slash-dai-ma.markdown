---
layout: post
title: "2048游戏的'外挂'代码"
date: 2014-03-14 22:12:35 +0800
comments: true
categories: 
---
这两天[‘2048’][1]游戏很火，于是我秉承这学习的态度研究了一下他的代码。 
本以为使用canvas实现的，后来发现就是普通的html元素，突然觉得开发者还是很厉害的！  
说实话，这个游戏设计得的确很牛。牛的不是代码，是游戏创意！如果发到app store上估计会和flappy bird有的一拼吧。

<!--more-->

##我是邪恶的开始##
因为研究了一下游戏的源代码，突然发现可以很简单的让游戏想开了外挂一样牛叉！

``` cpp
(function(initialNum){
	var a = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
	var row = 4;
	var column = 4;
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < column;j++) {
			tile =  new Tile({x:i, y:j}, initialNum);
			a.grid.cells[i][j] = tile;
		}
	}
})(128);
```

这就是所有'外挂'代码，打开chrome的console。输入进去就可以看到奇迹。。。。

##郑重生命##
这只是一个个人的无聊作品，如果因为这个东西让你丧失了对本游戏的兴趣，请无视这段代码！


[1]:http://gabrielecirulli.github.io/2048/
