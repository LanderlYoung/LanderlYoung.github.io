// Wait till the browser is ready to render the game (avoids glitches)

var eventName = 'mousedown';
var mobileEventName = 'touchstart';
var isMobile = false;
if ((navigator.userAgent.match(
            /(iPhone|iPod|Android|ios|iPad|Windows\ Phone)/i))) {
    isMobile = true;
}

window.requestAnimationFrame(function () {
    //gameManeger;
    var gameManeger;
    gameManeger = new GameManager(4,
        KeyboardInputManager,
        HTMLActuator,
        LocalScoreManager);
    var g = function (id) { return document.getElementById(id); };
    //move 0: up, 1: right, 2:down, 3: left
    if (!isMobile) {
        g("button-up").addEventListener(
            eventName, function () {
                gameManeger.move(0);
            });
        g("button-right").addEventListener(
            eventName, function () {
                gameManeger.move(1);
            });
        g("button-down").addEventListener(
            eventName, function () {
                gameManeger.move(2);
            });
        g("button-left").addEventListener(
            eventName, function () {
                gameManeger.move(3);
            });
    } else {
        g("button-up").addEventListener(
            mobileEventName, function (event) {
                gameManeger.move(0);
            });
        g("button-right").addEventListener(
            mobileEventName, function (event) {
                gameManeger.move(1);
            });
        g("button-down").addEventListener(
            mobileEventName, function (event) {
                gameManeger.move(2);
            });
        g("button-left").addEventListener(
            mobileEventName, function (event) {
                gameManeger.move(3);
            });
    }
});