//GLOBALS
NUMBER_OF_TILES_VERT = 20
NUMBER_OF_TILES_HOR = 36
UNIT = $(window).height() / NUMBER_OF_TILES_VERT
h = UNIT * NUMBER_OF_TILES_VERT
w = UNIT * NUMBER_OF_TILES_HOR
COLLISION_MAP = {};  //this holds all the collision maps as they get loaded
GRAPHICS_MAP = {};   //this map holds the key to what images are displayed where ont he map (ie 1 is a bush, 0 is nothing)
CURRENT_MAP = 'test_map'; // Changed to use our test map
mapRdy = false; //default that map is not loaded.  main() loads this on each loop
mapLoading = false;

// Game objects
var gameObjects = {
	destructible: [], // Array of destructible objects
	addDestructible: function(x, y, type) {
		this.destructible.push({
			x: x,
			y: y,
			type: type,
			health: 1,
			width: UNIT,
			height: UNIT
		});
	}
};

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = w;
canvas.height = h;
$('body').append(canvas);

ctx.fillStyle = "rgb(42,161,87)";
ctx.fillRect (0, 0, w, h);

// Sword state
var swordState = {
	isSwinging: false,
	direction: 'right', // right, left, up, down
	swingProgress: 0,
	swingDuration: 200, // milliseconds
	swingStartTime: 0,
	damage: 1,
	// Add sword hitbox
	getHitbox: function() {
		var startX = heroObj.x + UNIT/2;
		var startY = heroObj.y + UNIT/2;
		var swordLength = UNIT * 0.8;
		var angle = 0;
		
		switch(this.direction) {
			case 'right':
				angle = -Math.PI/2 + (Math.PI * this.swingProgress);
				break;
			case 'left':
				angle = Math.PI/2 - (Math.PI * this.swingProgress);
				break;
			case 'up':
				angle = Math.PI - (Math.PI * this.swingProgress);
				break;
			case 'down':
				angle = (Math.PI * this.swingProgress);
				break;
		}
		
		var endX = startX + Math.cos(angle) * swordLength;
		var endY = startY + Math.sin(angle) * swordLength;
		
		return {
			startX: startX,
			startY: startY,
			endX: endX,
			endY: endY,
			width: 10 // Width of the sword hitbox
		};
	}
};

//setup our hero object
var heroObj = {
	speed           : 256, // Increased speed back to original
	x               : canvas.width / 2, //x coordinate position
	y               : canvas.height / 2, //y coordinate position
	traversalMatrix : [0, 2], // Allow walking on ground (0) and water (2)
	direction       : 'right', // Track hero's direction
	updateX         : function(newX) {
		// First check if we're trying to move outside the canvas
		if (newX < 0) {
			newX = 0;
		} else if (newX > canvas.width - UNIT) {
			newX = canvas.width - UNIT;
		}
		
		// Then check for collisions
		if (!determineMapCollisions(newX, this.y, this.traversalMatrix, UNIT, UNIT)) {
			// Check if we're on water and adjust speed
			var currentTile = getTileAtPosition(this.x, this.y);
			if (currentTile === 2) { // Water tile
				newX = this.x + (newX - this.x) * 0.25; // 25% speed on water
			}
			this.x = newX;
			// Update direction based on movement
			if (newX > this.x) {
				this.direction = 'right';
			} else if (newX < this.x) {
				this.direction = 'left';
			}
		}
	},
	updateY         : function(newY) {
		// First check if we're trying to move outside the canvas
		if (newY < 0) {
			newY = 0;
		} else if (newY > canvas.height - UNIT) {
			newY = canvas.height - UNIT;
		}
		
		// Then check for collisions
		if (!determineMapCollisions(this.x, newY, this.traversalMatrix, UNIT, UNIT)) {
			// Check if we're on water and adjust speed
			var currentTile = getTileAtPosition(this.x, this.y);
			if (currentTile === 2) { // Water tile
				newY = this.y + (newY - this.y) * 0.25; // 25% speed on water
			}
			this.y = newY;
			// Update direction based on movement
			if (newY > this.y) {
				this.direction = 'down';
			} else if (newY < this.y) {
				this.direction = 'up';
			}
		}
	}
};

heroObj.traversalMatrix.push(0);

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
	
	// Handle sword swing (Space bar)
	if (e.keyCode === 32 && !swordState.isSwinging) { // Space bar
		swordState.isSwinging = true;
		swordState.direction = heroObj.direction;
		swordState.swingStartTime = Date.now();
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
	// Update sword swing animation
	if (swordState.isSwinging) {
		var currentTime = Date.now();
		swordState.swingProgress = (currentTime - swordState.swingStartTime) / swordState.swingDuration;
		
		// Check for collisions during swing
		checkSwordCollisions();
		
		if (swordState.swingProgress >= 1) {
			swordState.isSwinging = false;
			swordState.swingProgress = 0;
		}
	}

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

	var graphMap = GRAPHICS_MAP[CURRENT_MAP].getMap();
	for(graphicsRow in graphMap) {
		for(i=0;i<=graphMap[graphicsRow].length;i++){
			if(graphMap[graphicsRow][i] > 0) {
				var x = (i * UNIT);
				var y = (graphicsRow * UNIT);
				var backgroundObj = new Image();
				var imagePath = GRAPHICS_MAP[CURRENT_MAP].getImageByID(graphMap[graphicsRow][i]);
				
				backgroundObj.onerror = function() {
					console.error('Failed to load image:', imagePath);
				};
				
				backgroundObj.onload = (function(x, y) {
					return function() {
						try {
							ctx.drawImage(backgroundObj, x, y, UNIT, UNIT);
						} catch(e) {
							console.error('Error drawing image:', e);
						}
					};
				})(x, y);
				
				backgroundObj.src = imagePath;
			}
		}
	}

	// Render destructible objects
	gameObjects.destructible.forEach(function(obj) {
		ctx.fillStyle = obj.health > 0 ? '#8B4513' : 'transparent';
		ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
	});

	if(heroReady) {
		ctx.drawImage(heroImageObj, heroObj.x, heroObj.y, UNIT, UNIT);
		
		// Draw sword swing
		if (swordState.isSwinging) {
			ctx.save();
			ctx.strokeStyle = '#FFD700';
			ctx.lineWidth = 3;
			
			var hitbox = swordState.getHitbox();
			
			ctx.beginPath();
			ctx.moveTo(hitbox.startX, hitbox.startY);
			ctx.lineTo(hitbox.endX, hitbox.endY);
			ctx.stroke();
			ctx.restore();
		}
	}
};

var determineMapCollisions = function(x, y, traversalMatrix, objHeight, objWidth) {
	var occupiedTiles = determineOccupiedTiles(x, y, objHeight, objWidth);
	var col_map = COLLISION_MAP[CURRENT_MAP].getMap();

	// Check if we're within map bounds
	if (!col_map || !col_map.length) return true;

	// Check each tile the object would occupy
	for (var tile in occupiedTiles) {
		var tileX = occupiedTiles[tile].tileX;
		var tileY = occupiedTiles[tile].tileY;
		
		// Make sure we're within map bounds
		if (tileY < 0 || tileY >= col_map.length || 
			tileX < 0 || tileX >= col_map[0].length) {
			return true; // Out of bounds is a collision
		}
		
		var tileType = col_map[tileY][tileX];
		
		// If it's a wall (type 1), always return collision
		if (tileType === 1) {
			return true;
		}
		
		// If it's not in our traversal matrix, return collision
		if (traversalMatrix.indexOf(tileType) === -1) {
			return true;
		}
	}
	
	return false; // No collision
};

var determineOccupiedTiles = function(x, y, objHeight, objWidth) {
	// Add a small buffer to prevent edge cases
	var buffer = 2;
	
	var upperLeftXTilePos = Math.floor((x + buffer) / UNIT);
	var upperLeftYTilePos = Math.floor((y + buffer) / UNIT);
	var rightTile = Math.ceil((x + objWidth - buffer) / UNIT);
	var bottomTile = Math.ceil((y + objHeight - buffer) / UNIT);
	
	var occupiedTiles = [];
	
	for (var i = upperLeftXTilePos; i < rightTile; i++) {
		for (var j = upperLeftYTilePos; j < bottomTile; j++) {
			occupiedTiles.push({
				tileX: i,
				tileY: j
			});
		}
	}
	
	return occupiedTiles;
};

var loadMap = function() {
	if(!(CURRENT_MAP in COLLISION_MAP) && !mapLoading) {
		// Load collision map
		$.getScript('maps/collision/' + CURRENT_MAP + '.js', function(data, textStatus, jqxhr) {
			// Load graphics map
			$.getScript('maps/graphics/' + CURRENT_MAP + '.js', function(data, textStatus, jqxhr) {
				mapRdy = true;
				initializeGameObjects(); // Initialize objects when map is loaded
			});
		});
		mapRdy = false;
		mapLoading = true;
	} else if (!mapLoading) {
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

// Add collision detection for sword
var checkSwordCollisions = function() {
	if (!swordState.isSwinging) return;
	
	var hitbox = swordState.getHitbox();
	
	// Check collision with destructible objects
	for (var i = gameObjects.destructible.length - 1; i >= 0; i--) {
		var obj = gameObjects.destructible[i];
		
		// Check if sword line intersects with object rectangle
		if (lineIntersectsRect(
			hitbox.startX, hitbox.startY,
			hitbox.endX, hitbox.endY,
			obj.x, obj.y,
			obj.width, obj.height
		)) {
			// Reduce object health
			obj.health -= swordState.damage;
			
			// Remove object if destroyed
			if (obj.health <= 0) {
				gameObjects.destructible.splice(i, 1);
			}
		}
	}
};

// Line-rectangle intersection check
var lineIntersectsRect = function(x1, y1, x2, y2, rx, ry, rw, rh) {
	// Check if line intersects with any of the rectangle's edges
	return (
		lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) || // Top edge
		lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) || // Right edge
		lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) || // Bottom edge
		lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx, ry) // Left edge
	);
};

// Line-line intersection check
var lineIntersectsLine = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	var denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
	
	// Lines are parallel
	if (denominator === 0) return false;
	
	var ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
	var ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;
	
	// Check if intersection point is within both line segments
	return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
};

// Initialize game objects with the test map
var initializeGameObjects = function() {
	var col_map = COLLISION_MAP[CURRENT_MAP].getMap();
	var graph_map = GRAPHICS_MAP[CURRENT_MAP].getMap();
	
	// Clear existing objects
	gameObjects.destructible = [];
	
	// Add destructible objects based on the graphics map
	for(var y = 0; y < graph_map.length; y++) {
		for(var x = 0; x < graph_map[y].length; x++) {
			if(graph_map[y][x] === 3) { // Bush
				gameObjects.addDestructible(x * UNIT, y * UNIT, 'bush');
			} else if(graph_map[y][x] === 4) { // Rock
				gameObjects.addDestructible(x * UNIT, y * UNIT, 'rock');
			}
		}
	}
};

// Helper function to get tile type at position
function getTileAtPosition(x, y) {
	var col_map = COLLISION_MAP[CURRENT_MAP].getMap();
	if (!col_map || !col_map.length) return -1;
	
	var tileX = Math.floor(x / UNIT);
	var tileY = Math.floor(y / UNIT);
	
	if (tileY >= 0 && tileY < col_map.length && 
		tileX >= 0 && tileX < col_map[0].length) {
		return col_map[tileY][tileX];
	}
	return -1;
}

// Update the test map to add an opening in the walled area
var test_map = {
	getMap: function() {
		return [
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
		];
	}
};
