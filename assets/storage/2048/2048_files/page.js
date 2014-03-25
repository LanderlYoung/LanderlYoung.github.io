(function () {
		var div_vm = function() {
			//vertical middle align
			var c = document.getElementsByClassName("container")[0];
			var height = document.body.scrollHeight;
			var cheight = c.scrollHeight;
			var margin_top = (height - cheight) / 2;
			c.style['margin-top'] = margin_top + 'px';
		}

		var onload = function () {
			div_vm();
			var book_scroll = document.getElementById("book-scroll");
			var menu_button = document.getElementById("menu-button");
			var scroll_up = document.getElementById("scroll-up");
			if (!isMobile) {
				menu_button.addEventListener(eventName, function () {
						console.log("jump");
						jellyJump(book_scroll);
					});
				scroll_up.addEventListener(eventName, function () {
						jellyJump(book_scroll);
					});
			} else {
				menu_button.addEventListener(mobileEventName,
					function () {
						console.log("jump");
						jellyJump(book_scroll);
					});
				scroll_up.addEventListener(mobileEventName, function () {
						jellyJump(book_scroll);
					});

			}
		}

		var jellyJump = function (obj) {
			var s = 1.2;
			var displayed = obj.style.display == "block";
			if (displayed) {
				//disappear
				//obj.style.height = "0px";
				var h = obj.scrollHeight;
				var originHeight = h;
				var oh = 0;
				var alpha = Math.PI / 2;
				var step = Math.PI / 40;

				function scrollUp() {
					if (alpha < Math.PI) {
						oh = h * Math.sin(alpha);
						obj.style.height = oh + "px";
						alpha += step;
					} else {
						obj.style.display = "none";
						window.clearInterval(IntervalId);
					}
				}
				var IntervalId = window.setInterval(scrollUp, 10);
			} else {
				//scroll down;
				obj.style.display = "block";
				var h = obj.scrollHeight;
				var oh = 0;
				//console.log("scrollDown to " + h + "px");
				obj.style.height = "0px";


				var jumpHeight = h - oh;
				var originHeight = jumpHeight;
				var alpha = Math.PI / 2;
				function scrollDown() {
					if (alpha < Math.PI) {
						oh = jumpHeight * Math.sin(alpha);
						obj.style.height = (originHeight - oh) + "px";
						alpha += Math.PI / 40;
					} else {
						obj.style.height = originHeight + "px";
						window.clearInterval(IntervalId);
					}
				}
				//600ms
				var IntervalId = window.setInterval(scrollDown, 10);
			}
		}

		var old_onload = window.onload || function () { };
		window.onload = function () {
			old_onload();
			onload();
		}

		//window.onresize = div_vm;
		var resize_handle = 0;
		window.onresize = function() {
			if (resize_handle === 0) {
				resize_handle = window.setTimeout(function(){
						div_vm(); resize_handle = 0;
				   	}, 500);
			}
		}
	})();
