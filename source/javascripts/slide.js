(function(){
	var hint = document.getElementById("hint");
	var slide = document.getElementById("slide");
	var container = document.getElementsByClassName("container")[0];

	hint.addEventListener("click", function() {
		hint.style["display"] = "none";
		move(slide, -23, 0, 0.5, 20);
	});

	container.addEventListener("click", function(){
		console.log("container");
	});

	var ctn_old_click = container["onclick"] || function(){};
	container.addEventListener("click", function() {
		ctn_old_click();
		if(hint.style["display"] !== "block") {
			move(slide, 0, -23, 0.5, 20);
			hint.style["display"] = "block";
		}
	});

	function move(obj, from, to, duration, steps) {
		var step_len = (to - from) / steps;
		var pos = from;
		var handle = window.setInterval(function() {
			if(Math.abs(pos - to) < 0.1) {
				window.clearInterval(handle);
			}
			obj.style["left"] = pos + "%";
			pos += step_len;
		}, duration / steps);
	}
})();
