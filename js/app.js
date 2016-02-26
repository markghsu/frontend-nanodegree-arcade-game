
/**
 * @global
 * @description contains all info necessary for current game state.
 */
var gameState = {
	/** @var {object} start - location where the player will start */
	start: {
		x: 200,
		y: 450
	},
	/** @var {number} level - current level */
	level: 1,
	/** @var {number} lives - current lives, game ends at 0 */
	lives: 3,
	/** @var {number} points - current points */
	points: 0,
	/** @var {number} gameWidth - width of the game board */
	gameWidth: 500,
	/** @var {number} gameHeight - height of the game board, not including the bottom of the tiles*/
	gameHeight: 550
};

/**
 * @global
 * @description Contains JSON defining each level.
 */
var levels = [
	{
		enemies: [
		],
		powerups: [
		],
		other: [
		]
	},
	{}
]

var allEnemies = [];
var player = new Player();

/**
 * @description Represents any entity/character that is rendered on screen.
 * @constructor
 * @param {string} spr - the sprite to use for the character
 * @param {int} x - x position of the character in px, relative to canvas (left side)
 * @param {int} y - y position of the character in px, relative to canvas (top side)
 * @param {int} speed - speed of character
 * @param {int} width - the x width of the character in px, used for collision detection
 * @param {int} height - the y height of the character in px, used for collision detection
 */
var Entity = function(spr, x, y, sp, width, height) {

	// The image/sprite for our enemies, this uses
	// a helper we've provided to easily load images
	this.sprite = spr;
	this.x = x;
	this.y = y;
	this.speed = sp;
	this.width = width;
	this.height = height;
}

/**
 * @method Renders the entitiy based on it's sprite, x, and y position
 */
Entity.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Entity.prototype.update = function(dt) {
	//default for entities it not to move.
};

/**
 * @description Enemies that the player must avoid
 * @constructor
 * @augments Entity
 * @param {int} x - x position of the character in px, relative to canvas (left side)
 * @param {int} y - y position of the character in px, relative to canvas (top side)
 * @param {int} speed - speed of character, defaults to 100.
 */
var Enemy = function(x, y, speed) {
	if (typeof speed !== 'number') { speed = 100; }
	Entity.call(this, 'images/enemy-bug.png', x, y, sp, 100, 75);
	this.speed = sp;
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * @method updates the location of Enemy depending on speed and dt. Loops around.
 * @param {} dt, a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
	// You should multiply any movement by the dt parameter
	// which will ensure the game runs at the same speed for
	// all computers.
	//default for entities it not to move.
	this.x += dt*this.speed;
	if(this.x > gameState.gameWidth) {
		this.x = 0 - this.width;
	}
	else if (this.x < 0 - this.width) {
		this.x = gameState.gameWidth;
	}
};


/**
 * @description Player character. Initialized with default sprite, speed, start location.
 * @constructor
 * @augments Entity
 */
var Player = function() {
	Entity.call(this, 'images/char-princess-girl.png', gameState.start.x, gameState.start.y, 30, 74, 100);
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

/**
 * @method check collisions every tick.
 */
Player.prototype.update = function() {
	//every tick, check collisions
	for(var i = 0; i < allEnemies.length; i++) {
		if(intersects(this,allEnemies[i])){
			this.die();
		}
	}
	//check for victory
	if(this.y < 40) {
		this.win();
	}
};

/**
 * @method reset level on death, subtract from life total.
 */
Player.prototype.die = function() {
	this.x = gameState.start.x;
	this.y = gameState.start.y;
	gameState.lives--;
	if(gameState.lives <= 0){
		quit();
	}
	initLevel(gameState.level);
};

/**
 * @method set new level when player gets across. 10 points per level.
 */
Player.prototype.win = function() {
	this.x = gameState.start.x;
	this.y = gameState.start.y;
	gameState.points+=10;
	gameState.level++;
	initLevel(gameState.level);
};

/**
 * @method Exit the game. Display final scores.
 */
function quit() {
	ctx.save();
    ctx.fillStyle = "black";
    ctx.strokeStyle = "red";
    ctx.font = "45px Arial";
    ctx.fillText("Game Over!",120,200);
    ctx.fillText("Final Score: " + gameState.points, 100, 300);
    ctx.fillText("Levels Completed: " + (gameState.level - 1), 50, 400);
    ctx.strokeText("Game Over!",120,200);
    ctx.strokeText("Final Score: " + gameState.points, 100, 300);
    ctx.strokeText("Levels Completed: " + (gameState.level - 1), 50, 400);
    ctx.restore();
}

/**
 * @method handles movement of player. Doesn't allow player to move offscreen.
 * @param {enum} inp - direction to move
 */
Player.prototype.handleInput = function(inp) {
	switch (inp) {
		case 'left':
			this.x -= this.speed;
			if(this.x < 0) {
				this.x =0;
			}
			break;
		case 'right':
			this.x += this.speed;
			if(this.x + this.width > ctx.gameWidth) {
				this.x = ctx.gameWidth - this.width;
			}
			break;
		case 'up':
			this.y -= this.speed;
			if(this.y < 0) {
				this.y =0;
			}
			break;
		case 'down':
			this.y += this.speed;
			if(this.y + this.height > ctx.gameHeight) {
				this.y = ctx.gameHeight - this.height;
			}
			break;
	}

};

/**
 * @method Checks if two entities intersect. Only based on x, y, width, height.
 * @param {Entity} a - first entity
 * @param {Entity} b - second entity
 */
function intersects (a, b) {
	return ((a.x < b.x) && (a.x + a.width > b.x) || (a.x >= b.x) && (b.x + b.width > a.x)) &&
	((a.y < b.y) && (a.y + a.height > b.y) || (a.y >= b.y) && (b.y + b.height > a.y));
}

/**
 * @method Initialize a level
 * @param {Number} num - level to initialize. Currently randomly adds num Enemies on level.
 * @todo Update to read levels from levels global.
 */
function initLevel(num) {
	allEnemies = [];
	if (typeof num !== 'number') { num = 3; }
	for(var i = 0; i < num; i++) {
		allEnemies.push(new Enemy(Math.random()*500,Math.random() * 300 + 100, Math.random()*200));
	}
}

//start the game
initLevel(1);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput(allowedKeys[e.keyCode]);
});
