(function(){
	var bg = document.getElementById("bg");
	var wnm = document.getElementById("wnm");
	wnm.addEventListener("click", click_callback);
	var hids = [];
	hids = document.getElementsByClassName("hid");
	var trigger = [];
	trigger[0] = pacman;
	trigger[1] = bubble;
	trigger[2] = jump_spring;
	
	function random_item(){
		return Math.floor(Math.random() * hids.length);
	}

	function click_callback() {
		bg.style["display"] = "none";
		var i = random_item();
		hids[i].style["display"] = "block";
		trigger[i]();
	}
})();
