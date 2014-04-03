(function(){
var gallery = document.getElementById('gallery');

function addNode(style) {
	var bg = document.createElement("div");
	var div = document.createElement("div");
	var p = document.createElement('p');
	var str = '';
	if( style.bgcolor) {
		str += 'background-color:' + style.bgcolor + ';';
	}
	str += 'background-image:' + style.bgimage + ';';
	var text = document.createTextNode(str);
	bg.style['background-color'] = style.bgcolor;
	bg.style['background-image'] = style.bgimage;
	div.setAttribute('class', 'src');

	div.addEventListener('click', function() {
			var element = this.getElementsByTagName('p')[0];
			if (window.getSelection) {
				var sel = window.getSelection();
				sel.removeAllRanges();
				var range = document.createRange();
				range.selectNodeContents(element);
				sel.addRange(range);
			} else if (document.selection) {
				var textRange = document.body.createTextRange();
				textRange.moveToElementText(element);
				textRange.select();
			}
		});

	p.appendChild(text);
	div.appendChild(p);
	bg.appendChild(div);
	gallery.appendChild(bg);
}

function addNodes(styles) {
	for(var i = 0; i < styles.length; i++) {
		addNode(styles[i]);
	}
}

addNodes(styles);
})();
