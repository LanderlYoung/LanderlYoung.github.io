(function () {
    var hint = document.getElementById("hint");
    var slide = document.getElementById("slide");
    var touch = document.getElementById("touch");
    var drawer = document.getElementById("drawer");
    var leftCol = document.getElementsByClassName("left-col")[0];
    var leftColHeight = leftCol.scrollHeight;

    var isMobile = false;
    if (document.defaultView.getComputedStyle &&
        document.defaultView.getComputedStyle(
            hint).display === 'none') {
        isMobile = true;
    }
    var isSlideOut = false;
    var isDrawerDisplay = false;

    //add event listener
    hint.addEventListener("click", slideInAndOut);
    touch.addEventListener("click", slideInAndOut);
    window.onscroll = onscrollListener;

    //call back functions
    function slideInAndOut() {
        var width = slide.scrollWidth + 5;
        if (!isSlideOut) {
            isSlideOut = true;
            move(slide, -width, 0, 0.5, 60, 'px');
            rotate(hint, 0, -180, .3, 60);
        } else {
            isSlideOut = false;
            move(slide, 0, -width, 0.5, 60, 'px');
            rotate(hint, -180, 0, .3, 60);

        };
    }

    function onscrollListener() {
        var top = document.documentElement.scrollTop ||
        document.body.scrollTop;
        if (isMobile &&
            !isDrawerDisplay &&
            top > leftColHeight) {
            drawer.style['display'] = 'block';
            drawer.style['opacity'] = '0.7';
            isDrawerDisplay = true;
        } else if (isMobile &&
            isDrawerDisplay &&
            !isSlideOut &&
            top < leftColHeight) {
            drawer.style['opacity'] = '0';
            drawer.style['display'] = 'none';
            isDrawerDisplay = false;
        }
    }


    function move(obj, from, to, duration, fps, unit) {
        var stepLen = (to - from) / (duration * fps);
        var pos = from;
        var handle = window.setInterval(function () {
            obj.style["left"] = pos + unit;
            pos += stepLen;
            if (Math.abs(pos - to) <= Math.abs(stepLen)) {
                window.clearInterval(handle);
                obj.style["left"] = to + unit;
            }

        }, 1 / fps);
    }

    function rotate(obj, from, to, duration, fps) {
        var deg = from;
        var step = (to - from) / (duration * fps);
        function rotateTo(deg) {
            var value = "rotate(" + deg + "deg)";
            obj.style["transform"] = value;
            obj.style["-webkit-transform"] = value;
            obj.style["-moz-transform"] = value;
            obj.style["-ms-transform"] = value;
            obj.style["-o-transform"] = value;
        }

        var intervalId = window.setInterval(function () {
            if (Math.abs(deg - to) <= Math.abs(step)) {
                rotateTo(to);
                window.clearInterval(intervalId);
            }
            //console.log(deg);
            deg += step;
            rotateTo(deg);
        }, 1 / fps);
    }


    //function to make an simple table scroll able when overflow
    //since word could broken due to the new css, this function 
    //is not used.
    function coolerfyTables() {
        var forEach = Array.prototype.forEach;
        var tables = document.getElementsByTagName("table");

        forEach.call(tables, function (t) {
            var parent = t.parentNode;
            if (parent && parent.getAttribute("class") !== "highlight") {
                var div = document.createElement("div");
                var copy = t.cloneNode(true);
                div.style.overflowX = "auto";
                div.appendChild(copy);
                console.log(div);

                console.log(parent === t.parentNode);
                parent.replaceChild(div, t);
            }
        });
    }

})();
