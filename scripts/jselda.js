//GLOBALS
NUMBER_OF_TILES_VERT = 20
NUMBER_OF_TILES_HOR = 36
body = document.body
UNIT = Math.max(body.scrollHeight, body.clientHeight) / NUMBER_OF_TILES_VERT
h = UNIT * NUMBER_OF_TILES_VERT
w = UNIT * NUMBER_OF_TILES_HOR
COLLISION_MAP = {};  //this holds all the collision maps as they get loaded
CURRENT_MAP = '0_0'; //represents coordinates of the section of the world you are in and which map.js to load (ie 0.0.js)
mapRdy = false; //default that map is not loaded.  main() loads this on each loop
mapLoading = false;

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
	speed           : 256, // movement in pixels per second
	x               : canvas.width / 2, //x coordinate position
	y               : canvas.height / 2, //y coordinate position
	traversalMatrix : [0],
	updateX 		: function(newX) {
						if(!determineMapCollisions(newX,heroObj.y,'',heroObj.traversalMatrix,UNIT,UNIT)){
							if(newX <= 0) {
								heroObj.x = 0;
							}else if(newX >= canvas.width - UNIT) {
								 heroObj.x = canvas.width - UNIT;
							}else {
								 heroObj.x = newX;
							}
						}
					},
	updateY 		: function(newY) {
						if(newY <= 0) {
							heroObj.y = 0;
						}else if(newY >= canvas.height - UNIT) {
							 heroObj.y = canvas.height - UNIT;
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

var generateCollisionsMatrix = function() {
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
		ctx.drawImage(heroImageObj, heroObj.x, heroObj.y, UNIT, UNIT);
	}
};

var determineMapCollisions = function(x,y,mapMatrix,traversalMatrix,objHeight,objWidth) {
	//traversalMatrix represents the values that an object can cross over (by default only 0, but potentially adding a value for something like a raft that would allow user to traverse water)
	determineOccupiedTiles(x,y,objHeight, objWidth);
	return false;
};

var determineOccupiedTiles = function(x,y,objHeight,objWidth) {
	var upperLeftXTilePos  = Math.floor(x / UNIT);
	var upperLeftYTilePos  = Math.ceil(y / UNIT);
	var occupiedTiles = [];

	for (var i = upperLeftXTilePos;i<=upperLeftXTilePos + (Math.ceil((objWidth/UNIT) * 10) / 10);i++){
		for (var j = upperLeftYTilePos;j<=upperLeftYTilePos + (Math.ceil((objHeight/UNIT) * 10) / 10);j++){
			var tileCoords = i + '_' + j;
			occupiedTiles.push(tileCoords);
		};
	};

	
	return occupiedTiles;

};

var loadMap = function() {
	
	if(!(CURRENT_MAP in COLLISION_MAP) && !mapLoading) {
		$.getScript('maps/collision/' + CURRENT_MAP + '.js', function(data, textStatus, jqxhr) {
			mapRdy = true;
		});
		mapRdy = false;
		mapLoading = true;
	}else if (!mapLoading){
		mapRdy = true;
		mapLoading = false;
	}
};

var main = function() {
	var now = Date.now();
	var delta = now - then;

	loadMap(CURRENT_MAP);
	if(mapRdy) {
		generateCollisionsMatrix();
		update(delta / 1000);
		render();
	}
	//DEBUG FPS CODE
	var fps = Math.round((60 / (delta / 1000)));
	ctx.font = 'italic 40px Calibri';
	ctx.fillStyle = 'black'
  	ctx.fillText('fps: ' + fps, canvas.width/2, UNIT);
  	//END DEBUG


	then = now;
};

var then = Date.now();
setInterval(main, 1);
