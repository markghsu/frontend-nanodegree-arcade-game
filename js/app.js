
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
		if(this.intersects(gameState.allEnemies[i])) {
			this.die();
		}
	}
	for(i = 0; i < gameState.allPowerups.length; i++) {
		if(this.intersects(gameState.allPowerups[i])) {
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
 * @method Checks if player intersects with other entity. Based on x, y, offsets of x/y, width, height.
 * @todo Implement checking based on entity shape
 * @param {Entity} ent - entity to check
 */
Player.prototype.intersects = function (ent) {
	return ((this.x + this.offx < ent.x + ent.offx) && (this.x + this.offx + this.width > ent.x + ent.offx) ||
		(this.x + this.offx >= ent.x + ent.offx) && (ent.x + ent.offx + ent.width > this.x + this.offx)) &&
	((this.y + this.offy < ent.y + ent.offy) && (this.y + this.offy + this.height > ent.y + ent.offy) ||
		(this.y + this.offy >= ent.y + ent.offy) && (ent.y + ent.offy + ent.height > this.y + this.offy));
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
			var enm = levels[num].enemies[j];
			gameState.allEnemies.push(new Enemy(enm.x, enm.y, enm.speed));
		}
		for(var k = 0; k < levels[num].powerups.length; k++) {
			var pup = levels[num].powerups[k];
			var ptype = powerupTypes[pup.type];
			gameState.allPowerups.push(
				new Powerup(
					ptype.sprite,
					pup.x,
					pup.y,
					ptype.offx,
					ptype.offy,
					ptype.width,
					ptype.height,
					ptype.point,
					ptype.life
				));
		}
	}
}

var player = new Player();
//start the game
initLevel(0);
