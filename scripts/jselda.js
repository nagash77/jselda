
// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;
$('body').append(canvas);

ctx.fillStyle = "rgba(0, 0, 255, .5)";
ctx.fillRect(25, 25, 125, 125);

var heroObj = {
	speed : 256 // movement in pixels per second
};


// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);


function handleInput() {

}

function update() {

}

function render() {

}

function main () {
	var now = Date.now();
	var delta = now - then;

	handleInput();
	update(delta / 1000);
	render();

	then = now;
};

var then = Date.now();
setInterval(main, 1);


