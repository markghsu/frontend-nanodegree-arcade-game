
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
	level: 0,
	/** @var {number} lives - current lives, game ends at 0 */
	lives: 3,
	/** @var {number} points - current points */
	points: 0,
	/** @var {number} gameWidth - width of the game board */
	gameWidth: 500,
	/** @var {number} gameHeight - height of the game board, not including the bottom of the tiles*/
	gameHeight: 550,
	allEnemies: [],
	allPowerups:[]
};

/**
 * @global
 * @description Contains JSON defining each level.
 */
var levels = [
	{
		enemies: [
			{x:100,y:200,speed:100},
			{x:200,y:375,speed:70},
			{x:0,y:170,speed:180}
		],
		powerups: [
			{type: 0, x: 200, y: 350}
		],
		other: [
		]
	},
	{
		enemies: [
			{x:100,y:360,speed:100},
			{x:300,y:300,speed:70},
			{x:0,y:130,speed:180},
			{x:200,y:300,speed:130},
			{x:20,y:130,speed:150}
		],
		powerups: [
			{type: 0, x: 100, y: 300}
		],
		other: [
		]
	}
];

var powerupTypes = [
	{
		sprite:'images/Gem Blue.png',
		life: 0,
		point: 1
	},
	{
		sprite:'images/Gem Green.png',
		life: 0,
		point: 2
	},
	{
		sprite:'images/Gem Orange.png',
		life: 0,
		point: 3
	},
	{
		sprite:'images/Heart.png',
		life: 1,
		point: 0
	},
	{
		sprite:'images/Key.png',
		life: 3,
		point: 2
	}
];

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
	Entity.call(this, 'images/enemy-bug.png', x, y, speed, 100, 75);
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
 * @description Powerups that the player tries to get
 * @constructor
 * @augments Entity
 * @param {string} sprite - sprite of powerup
 * @param {int} x - x position of the powerup in px, relative to canvas (left side)
 * @param {int} y - y position of the powerup in px, relative to canvas (top side)
 * @param {int} point - point value received when collecting powerup
 * @param {int} life - life value received when collecting powerup
 */
var Powerup = function(sprite, x, y, point, life) {
	this.pointVal = point;
	this.lifeVal = life;
	Entity.call(this, sprite, x, y, 0, 100, 75);
};

Powerup.prototype = Object.create(Entity.prototype);
Powerup.prototype.constructor = Powerup;

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
	for(var i = 0; i < gameState.allEnemies.length; i++) {
		if(intersects(this, gameState.allEnemies[i])) {
			this.die();
		}
	}
	for(i = 0; i < gameState.allPowerups.length; i++) {
		if(intersects(this, gameState.allPowerups[i])) {
			gameState.points += gameState.allPowerups[i].pointVal;
			gameState.lives += gameState.allPowerups[i].lifeVal;
			gameState.allPowerups.pop(i);
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
	render();
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
    ctx.fillText("Levels Completed: " + gameState.level, 50, 400);
    ctx.strokeText("Game Over!",120,200);
    ctx.strokeText("Final Score: " + gameState.points, 100, 300);
    ctx.strokeText("Levels Completed: " + gameState.level, 50, 400);
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
 * @todo Implement checking based on entity shape
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
 */
function initLevel(num) {
	gameState.allEnemies = [];
	gameState.allPowerups = [];
	if (typeof num !== 'number' || num < 0) {
		num = 3;
	}
	if(levels.length <= num) {
		//load random enemies
		for(var i = 0; i < num; i++) {
			gameState.allEnemies.push(new Enemy(Math.random()*500,Math.random() * 300 + 100, Math.random()*200));
		}
	}
	else {
		for(var j = 0; j < levels[num].enemies.length; j++) {
			gameState.allEnemies.push(new Enemy(levels[num].enemies[j].x,levels[num].enemies[j].y, levels[num].enemies[j].speed));
		}
		for(var k = 0; k < levels[num].powerups.length; k++) {
			gameState.allPowerups.push(
				new Powerup(
					powerupTypes[levels[num].powerups[k].type].sprite,
					levels[num].powerups[k].x,
					levels[num].powerups[k].y,
					powerupTypes[levels[num].powerups[k].type].point,
					powerupTypes[levels[num].powerups[k].type].life
				));
		}
	}
}

var player = new Player();
//start the game
initLevel(0);
