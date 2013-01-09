// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;
$('body').append(canvas);

ctx.fillStyle = "rgb(42,161,87)";
ctx.fillRect (0, 0, 800, 800);

//setup our hero object
var heroObj = {
	speed : 175, // movement in pixels per second
	x     : canvas.width / 2, //x coordinate position
	y     : canvas.height / 2 //y coordinate position
};

var heroReady = false;
var heroImageObj = new Image();
heroImageObj.onload = (function() {	
	heroImageObj.src = 'img/holderLink.png';
	heroObj.imageObj = heroImageObj;
	heroReady = true;
})();
// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var handleInput = function() {

};

var update = function(modifier) {
	if (38 in keysDown) { // Player holding up
		heroObj.y -= heroObj.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		heroObj.y += heroObj.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		heroObj.x -= heroObj.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		heroObj.x += heroObj.speed * modifier;
	}
};

var render = function() {
	ctx.fillStyle = "rgb(42,161,87)";
	ctx.fillRect (0, 0, 800, 800);

	if(heroReady) {
		ctx.drawImage(heroImageObj, heroObj.x, heroObj.y, 50, 80);
	}
};

var main = function() {
	var now = Date.now();
	var delta = now - then;

	handleInput();
	update(delta / 1000);
	render();

	then = now;
};

var then = Date.now();
setInterval(main, 1);
