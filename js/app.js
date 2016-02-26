
/**
 * @global
 */
var gameState = {
	start: {
		x: 200,
		y: 450
	},
	level: 1,
	lives: 3,
	gameWidth: 500,
	gameHeight: 550
};

/**
 *
 */
var levels = [
	{},
	{}
]
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
 * @
 */

Entity.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Entity.prototype.update = function(dt) {
	//default for entities it not to move.
};


// Enemies our player must avoid
var Enemy = function(x, y, sp) {
	// Variables applied to each of our instances go here,
	// we've provided one for you to get started
	if (typeof sp !== 'number') { sp = 100; }
	Entity.call(this, 'images/enemy-bug.png', x, y, sp, 100, 75);
	this.speed = sp;
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/**
 *
 * @param {} dt, a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
	// You should multiply any movement by the dt parameter
	// which will ensure the game runs at the same speed for
	// all computers.
	//default for entities it not to move.
	this.x += dt*this.speed;
	if(this.x > ctx.gameWidth) {
		this.x = 0 - this.width;
	}
	else if (this.x < 0 - this.width) {
		this.x = ctx.gameWidth;
	}
};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
	Entity.call(this, 'images/char-princess-girl.png', gameState.start.x, gameState.start.y, 30, 74, 100);
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

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

Player.prototype.die = function() {
	this.x = gameState.start.x;
	this.y = gameState.start.y;
	alert("you died.");
	init(gameState.level);
};

Player.prototype.win = function() {
	this.x = gameState.start.x;
	this.y = gameState.start.y;
	alert("You Win!");
	gameState.level++;
	init(gameState.level);
};

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

function intersects (a, b) {
	return ((a.x < b.x) && (a.x + a.width > b.x) || (a.x >= b.x) && (b.x + b.width > a.x)) &&
	((a.y < b.y) && (a.y + a.height > b.y) || (a.y >= b.y) && (b.y + b.height > a.y));
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var player = new Player();

function init(num) {
	allEnemies = [];
	if (typeof num !== 'number') { num = 3; }
	for(var i = 0; i < num; i++) {
		allEnemies.push(new Enemy(Math.random()*500,Math.random() * 300 + 100, Math.random()*200));
	}
}
init(1);

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
