
/**
 * @global
 * @description contains all info necessary for current game state.
 */
var gameState = {
	/** @var {object} start - location where the player will start.
		@todo This could be set for each level separately */
	start: {
		x: 200,
		y: 400
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

/** @const PLAYERDEFAULT - defines default values for player entity */
var PLAYERDEFAULT = {
	offx: 20,
	offy: 65,
	speed: 30,
	width: 65,
	height: 85
};

/** @const ENEMYDEFAULT - defines default values for enemies */
var ENEMYDEFAULT = {
	offx: 0,
	offy: 0,
	speed: 100,
	width: 100,
	height: 65
};


/**
 * @global
 * @description placement of enemies/powerups for each level.
 * @todo Add more functionality: roadblocks, keys, etc.
 */
var levels = [
	{
		enemies: [
			{x:100,y:200,speed:100},
			{x:200,y:375,speed:-20},
			{x:0,y:170,speed:180}
		],
		powerups: [
			{type: 0, x: 100, y: 250}
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
			{type: 0, x: 100, y: 300},
			{type: 2, x: 310, y: 90}
		],
		other: [
		]
	}
];

var powerupTypes = [
	{
		sprite:'images/Gem Blue.png',
		offx: 5,
		offy: 65,
		width: 95,
		height: 100,
		life: 0,
		point: 1
	},
	{
		sprite:'images/Gem Green.png',
		offx: 5,
		offy: 65,
		width: 95,
		height: 100,
		life: 0,
		point: 2
	},
	{
		sprite:'images/Gem Orange.png',
		offx: 5,
		offy: 65,
		width: 95,
		height: 100,
		life: 0,
		point: 3
	},
	{
		sprite:'images/Heart.png',
		offx: 5,
		offy: 50,
		width: 85,
		height: 85,
		life: 1,
		point: 0
	},
	{
		sprite:'images/Key.png',
		offx: 30,
		offy: 60,
		width: 40,
		height: 80,
		life: 3,
		point: 2
	}
];

/**
 * @description Represents any entity/character that is rendered on screen.
 * @constructor
 * @param {string} spr - the sprite to use for the character
 * @param {int} x - x position of the character in px, relative to canvas (left side). For drawing on canvas
 * @param {int} y - y position of the character in px, relative to canvas (top side). For drawing on canvas
 * @param {int} offx - offset from left side of sprite to left side of bounding box for collision detection
 * @param {int} offy - offset from top side of sprite to top side of bounding box for collision detection
 * @param {int} speed - speed of character
 * @param {int} width - the x width of the character in px, used for collision detection
 * @param {int} height - the y height of the character in px, used for collision detection
 * @todo Update to include default values for all parameters.
 */
var Entity = function(spr, x, y, offx, offy, sp, width, height) {
	this.sprite = spr;
	this.x = x;
	this.y = y;
	this.offx = offx;
	this.offy = offy;
	this.speed = sp;
	this.width = width;
	this.height = height;
};

/**
 * @method Renders the entitiy based on it's sprite, x, and y position
 */
Entity.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

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
	if (typeof speed !== 'number') { speed = ENEMYDEFAULT.speed; }
	Entity.call(this, speed >= 0?'images/enemy-bug.png':'images/enemy-bug-reversed.png', x, y, ENEMYDEFAULT.offx, ENEMYDEFAULT.offy, speed, ENEMYDEFAULT.width, ENEMYDEFAULT.height);
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * @method Renders the enemy.
 */
Enemy.prototype.render = function() {
	/* ctx.save();
	if(this.speed < 0)
	{
		// This doesn't work because it will flip x-axis, so intersection calcs get messed up.
		ctx.translate(gameState.gameWidth, 0);
		ctx.scale(-1,1);
	} */
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	//ctx.restore();
};

/**
 * @method updates the location of Enemy depending on speed and dt. Loops around.
 * @param {} dt, a time delta between ticks
 */
Enemy.prototype.update = function(dt) {

	this.x += dt * this.speed;
	if(this.x + this.offx > gameState.gameWidth) {
		this.x = 0 - this.width - this.offx;
	}
	else if (this.x + this.offx + this.width < 0) {
		this.x = gameState.gameWidth - this.offx;
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
var Powerup = function(sprite, x, y, offx, offy, width, height, point, life) {
	this.pointVal = point;
	this.lifeVal = life;
	Entity.call(this, sprite, x, y, offx, offy, 0, width, height);
};

Powerup.prototype = Object.create(Entity.prototype);
Powerup.prototype.constructor = Powerup;

/**
 * @description Player character. Initialized with default sprite, speed, start location.
 * @constructor
 * @augments Entity
 */
var Player = function() {
	Entity.call(this, 'images/char-princess-girl.png', gameState.start.x, gameState.start.y, PLAYERDEFAULT.offx, PLAYERDEFAULT.offy, PLAYERDEFAULT.speed, PLAYERDEFAULT.width, PLAYERDEFAULT.height);
};

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
			gameState.allPowerups.splice(i,1);
		}
	}
	//check for victory
	if(this.y + this.offy < 80) {
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
    ctx.strokeStyle = "blue";
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
			if(this.x + this.offx < 0) {
				this.x = 0 - this.offx;
			}
			break;
		case 'right':
			this.x += this.speed;
			if(this.x + this.offx + this.width > gameState.gameWidth) {
				this.x = gameState.gameWidth - this.width - this.offx;
			}
			break;
		case 'up':
			//top edge of board is not top of canvas
			this.y -= this.speed;
			if(this.y + this.offy < 50) {
				this.y = 50 - this.offy;
			}
			break;
		case 'down':
			this.y += this.speed;
			if(this.y + this.height + this.offy > gameState.gameHeight) {
				this.y = gameState.gameHeight - this.height - this.offy;
			}
			break;
	}

};

/**
 * @method Checks if two entities intersect. Based on x, y, offsets of x/y, width, height.
 * @todo Implement checking based on entity shape
 * @param {Entity} a - first entity
 * @param {Entity} b - second entity
 */
function intersects (a, b) {
	return ((a.x + a.offx < b.x + b.offx) && (a.x + a.offx + a.width > b.x + b.offx) || (a.x + a.offx >= b.x + b.offx) && (b.x + b.offx + b.width > a.x + a.offx)) && ((a.y + a.offy < b.y + b.offy) && (a.y + a.offy + a.height > b.y + b.offy) || (a.y + a.offy >= b.y + b.offy) && (b.y + b.offy + b.height > a.y + a.offy));
}

/**
 * @method Initialize a level
 * @param {Number} num - level to initialize.
 * @description loads levels as defined in levels global array. If the level is not in the levels array, load num enemies randomly.
 */
function initLevel(num) {
	gameState.allEnemies = [];
	gameState.allPowerups = [];
	//if level isn't specified, load level 0.
	if (typeof num !== 'number' || num < 0) {
		num = 0;
	}

	//if level isn't in existing array, load num enemies with random speeds/placement
	if(levels.length <= num) {
		//load random enemies
		for(var i = 0; i < num; i++) {
			gameState.allEnemies.push(new Enemy(Math.random()*500,Math.random() * 300 + 100, Math.random()*400 - 200 ));
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
					powerupTypes[levels[num].powerups[k].type].offx,
					powerupTypes[levels[num].powerups[k].type].offy,
					powerupTypes[levels[num].powerups[k].type].width,
					powerupTypes[levels[num].powerups[k].type].height,
					powerupTypes[levels[num].powerups[k].type].point,
					powerupTypes[levels[num].powerups[k].type].life
				));
		}
	}
}

var player = new Player();
//start the game
initLevel(0);
