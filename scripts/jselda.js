//GLOBALS
NUMBER_OF_TILES_VERT = 20
NUMBER_OF_TILES_HOR = 36
body = document.body
unit = Math.max(body.scrollHeight, body.clientHeight) / NUMBER_OF_TILES_VERT
h = unit * NUMBER_OF_TILES_VERT
w = unit * NUMBER_OF_TILES_HOR




// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = w;
canvas.height = h;
$('body').append(canvas);

ctx.fillStyle = "rgb(42,161,87)";
ctx.fillRect (0, 0, w, h);

//setup our hero object
var heroObj = {
	speed   : 256, // movement in pixels per second
	x       : canvas.width / 2, //x coordinate position
	y       : canvas.height / 2, //y coordinate position
	updateX : function(newX) {
				if(newX <= 0) {
					heroObj.x = 0;
				}else if(newX >= canvas.width - unit) {
					 heroObj.x = canvas.width - unit;
				}else {
					 heroObj.x = newX;
				}
			},
	updateY : function(newY) {
				if(newY <= 0) {
					heroObj.y = 0;
				}else if(newY >= canvas.height - unit) {
					 heroObj.y = canvas.height - unit;
				}else {
					 heroObj.y = newY;
				}
				
			}
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
keysDown['activeInput'] = []; //this is to form a queue of the movement buttons pushed so that you can only go in one direction at a time to mimic old school controls (ie no diagnals)
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
	if ($.inArray(e.keyCode, keysDown['activeInput']) < 0){
		keysDown['activeInput'].push(e.keyCode);
	}
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
	keysDown['activeInput'].splice($.inArray(e.keyCode, keysDown['activeInput']),1);
}, false);

var handleInput = function() {
	//not sure waht is going to go in here yet
};

var update = function(modifier) {
	if (keysDown['activeInput'].length >= 1) {


		if (keysDown['activeInput'][0] == 38 || keysDown['activeInput'][0] == 87) { // Player holding up
			heroObj.updateY(heroObj.y -= heroObj.speed * modifier)
		}
		if (keysDown['activeInput'][0] == 40 || keysDown['activeInput'][0] == 83) { // Player holding down
			heroObj.updateY(heroObj.y += heroObj.speed * modifier)
		}
		if (keysDown['activeInput'][0] == 37 || keysDown['activeInput'][0] == 65) { // Player holding left
			heroObj.updateX(heroObj.x -= heroObj.speed * modifier)
		}
		if (keysDown['activeInput'][0] == 39 || keysDown['activeInput'][0] == 68) { // Player holding right
			heroObj.updateX(heroObj.x += heroObj.speed * modifier)
		}
	}
};

var render = function() {
	ctx.fillStyle = "rgb(42,161,87)";
	ctx.fillRect (0, 0, w, h);

	if(heroReady) {
		ctx.drawImage(heroImageObj, heroObj.x, heroObj.y, unit, unit);
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
