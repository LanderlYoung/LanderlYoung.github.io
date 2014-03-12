(function(){
	var hint = document.getElementById("hint");
	var slide = document.getElementById("slide");
	//var container = document.getElementsByClassName("container")[0];

	var isSlideOut = false;

	hint.addEventListener("click", function() {
		if(!isSlideOut) {
			isSlideOut = true;
			move(slide, -23, 0, 0.5, 60);
			rotate(hint, 0, -180, .3, 60);
		} else {
			isSlideOut = false;
			move(slide, 0, -23, 0.5, 60);
			rotate(hint, -180, 0, .3, 60);
		}
	});

	function move(obj, from, to, duration, fps) {
		var step_len = (to - from) / (duration * fps);
		var pos = from;
		var handle = window.setInterval(function() {
			if(Math.abs(pos - to) <= Math.abs(step_len)) {
				window.clearInterval(handle);
			}
			obj.style["left"] = pos + "%";
			pos += step_len;
		}, 1 / fps);
	}

	function rotate(obj, from, to, duration, fps) {
		var deg = from;
		var step = (to - from) / (duration * fps);
		function rotateTo(deg) {
			var value =  "rotate("+deg+"deg)";
			obj.style["transform"] = value;
			obj.style["-webkit-transform"] = value;
			obj.style["-moz-transform"] = value;
			obj.style["-ms-transform"] = value;
			obj.style["-o-transform"] = value;
		}

		var intervalId = window.setInterval(function() {
			if(Math.abs(deg - to) <= Math.abs(step)) {
				rotateTo(to);
				window.clearInterval(intervalId);
			}
			//console.log(deg);
			deg += step;
			rotateTo(deg);
		}, 1/fps);
	}
})();
