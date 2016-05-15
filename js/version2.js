globalCount = 0;
stepCount = 0;
smokeCount = 0;
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());



function Game(options) {
	
	this.noOfInitialBackgrounds = 2;
	
	this.noOfInitialObstacles = 4;
	
	this.canvasElementId = 'canvas';
	this.loading = true;
	
	
	this.stopped = false;
	this.isStarted = false;
	this.pause = false;
	
	this.repeatTime = 1000 / 60;
	
	
	for (property in options){
		this[property] = options[property];
	}
}

Game.prototype.reset = function() {
	
	window.addEventListener('mousedown', mouseDownListener, false);
	window.addEventListener('keydown', keyDownListener, false);
	
	// Sounds
    this.sounds = [
      document.getElementById("rocketMoving"),
      document.getElementById("rocketAscending"),
      document.getElementById("rocketCrashedClouds"),
      document.getElementById("rocketCrashedObstacles")
    ];

	canvas = document.getElementById(this.canvasElementId);
	
	if(typeof this.canvasWidth === 'undefined') {
		if(canvas.width !== 300) {
			this.canvasWidth = parseInt(canvas.width);
			
			this.canvasHeight = parseInt(898 / 1200 * this.canvasWidth);
			
		} else {
			this.canvasWidth = 1336;
			this.canvasHeight = 1000;
		}
	}
	
	document.getElementById(this.canvasElementId).width = this.canvasWidth;
	document.getElementById(this.canvasElementId).height = this.canvasHeight;
	
	context = canvas.getContext('2d');

	
	var canvasSizeRatio = this.canvasSizeRatio = this.canvasWidth / 1336;
	
	// console.log(canvasSizeRatio);
	
	// var canvasSizeRatio = 1;
	
	
	// Should be derived
	
	this.screenWidth = 56 * canvasSizeRatio; // real world width in meters
	this.screenHeight = 14 * canvasSizeRatio;
	
	
	this.gameSpeed = 29 * canvasSizeRatio;
	this.backgroundsSpeed = 0.56 * canvasSizeRatio;
	this.gravity = 11.14 * canvasSizeRatio;
	this.upwardsAcceleration = -11.14 * canvasSizeRatio;
	this.cloudSpeed = 8.9 * canvasSizeRatio;
	this.frontCloudSpeed = 4.45 * canvasSizeRatio;
	
	this.asteroidWidth = 200 * canvasSizeRatio;
	this.asteroidHeight = 200 * canvasSizeRatio;
	this.asteroidCircle = 0.75 * (this.asteroidWidth);
	
	this.obstacleWidth = 215 * canvasSizeRatio;
	this.obstacleHeight = 300 * canvasSizeRatio;
	this.obstacleRectangle = 0.75 * (this.asteroidWidth);
	// this.obstacleHeight = 280 * canvasSizeRatio;

	this.obstaclePolygonFactor = this.obstacleWidth / 265;
	
	
	this.gapBetweenObstacles = 600 * canvasSizeRatio;
	
	this.skyLevel = 100 * canvasSizeRatio;
	this.maximumCloudHeight = 180 * canvasSizeRatio;
	this.maxCloudRadius = 300 * canvasSizeRatio;
	this.minCloudWidth = 100 * canvasSizeRatio;
	this.maxCloudWidth = 100 * canvasSizeRatio;
	
	this.groundLevel = 200 * canvasSizeRatio;
	
	this.groundWidth = 1408 * canvasSizeRatio;
	
	this.hillsHeight = 455 * canvasSizeRatio;
	this.hillsWidth = 1995 * canvasSizeRatio;

	this.playerWidth = 150 * canvasSizeRatio;
	this.playerHeight = 60 * canvasSizeRatio;
	this.explodedHeight = 108 * canvasSizeRatio;
	this.playerPosX = 300 * canvasSizeRatio;
	this.playerPosY = 300 * canvasSizeRatio;
	this.playerAcceleration = 3341 * canvasSizeRatio;
	
	this.badgePosX = 1100 * canvasSizeRatio;
	this.badgePosY = 30 * canvasSizeRatio;
	this.badgeWidth = 220 * canvasSizeRatio;
	this.badgeHeight = 90 * canvasSizeRatio;
	
	this.scoresPosX = 10 * canvasSizeRatio;
	this.scoresPosY = 950 * canvasSizeRatio;
	this.scoresWidth = 1140 * canvasSizeRatio;
	this.scoresHeight = 40 * canvasSizeRatio;
	
	this.distanceScorePosX = 230 * canvasSizeRatio;
	
	this.bestScorePosX = 750 * canvasSizeRatio;
	
	this.highScorePosX = 1180 * canvasSizeRatio;
	
	this.scorePosY = 980 * canvasSizeRatio;
	
	// this.smokeWidth = 29 * canvasSizeRatio;
	// this.smokeHeight = 20 * canvasSizeRatio;
	
	this.smokeWidth = 40 * canvasSizeRatio;
	this.smokeHeight = 20 * canvasSizeRatio;
	
	this.displayTextFont = 40 * canvasSizeRatio;
	
	this.startingDisplayTextPosX = 300 * canvasSizeRatio;
	this.startingDisplayTextPosY = 400 * canvasSizeRatio;
	
	
	if (localStorage.getItem("helicopterHighestScores") === null) {
		localStorage.setItem("helicopterHighestScores", JSON.stringify(new Array()));
	}
	this.highScores = JSON.parse(localStorage.getItem('helicopterHighestScores'));
	this.highScores.sort(function(a, b){ return b - a });
	this.bestScore = (this.highScores.length) ? this.highScores[0] : 0;
	
	this.scale = this.canvasWidth / this.screenWidth;
	this.verticalScale = this.canvasHeight / this.screenHeight;
	
	this.totalDistanceTravelled = 0;
	this.textDivision = this.canvasWidth / 3;
	
	this.backgrounds = new Array();
	this.obstacles = new Array();
	this.dots = new Array();
	
	this.clouds = new Array();
	this.frontClouds = new Array();
	
	this.bottomClouds = new Array();
	this.bottomFrontClouds = new Array();
	
	dots = new Array();
	
	
	// Loading images
	if(this.loading) {
		this.images = {
			'background' : {isLoaded : false, src : 'img/background.png'},
			'backgroundFlip' : {isLoaded : false, src : 'img/background-flip.png'},
			'obstacle' : {isLoaded : false, src : 'img/asteroid.png'},
			// 'astronomer' : {isLoaded : false, src : 'img/inGameObstacle.png'},
			'player' : {isLoaded : false, src : 'img/inGameRocket.png'},
			'rocketExploded' : {isLoaded : false, src : 'img/inGameRocketExploded.png'},
			'smoke' : {isLoaded : false, src : 'img/inGameSmoke2.png'},
			'badge' : {isLoaded : false, src : 'img/inGameBadge.png'},
			'scores' : {isLoaded : false, src : 'img/inGameScores.png'}
		};

		// Loading images
		this.loadImages();
	}

	
	// Load player
	this.player = new Player({
		x: this.playerPosX,
		y: this.playerPosY,
		width: this.playerWidth,
		height: this.playerHeight,
		image: this.images.player.image,
		explodedPlayerHeight: this.explodedHeight,
		velocityY: 0,
		isDisabled: false,
		isExploded: false,
		inClouds: false,
		timer: 0,
		game: this,
		rotateAngle: 0,
		polygon: new Polygon([new Point(this.playerPosX, this.playerPosY), new Point(this.playerPosX + this.playerWidth, this.playerPosY), new Point(this.playerPosX + this.playerWidth, this.playerPosY + this.playerHeight), new Point(this.playerPosX, this.playerPosY + this.playerHeight)])
	});
	
	
	
	// Create initial backgrounds objects
	for (var i = 0; i < this.noOfInitialBackgrounds; i++) {
		this.backgrounds.push(new Background({
			width: this.canvasWidth,
			height: this.canvasHeight,
			x: 0 + i * this.canvasWidth,
			y: 0,
			image: this.images.background.image,
			mirrorImage: this.images.backgroundFlip.image,
			game: this
		}));
	}
	
	
	// Create initial obstacles
	for (var i = 0; i < this.noOfInitialObstacles; i++) {
	
		var initialX = this.canvasWidth + i * this.gapBetweenObstacles;
		var initialY = Math.floor(Math.random() * (this.canvasHeight - this.groundLevel - this.obstacleHeight - this.maximumCloudHeight ) + this.maximumCloudHeight);
		
		// For asteroid
		var image = this.images.obstacle.image;
		var type = 'asteroid';
		var width = this.asteroidWidth;
		var height = this.asteroidHeight;
		var shape = {
				'radius' : 0.8 * width / 2,
				'center' : new Point(initialX + width / 2, initialY + height / 2)
		};
		var speed = getRandomBetween(2, 0.5);
		var radius  = getRandomBetween(4, 0);

		this.obstacles.push(new Obstacle({
			width: width,
			height: height,
			x: initialX,
			y: initialY,
			image: image,
			game: this,
			type: type,
			shape: shape,
			speed: speed,
			radius: radius
		}));
	}
	
	// Create initial top back clouds
	x1 = 0;
	y1 = Math.floor(Math.random() * (this.maximumCloudHeight  - this.skyLevel) + this.skyLevel);
	
	while(x1 < 3 * this.canvasWidth) {
		x2 = x1 + Math.floor(Math.random() * (this.maxCloudWidth - this.minCloudWidth)) + this.minCloudWidth;
		y2 = Math.floor(Math.random() * (this.maximumCloudHeight  - this.skyLevel) + this.skyLevel);
		
		var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
	
		var r = Math.floor(Math.random() * distance) + distance / 2;
		
		var startPoint = new Point(x1, y1);		
		var endPoint = new Point(x2, y2);
		var center = findCenter(startPoint, endPoint, r, false);
		
		this.clouds.push(new Cloud({
			center: center,
			start: startPoint,
			end: endPoint,
			r: r,
			game: this
		}));
		
		x1 = x2;
		y1 = y2;
	}
	
	
	
	// Create initial top front clouds
	x1 = 0;
	y1 = Math.floor(Math.random() * (this.skyLevel));
	
	while(x1 < 3 * this.canvasWidth) {
		x2 = x1 + Math.floor(Math.random() * (this.maxCloudWidth - this.minCloudWidth)) + this.minCloudWidth;
		y2 = Math.floor(Math.random() * (this.skyLevel));
		
		var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
	
		var r = Math.floor(Math.random() * distance) + distance / 2;
		
		var startPoint = new Point(x1, y1);		
		var endPoint = new Point(x2, y2);
		var center = findCenter(startPoint, endPoint, r, false);
		
		this.frontClouds.push(new Cloud({
			center: center,
			start: startPoint,
			end: endPoint,
			r: r,
			game: this
		}));
		
		x1 = x2;
		y1 = y2;
	}
	
	
	
	// Create initial bottom back clouds
	x1 = 0;
	y1 = getRandomBetween((this.canvasHeight - this.skyLevel), (this.canvasHeight - this.maximumCloudHeight));
	while(x1 < 3 * this.canvasWidth) {
		x2 = x1 + Math.floor(Math.random() * (this.maxCloudWidth - this.minCloudWidth)) + this.minCloudWidth;
		y2 = getRandomBetween((this.canvasHeight - this.skyLevel), (this.canvasHeight - this.maximumCloudHeight));
		
		var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
	
		var r = Math.floor(Math.random() * distance) + distance / 2;
		
		var startPoint = new Point(x1, y1);		
		var endPoint = new Point(x2, y2);
		var center = findCenter(startPoint, endPoint, r, true);
		
		this.bottomClouds.push(new Cloud({
			center: center,
			start: startPoint,
			end: endPoint,
			r: r,
			game: this
		}));
		
		x1 = x2;
		y1 = y2;
	}
	
	
	// Create initial bottom front clouds
	x1 = 0;
	y1 = getRandomBetween((this.canvasHeight), (this.canvasHeight - this.skyLevel));
	while(x1 < 3 * this.canvasWidth) {
		x2 = x1 + Math.floor(Math.random() * (this.maxCloudWidth - this.minCloudWidth)) + this.minCloudWidth;
		y2 = getRandomBetween((this.canvasHeight), (this.canvasHeight - this.skyLevel));
		
		var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
	
		var r = Math.floor(Math.random() * distance) + distance / 2;
		
		var startPoint = new Point(x1, y1);		
		var endPoint = new Point(x2, y2);
		var center = findCenter(startPoint, endPoint, r, true);
		
		this.bottomFrontClouds.push(new Cloud({
			center: center,
			start: startPoint,
			end: endPoint,
			r: r,
			game: this
		}));
		
		x1 = x2;
		y1 = y2;
	}
	
	
	
	myVar = setInterval(function() {
		
		if(!globalGame.loading){
			
			globalGame.draw();
			clearInterval(myVar);
			
			
			context.fillStyle = "green";
			context.font = (globalGame.displayTextFont) + 'px monospace';
			context.fillText("CLICK OR ENTER TO START", globalGame.startingDisplayTextPosX,  globalGame.startingDisplayTextPosY);
			context.font = (globalGame.displayTextFont) + 'px monospace';
			context.fillText('CLICK AND HOLD LEFT MOUSE BUTTON TO GO UP', globalGame.startingDisplayTextPosX, globalGame.startingDisplayTextPosY + 50 * globalGame.canvasSizeRatio);
			context.fillText('RELEASE TO GO DOWN', globalGame.startingDisplayTextPosX, globalGame.startingDisplayTextPosY + 100 * globalGame.canvasSizeRatio);
			context.fillText('OR YOU CAN USE UPWARD ARROW KEY', globalGame.startingDisplayTextPosX, globalGame.startingDisplayTextPosY + 150 * globalGame.canvasSizeRatio);
			context.fillText('SPACEBAR TO PAUSE THE GAME', globalGame.startingDisplayTextPosX, globalGame.startingDisplayTextPosY + 200 * globalGame.canvasSizeRatio);
			
			// Set initial scores
			globalGame.setScores();
			
		}
		
	}, 1);
	
	
	
	
}

Game.prototype.init = function() {
	
	
			if(globalGame.isStarted){
				globalGame.step();
			}
			
	
}


function ascend() {
	if(!globalGame.player.isDisabled) {
		globalGame.player.goUp();
	} else {
		globalGame.player.goDown();
	}
}

function descend() {
	globalGame.player.goDown();
}

canvas.onclick = function() {
	globalGame.initGame();
}

Game.prototype.initGame = function() {
	if(!globalGame.isStarted) {
		globalGame.isStarted = true;
		globalGame.init();
	}
}

Game.prototype.paused = function() {
	if(!this.pause && this.isStarted) {
		this.pause = true;
	}
	else if(this.pause && this.isStarted) {
		this.pause = false;
		this.step();
	}
}

Game.prototype.step = function() {

	if(this.pause) return false;
	
	this.totalDistanceTravelled += parseInt(this.gameSpeed * (this.repeatTime / 1000) * (this.scale));
	
	// Backgrounds
	farthestX = 0;
	for(i in this.backgrounds) {
		this.backgrounds[i].step();
		if(this.backgrounds[i].x > farthestX)
			farthestX = this.backgrounds[i].x;
	}
	
	for (i in this.backgrounds) {
		if(this.backgrounds[i].x < -this.backgrounds[i].width){
			delete this.backgrounds[i];
			
			this.backgrounds.push(new Background({
				width: this.canvasWidth,
				height: this.canvasHeight,
				x: farthestX + this.canvasWidth,
				y: 0,
				image: this.images.background.image,
				mirrorImage: this.images.backgroundFlip.image,
				game: this
			}));
		}
	}
	
	
	// Top back clouds
	farthestPoint = new Point(0, 0);
	for(i in this.clouds) {
		this.clouds[i].step();
		if(this.clouds[i].end.x > farthestPoint.x)
			farthestPoint = this.clouds[i].end;
	}
	
	for(i in this.clouds) {
		if(this.clouds[i].end.x < 0){
			delete this.clouds[i];

			x1 = farthestPoint.x;
			y1 = farthestPoint.y;
			
			x2 = x1 + Math.floor(Math.random() * 30) + 30;
			y2 = Math.floor(Math.random() * (this.maximumCloudHeight  - this.skyLevel) + this.skyLevel);
			
			var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
		
			var r = Math.floor(Math.random() * distance) + distance / 2;
			
			var startPoint = new Point(x1, y1);		
			var endPoint = new Point(x2, y2);
			var center = findCenter(startPoint, endPoint, r, false);
			
			this.clouds.push(new Cloud({
				center: center,
				start: startPoint,
				end: endPoint,
				r: r,
				game: this
			}));
		}
	}
	
	
	// Top front clouds
	farthestPoint = new Point(0, 0);
	for(i in this.frontClouds) {
		this.frontClouds[i].fStep();
		if(this.frontClouds[i].end.x > farthestPoint.x)
			farthestPoint = this.frontClouds[i].end;
	}
	
	for(i in this.frontClouds) {
		if(this.frontClouds[i].end.x < 0){
			delete this.frontClouds[i];

			x1 = farthestPoint.x;
			y1 = farthestPoint.y;
			
			x2 = x1 + Math.floor(Math.random() * 30) + 30;
			y2 = Math.floor(Math.random() * (this.maximumCloudHeight  - this.skyLevel) + this.skyLevel);
			
			var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
		
			var r = Math.floor(Math.random() * distance) + distance / 2;
			
			var startPoint = new Point(x1, y1);		
			var endPoint = new Point(x2, y2);
			var center = findCenter(startPoint, endPoint, r, false);
			
			this.frontClouds.push(new Cloud({
				center: center,
				start: startPoint,
				end: endPoint,
				r: r,
				game: this
			}));
		}
	}
	
	
	// Bottom back clouds
	farthestPoint = new Point(0, 0);
	for(i in this.bottomClouds) {
		this.bottomClouds[i].step();
		if(this.bottomClouds[i].end.x > farthestPoint.x)
			farthestPoint = this.bottomClouds[i].end;
	}
	
	for(i in this.bottomClouds) {
		if(this.bottomClouds[i].end.x < 0){
			delete this.bottomClouds[i];

			x1 = farthestPoint.x;
			y1 = farthestPoint.y;
			
			x2 = x1 + Math.floor(Math.random() * 30) + 30;
			y2 = getRandomBetween((this.canvasHeight - this.skyLevel), (this.canvasHeight - this.maximumCloudHeight));
			
			var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
		
			var r = Math.floor(Math.random() * distance) + distance / 2;
			
			var startPoint = new Point(x1, y1);		
			var endPoint = new Point(x2, y2);
			var center = findCenter(startPoint, endPoint, r, true);
			
			this.bottomClouds.push(new Cloud({
				center: center,
				start: startPoint,
				end: endPoint,
				r: r,
				game: this
			}));
		}
	}
	
	
	
	// Bottom front clouds
	farthestPoint = new Point(0, 0);
	for(i in this.bottomFrontClouds) {
		this.bottomFrontClouds[i].fStep();
		if(this.bottomFrontClouds[i].end.x > farthestPoint.x)
			farthestPoint = this.bottomFrontClouds[i].end;
	}
	
	for(i in this.bottomFrontClouds) {
		if(this.bottomFrontClouds[i].end.x < 0){
			delete this.bottomFrontClouds[i];

			x1 = farthestPoint.x;
			y1 = farthestPoint.y;
			
			x2 = x1 + Math.floor(Math.random() * 30) + 30;
			y2 = getRandomBetween((this.canvasHeight), (this.canvasHeight - this.skyLevel));
			
			var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
		
			var r = Math.floor(Math.random() * distance) + distance / 2;
			
			var startPoint = new Point(x1, y1);
			var endPoint = new Point(x2, y2);
			var center = findCenter(startPoint, endPoint, r, true);
			
			this.bottomFrontClouds.push(new Cloud({
				center: center,
				start: startPoint,
				end: endPoint,
				r: r,
				game: this
			}));
		}
	}
	
	
	
	// Obstacles
	farthestX = 0;
	for(i in this.obstacles) {
		this.obstacles[i].step();
		if(this.obstacles[i].x > farthestX){
			farthestX = this.obstacles[i].x;
		}
	}
	
	for (i in this.obstacles) {
		if(this.obstacles[i].x < -this.obstacles[i].width){
			
			delete this.obstacles[i];
			dots.splice(i, 1);
			var initialX = farthestX + this.gapBetweenObstacles;
			var initialY = Math.floor(Math.random() * (this.canvasHeight - this.groundLevel - this.obstacleHeight - this.maximumCloudHeight ) + this.maximumCloudHeight);
			
			// For asteroid
			var image = this.images.obstacle.image;
			var type = 'asteroid';
			var width = this.asteroidWidth;
			var height = this.asteroidHeight;
			var shape = {
					'radius' : 0.8 * width / 2,
					'center' : new Point(initialX + width / 2, initialY + height / 2)
			};
			var speed = getRandomBetween(2, 0.5);
			var radius  = getRandomBetween(4, 0);

			this.obstacles.push(new Obstacle({
				width: width,
				height: height,
				x: initialX,
				y: initialY,
				image: image,
				game: this,
				type: type,
				shape : shape,
				radius: radius,
				speed: speed
			}));
		}	
	}
	
	
	
	// Player
	this.player.step();
	
	
	
	// Either if touched the ground or touched the ceiling or collision with obstacles
	
	if(this.isCollision(this.player, this.obstacles) || this.player.inClouds) {
		
		if(this.isCollision(this.player, this.obstacles))
			playSound(this.sounds[3]);
		if(this.player.inClouds)
			playSound(this.sounds[2]);
	
		this.stop();
		document.getElementById('overlay').style.display = 'block';
		
		this.player.exploded();
		
	} else {
		window.requestAnimationFrame(function(){globalGame.step();});
	}
	
	this.draw();
	
	// Scores
	this.setScores();
}


Game.prototype.setScores = function() {
	
	// context.fillStyle = "skyblue";
	// context.strokeStyle = "black";
	// context.miterLimit = 2;
	// context.lineJoin = 'round';
	// context.font = this.displayTextFont + 'px Impact';
	// context.lineWidth = 4;
	// context.lineCap = 'round';
	// context.strokeText(parseInt(this.totalDistanceTravelled / 100), this.distanceScorePosX, this.scorePosY);
	// context.lineWidth = 3;
	// context.fillText(parseInt(this.totalDistanceTravelled / 100), this.distanceScorePosX, this.scorePosY);
	
	context.fillStyle = "white";
	context.font = this.displayTextFont + 'px monospace';
	context.fillText(parseInt(this.totalDistanceTravelled / 100), this.distanceScorePosX, this.scorePosY);
	
	if(this.stopped) {
		this.highScores.push(parseInt(this.totalDistanceTravelled / 100));
		this.highScores.sort(function(a, b){ return b - a });
		if(this.highScores.length > 3) this.highScores.length = 3;
		localStorage.setItem('helicopterHighestScores', JSON.stringify(this.highScores));
		context.fillText(this.highScores[0], this.bestScorePosX , this.scorePosY);
		context.fillText(this.highScores[0], this.highScorePosX , this.scorePosY);
		
	} else {
		context.fillText(this.bestScore, this.bestScorePosX, this.scorePosY);
		context.fillText(this.bestScore, this.highScorePosX, this.scorePosY);
		// context.fillText(this.highScores.join(', '), this.highScorePosX , this.scorePosY);
	}
	
}

Game.prototype.draw = function() {
	
	// Draw backgrounds
	for (i in this.backgrounds) {
		this.backgrounds[i].draw();
	}

	
	context.fillStyle = "#000099";
	context.fillRect(0, 0, canvas.width, this.skyLevel);
	
	context.fillStyle = "#104BA3";
	context.fillRect(0, this.canvasHeight - this.skyLevel, canvas.width, this.skyLevel);
	
	// Draw top clouds
	for (i in this.clouds) {
		this.clouds[i].draw();
	}
	
	// Draw top front clouds
	for (i in this.frontClouds) {
		this.frontClouds[i].drawFront();
	}
	
	// Draw bottom clouds
	for (i in this.bottomClouds) {
		this.bottomClouds[i].drawBottom();
	}
	
	// Draw bottom front clouds
	for (i in this.bottomFrontClouds) {
		this.bottomFrontClouds[i].drawBottomFront();
	}
	
	
	
	// Draw obstacles
	for (i in this.obstacles) {
		this.obstacles[i].draw();
	}

	
	// Smoke
	var theta = (this.rotateAngle * Math.PI/180);
	// context.rotate(theta);
	
	for (i in dots) {
		dot = dots[i];
		
		if(stepCount % 2 == 0) {
			if (i % 2 == 0) {
				context.drawImage(this.images.smoke.image, dot.x - this.totalDistanceTravelled, dot.y - 12 + 1, this.smokeWidth, this.smokeHeight);
			} else {
				context.drawImage(this.images.smoke.image, dot.x - this.totalDistanceTravelled, dot.y - 12, this.smokeWidth, this.smokeHeight);
			}
		} else {
			if (i % 2 == 1) {
				context.drawImage(this.images.smoke.image, dot.x - this.totalDistanceTravelled, dot.y - 12 + 1, this.smokeWidth, this.smokeHeight);
			} else {
				context.drawImage(this.images.smoke.image, dot.x - this.totalDistanceTravelled, dot.y - 12, this.smokeWidth, this.smokeHeight);
			}
		}
		
	}
	
	// context.rotate(-theta);
	
	
	// Draw player
	this.player.draw();
	
	// Draw badge
	context.drawImage(this.images.badge.image, this.badgePosX, this.badgePosY, this.badgeWidth, this.badgeHeight);	
	
	// Draw Scores Image
	context.drawImage(this.images.scores.image, this.scoresPosX, this.scoresPosY, this.scoresWidth, this.scoresHeight);
	
}




Game.prototype.startGame = function() {
	this.stopped = false;
	this.isStarted = false;
	this.reset();
}

Game.prototype.stop = function() {
	this.stopped = true;
	this.isStarted = false;
}

Game.prototype.isCollision = function (player, obstacles) {
	
	
	for(var i in obstacles) {
		
		// if(obstacles[i].type == 'asteroid') {
		
			for(var j = 0; j < player.polygon.vertices.length; j++) {
				
				if( Math.pow(player.polygon.vertices[j].x - obstacles[i].shape.center.x, 2) + Math.pow(player.polygon.vertices[j].y - obstacles[i].shape.center.y, 2) < Math.pow(obstacles[i].shape.radius, 2) ) {
					return true;
				}
				
			}
		
		// }
		
	}
	
	

	/* Only for polygons
	for (var i in obstacles) {
		if(polygonsIntersect(player.polygon, obstacles[i].polygon)) {			
			return true;
		}
	}
	return false;
	*/
}


/**
	Backgrounds class and its methods
**/
function Background(options) {
	this.width = this.canvasWidth;
	this.height = this.canvasHeight;
	this.x = 0;
	this.y = 0;
	
	for (property in options){
		this[property] = options[property];
	}
}

Background.prototype.draw = function() {
	context.drawImage(this.image, this.x, this.y, this.width, this.height);
}

Background.prototype.step = function() {
	this.x = this.x - this.game.backgroundsSpeed * (this.game.repeatTime / 1000) * (this.game.scale);
}


/**
	Obstacle class and its methods
**/
function Obstacle(options) {
	this.width = 35;
	this.height = 80;
	
	for (property in options){
		this[property] = options[property];
	}
}

Obstacle.prototype.draw = function() {

	context.drawImage(this.image, this.x, this.y, this.width, this.height);
	
	if(this.type == 'asteroid') {		
		// context.beginPath();
		// context.arc(this.shape.center.x, this.shape.center.y, (0.8 * this.width) / 2, 0, 2 * Math.PI);
		// context.fillStyle = 'green';
		// context.fill();
	}
	
	if(this.type == 'astronomer') {
		// context.fillStyle = "green";
		// drawPolygon(this.shape, context);
	}
	
	// drawPolygon(this.polygon, context);
	
}

Obstacle.prototype.step = function() {
	
	var timeInMilliSeconds = new Date().getTime() % 4000;
	
	var angle = this.speed * timeInMilliSeconds * 0.09 * Math.PI / 180;
	
	this.x = this.x - this.game.gameSpeed * (this.game.repeatTime / 1000) * (this.game.scale);
	this.x = this.x + this.radius * Math.cos(angle);
	this.y = this.y + this.radius * Math.sin(angle);
	
	// if(this.type == 'asteroid') {
	
		this.shape.center = new Point(this.x + this.width / 2, this.y + this.height / 2);
	
	// }
	
	// this.polygon = getUpdatedPolygon(globalGame.obstaclePolygonFactor, this.x, this.y);
}


/**
	Cloud class and its methods
**/
function Cloud(options) {
	for (property in options){
		this[property] = options[property];
	}
	
	if ( typeof options.r === 'undefined' ) {
		this.r = Math.sqrt( (center.y - start.y) * (center.y - start.y) + (center.x - start.x) * (center.x - start.x) );
	}
}

Cloud.prototype.step = function() {
	this.center.x = this.center.x - this.game.cloudSpeed * (this.game.repeatTime / 1000) * (this.game.scale);
	this.start.x = this.start.x - this.game.cloudSpeed * (this.game.repeatTime / 1000) * (this.game.scale);
	this.end.x = this.end.x - this.game.cloudSpeed * (this.game.repeatTime / 1000) * (this.game.scale);
	
}

Cloud.prototype.fStep = function() {
	this.center.x = this.center.x - this.game.frontCloudSpeed * (this.game.repeatTime / 1000) * (this.game.scale);
	this.start.x = this.start.x - this.game.frontCloudSpeed * (this.game.repeatTime / 1000) * (this.game.scale);
	this.end.x = this.end.x - this.game.frontCloudSpeed * (this.game.repeatTime / 1000) * (this.game.scale);
	
}

Cloud.prototype.draw = function() {
	context.fillStyle = "white";
	drawArc(this.start, this.end, this.center, context, false);
}

Cloud.prototype.drawFront = function() {
	context.fillStyle = "white";
	drawArc(this.start, this.end, this.center, context, true);
}

Cloud.prototype.drawBottom = function() {
	context.fillStyle = "white";
	drawBottomArc(this.start, this.end, this.center, context, false);
}

Cloud.prototype.drawBottomFront = function() {
	context.fillStyle = "white";
	drawBottomArc(this.start, this.end, this.center, context, true);
}






function Player(options) {
	this.width = 70;
	this.height = 27;
	this.velocityY = 0;

	for (property in options){
		this[property] = options[property];
	}
	
	this.isUp = false;
}

Player.prototype.draw = function () {
	
	var theta = (this.rotateAngle * Math.PI/180);
	
	
	// Drawing rocket image
	// Rotating context, transforming coordinates of an image, drawing an image and rotating context back to normal position.
	context.rotate(theta);
	
	newX = this.x * Math.cos ( - theta) - this.y * Math.sin( - theta);
	newY = this.x * Math.sin ( - theta) + this.y * Math.cos( - theta);
	
	// if(this.inClouds) context.globalAlpha = 0.2;
	
	
		context.drawImage(this.image, newX, newY, this.width, this.height);
		
		
	// if(this.inClouds) context.globalAlpha = 1;
	
	context.rotate(-theta);
	
	

	// Rocket as polygon
	// We need the transformed coordinates of transformed coordinates to get the polygon around the rocket
	var newPolygon = new Polygon([
		transformCoordinates(new Point(newX, newY), -theta),
		transformCoordinates(new Point(newX + this.width, newY), -theta),
		transformCoordinates(new Point(newX + this.width, newY + this.height), -theta),
		transformCoordinates(new Point(newX, newY + this.height), -theta)
	]);
	this.polygon = newPolygon;
	
// drawPolygon(this.polygon, context)
	
	
}

function playSound(element) {
	for(var i = 0; i < globalGame.sounds.length; i++) {
		
		globalGame.sounds[i].pause();
		
		if(i == 0 && globalGame.sounds[i].currentTime > 6) {
			globalGame.sounds[i].currentTime = 0;
		}
		if(i == 1 && globalGame.sounds[i].currentTime > 3)
			globalGame.sounds[i].currentTime = 0;
			
		if(i == 2 || i == 3)
			globalGame.sounds[i].currentTime = 0;
		
	}
	element.play();
	
}


Player.prototype.step = function () {
	var u = this.velocityY; // initial velocity or previous velocity
	var t = this.game.repeatTime / 1000; // the time interval between two events			// 0.016666
	
	this.inClouds = !!(this.isInClouds());
	
	if (this.isUp) {
		
		playSound(this.game.sounds[1]);
			
		// Here we are capping the velocity to the maximum of 7, as we are increasing gravity as time continues.
		if(this.y > (this.game.canvasHeight - this.game.groundLevel - this.height - 50) && this.isPathShifted && this.velocityY > 1) {
			this.velocityY = 1;
			u = 1;
			
			this.isPathShifted = false;
		}
		
		
		// this.y = this.y + (this.velocityY * t + 0.5 * a * t * t) * (this.game.verticalScale);
		// this.polygon.vertices[0].y  = this.polygon.vertices[0].y + (this.velocityY * t + 0.5 * a * t * t) * (this.game.verticalScale);
		// a = this.game.upwardsAcceleration;
		// this.velocityY = u + a * t;
		
		
		
		this.y = this.y + this.velocityY * t;
		this.polygon.vertices[0].y  = this.polygon.vertices[0].y + this.velocityY * t;
		
		var accelTime = 0.15;
		
		if (this.velocityY > - (this.game.playerAcceleration * accelTime)) {
			
			this.velocityY = this.velocityY - this.game.playerAcceleration * t;			// Decreasing the velocity for constant acceleration for some accelTime
			
		}
		
		
		if(this.rotateAngle > -5) {
			this.rotateAngle -= 5;
		}
		
		
		
	} else {
		
		//playSound(this.game.sounds[0]);
		
		this.y = this.y + this.velocityY * t;
		this.polygon.vertices[0].y  = this.polygon.vertices[0].y + this.velocityY * t;
		
		
		var accelTime = 0.20;
		
		if (this.velocityY < (this.game.playerAcceleration * accelTime)) {
			
			// Increasing the velocity for constant acceleration for some accelTime
			
			this.velocityY = this.velocityY + this.game.playerAcceleration * t;			//( a * t is 3000 * 0.0167 = 50)
			
		} 
		// else {
			
			// this.velocityY = this.velocityY + this.game.playerAcceleration * t + 0.5 * this.game.playerAcceleration * t * t;
			
		// }
		
		
		
		// console.log(this.velocityY);
		
		// a = this.game.gravity;
		
		// this.velocityY = u + a * t;
		
		// this.y = this.y + (u * t + 0.5 * a * t * t) * (this.game.verticalScale);
		// this.polygon.vertices[0].y  = this.polygon.vertices[0].y + (u * t + 0.5 * a * t * t) * (this.game.verticalScale);
		
		if(this.rotateAngle < 0) {
			this.rotateAngle += 1;
		}
		
	}
	
	// console.log(this.isUp);
	// if(this.y <= 0)
		// this.y = 0;
		
	
	smokeCount++;
	
	
	if(this.isUp) var smokeMod = 3;		// Releasing more puffs when going up.
	
	else var smokeMod = 3;
	
	if(smokeCount % smokeMod == 0) {
		smokeCount = 0;
		stepCount++;
		dots.push({
			x: parseInt(this.x) + this.game.totalDistanceTravelled - this.game.smokeWidth / 2,
			y: this.y + (this.height) / 2,
		});
		
		for (i in dots) {
			dot = dots[i];
			
			if(dot.x - this.game.totalDistanceTravelled < -5) {
				delete dots[i];
				dots.splice(i, 1);		// Removing undefined elements from the array
			}
			
		}
	}
	
	return true;
}

Player.prototype.goUp = function (event) {
	if(!this.isUp) {
		this.isPathShifted = true;
	}
	this.isUp = true;
	
	// console.log(this.velocityY);

}

Player.prototype.goDown = function (event) {
	
	this.isUp = false;
	
	
	if(!this.isDisabled) {
		// this.velocityY += 1;
	}
	
}

Player.prototype.exploded = function () {
	this.image = this.game.images.rocketExploded.image;
	this.height = this.explodedPlayerHeight;
	this.isExploded = true;
}

Player.prototype.isInClouds = function () {
	for (var i in this.game.clouds) {
		cloud = this.game.clouds[i];
		
		if ( (this.x - cloud.center.x) * (this.x - cloud.center.x) + (this.y - cloud.center.y) * (this.y - cloud.center.y) < cloud.r * cloud.r) {
			return true;
		}
	}
	for (var i in this.game.bottomClouds) {
		cloud = this.game.bottomClouds[i];
		
		if ( (this.x - cloud.center.x) * (this.x - cloud.center.x) + ((this.y + this.height) - cloud.center.y) * ((this.y + this.height) - cloud.center.y) < cloud.r * cloud.r) {
			return true;
		}
	}
	return false;
}

function Score(high) {
	high = typeof high !== 'undefined' ? high : [];
	this.current = 0;
	this.high = high;
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function transformCoordinates(initial, theta) {
	return new Point(( initial.x * Math.cos(theta) ) + ( initial.y * Math.sin(theta) ), - ( initial.x * Math.sin(theta) ) + ( initial.y * Math.cos(theta) ));
}

function findCenter(startPoint, endPoint, r, isBottom) {
	var originalStartPoint = startPoint;
	var originalEndPoint = endPoint;
	var theta = Math.atan( (endPoint.y - startPoint.y) / (endPoint.x - startPoint.x));
	
	if(!isBottom) {
		theta = theta - Math.PI;
	}
	
	var x1 = startPoint.x;
	var y1 = startPoint.y;
	var x2 = endPoint.x;
	var y2 = endPoint.y;
	
	var distance = Math.sqrt( ( (y2 - y1) * (y2 - y1) ) + ( (x2 - x1) * (x2 - x1) ) );
	
	startPoint = transformCoordinates(startPoint, theta);
	endPoint = transformCoordinates(endPoint, theta);
	
	center = new Point( (startPoint.x + endPoint.x) / 2, 0);
	
	var alpha = Math.acos( distance / (2 * r) );
	
	center.y = startPoint.y + ( ( distance / 2 ) * Math.tan( alpha ) );
	
	center = transformCoordinates(center, -theta);
	
	
	return center;
}

function drawArc(startPoint, endPoint, center, context, isFront) {
	var distance = Math.sqrt( ( (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y) ) + ( (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x) ) );
	var r = Math.sqrt( ( (center.y - startPoint.y) * (center.y - startPoint.y) ) + ( (center.x - startPoint.x) * (center.x - startPoint.x) ) );
	
	var startAngle = Math.atan((endPoint.y - center.y) / (endPoint.x - center.x));
	
	
	if (center.y > endPoint.y) {
		if (startAngle < 0 ) {
			startAngle = Math.PI + startAngle;
		}
	} else {
		if (startAngle < 0 ) {
			startAngle = 2 * Math.PI + startAngle;
		}
	}
	
	var arcAngle = 2 * Math.asin(distance / (2 * r));
	
	var endAngle = startAngle + arcAngle;
	
	if (endAngle >= 2 * Math.PI ) {
		endAngle = endAngle - 2 * Math.PI;
	}
	
	
	context.beginPath();
	context.moveTo(endPoint.x, endPoint.y);
	context.arc(center.x, center.y, r, startAngle, endAngle);
	context.arc(center.x, center.y, r, endAngle, startAngle);
	context.arc(center.x, center.y, r, startAngle, endAngle);
	
	// To be used later
	// context.lineTo(startPoint.x, 0);
	// context.lineTo(endPoint.x, 0);
	context.closePath();
	if(isFront)
		context.fillStyle = "#002B6B";
	else
		context.fillStyle = "#000099";
	
	context.fill();
	
	
	// Gradient for clouds
	// var x1 = 100;   // x of 1. circle center point
	// var y1 = 100;   // y of 1. circle center point
	// var r1 = 35;    // radius of 1. circle

	// var x2 = 100;   // x of 2. circle center point
	// var y2 = 100;   // y of 2. circle center point
	// var r2 = r;   // radius of 2. circle
	

	// var radialGradient1 = context.createRadialGradient(x1, y1, r1, x2, y2, r2);

	// radialGradient1.addColorStop(0, 'rgb(0, 0, 120)');
	// radialGradient1.addColorStop(1, 'rgb(0, 0, 0)');

	// context.fillStyle = radialGradient1;
	// context.fillRect(0, 0, 200, 200);
	
	
	
}

function drawBottomArc(startPoint, endPoint, center, context, isBottomFront) {
	var distance = Math.sqrt( ( (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y) ) + ( (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x) ) );
	var r = Math.sqrt( ( (center.y - startPoint.y) * (center.y - startPoint.y) ) + ( (center.x - startPoint.x) * (center.x - startPoint.x) ) );
	
	var startAngle = Math.atan((endPoint.y - center.y) / (endPoint.x - center.x));
	
	
	var arcAngle = 2 * Math.asin(distance / (2 * r));
	
	startAngle = startAngle - arcAngle;
	
	var endAngle = startAngle + arcAngle;
	
	context.beginPath();
	context.moveTo(endPoint.x, endPoint.y);
	context.arc(center.x, center.y, r, startAngle, endAngle);
	context.arc(center.x, center.y, r, endAngle, startAngle);
	context.arc(center.x, center.y, r, startAngle, endAngle);
	
	
	
	context.lineTo( endPoint.x, globalGame.canvasHeight);
	context.lineTo(startPoint.x, globalGame.canvasHeight);
	context.closePath();
	
	if(isBottomFront)
		context.fillStyle = "#001D72";
	else
		context.fillStyle = "#104BA3";
	
	context.fill();
}


function generateRandomInteger (start, end, seed) {
	var random = start;
	seed = Math.floor(seed);
	for(var i = 0; i < seed; i++) {
		random = Math.floor(Math.random() * (end - start)) + start;
	}
	
	return random;
}



Game.prototype.loadImages = function() {
	for(i in this.images) {
		this.images[i].image = loadImage(this.images[i].src, i);
	}
}

function loadImage(src, imageReference) {
	var img = new Image();
	img.onload = function() {
		globalGame.images[imageReference].isLoaded = true;
	
		for(i in globalGame.images) {
			if(!globalGame.images[i].isLoaded) {
				globalGame.loading = true;
				return;
			}
		}
		
		globalGame.loading = false;
	}
	
	img.src = src;
	
	return img;
}

function imageLoadedCallback (imageReference) {
	globalGame.images[imageReference].isLoaded = true;
	
	for(i in globalGame.images) {
		if(!globalGame.images[i].isLoaded) {
			globalGame.loading = true;
			return;
		}
	}
	
	globalGame.loading = false;
}



globalGame = new Game();
globalGame.reset();
globalGame.init();






function Vector(a, b) {
	this.a = a;
	this.b = b;
}

Vector.prototype.dot = function(vector) {
	
	r = this.a * vector.a + this.b * vector.b;
	return r;
}

Vector.prototype.subtract = function(vector) {
	var result = {
		a : this.a - vector.a,
		b : this.b - vector.b,
	}
	resultVector = new Vector(result.a,result.b);
	return resultVector;
}

function Polygon(points) {
	this.vertices = points;
}

function isPointInsideTriangle(pointA, pointB, pointC,pointP) {
	
	var A = new Vector(pointA.x, pointA.y);
	var B = new Vector(pointB.x, pointB.y);
	var C = new Vector(pointC.x, pointC.y);
	var P = new Vector(pointP.x, pointP.y);
	
	v0 = C.subtract(A);
	v1 = B.subtract(A);
	v2 = P.subtract(A);
	
	
	dot00 = v0.dot(v0);
	dot01 = v0.dot(v1);
	dot02 = v0.dot(v2);	
	dot11 = v1.dot(v1);
	dot12 = v1.dot(v2);
	
	
	
	
	invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
	
	u = (dot11 * dot02 - dot01 * dot12) * invDenom;
	v = (dot00 * dot12 - dot01 * dot02) * invDenom;
	
	if( (u >= 0) && (v >= 0)) {
		if (u+v < 1){	
			return 1;
		}	
	}
	else {
		return 0;
	}
}

function isPointInsidePolygon(polygon, point) {
	
	for(var i = 0; i < polygon.vertices.length - 2; i++) {
		if (isPointInsideTriangle(polygon.vertices[0], polygon.vertices[i + 1], polygon.vertices[i + 2], point)) {
			return true;
		}
	}
	return false;
}


function polygonsIntersect(polygon1, polygon2) {
	
		for(var i = 0; i < polygon2.vertices.length; i++) {
			if(isPointInsidePolygon(polygon1, polygon2.vertices[i])){
				return true;
			}
		}
		for(var j = 0; j < polygon1.vertices.length; j++) {
			if(isPointInsidePolygon(polygon2,polygon1.vertices[j])){
				return true; 
			}
		}
	
	return false;
}

function getUpdatedPolygon(polygonFactor, initialX, initialY) {
	return new Polygon(
		[
			new Point(50 * polygonFactor + initialX, 8 * polygonFactor + initialY),
			new Point(135 * polygonFactor + initialX, 10.5 * polygonFactor + initialY),
			new Point(184 * polygonFactor + initialX, 25 * polygonFactor + initialY),
			new Point(205 * polygonFactor + initialX, 59 * polygonFactor + initialY),
			new Point(205 * polygonFactor + initialX, 81 * polygonFactor + initialY),
			new Point(113 * polygonFactor + initialX, 266 * polygonFactor + initialY),
			new Point(102 * polygonFactor + initialX, 272 * polygonFactor + initialY),
			new Point(90.5 * polygonFactor + initialX, 272 * polygonFactor + initialY),
			new Point(74 * polygonFactor + initialX, 260 * polygonFactor + initialY),
			new Point(11 * polygonFactor + initialX, 79 * polygonFactor + initialY),
			new Point(11 * polygonFactor + initialX, 49 * polygonFactor + initialY),
			new Point(25 * polygonFactor + initialX, 27 * polygonFactor + initialY),
		]
	)
}

function getUpdatedRect(x, y, width, height) {
	
	x = x + 0.1 * width;
	y = y + 0.1 * height;
	width = 0.8 * width;
	height = 0.8 * height;
	
	return new Polygon(
		[
			new Point(x, y),
			new Point(x + width, y),
			new Point(x + width, y + height),
			new Point(x, y + height)
		]
	);
}

function drawPolygon(polygon, context) {
	for(var i in polygon.vertices) {
		if( i == 0) {
			context.beginPath();
			context.moveTo(polygon.vertices[i].x, polygon.vertices[i].y);
		} else if( i == polygon.vertices.length - 1) {
			context.lineTo(polygon.vertices[i].x, polygon.vertices[i].y)
			context.closePath();
			context.fill();
		} else {
			context.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
		}
	}
}


function getRandomBetween(maximum, minimum) {
	
	return Math.floor(Math.random() * (maximum  - minimum) + minimum);
	
}



// Adding mousedown, mouseup, keydown, and keyup event listeners

var mouseDownListener = function () {
	
	ascend();
	
};

window.addEventListener('mousedown', mouseDownListener, false); 


var mouseUpListener = function (e) {
	
	descend();
	
};


window.addEventListener('mouseup', mouseUpListener, false);

var keyDownListener = function (e) {
	
	// Unlike the mousedown, keydown fires multiple times while key is pressed and hold. As we need to fire only once, we are checking whether player is not going up and player is not disabled.
	if (e.keyCode === 38 && !globalGame.player.isUp && !globalGame.player.isDisabled) {
	
		ascend();
		e.preventDefault();
		
	}
	
};


window.addEventListener('keydown', keyDownListener, false);

window.addEventListener('keyup', function(e) {
	if (e.keyCode === 38) {
		
		descend();
		e.preventDefault();
		
	}
}, false);

window.addEventListener('touchstart', function(e) {

	ascend();
	
}, false);

window.addEventListener('touchend', function(e) {

    descend();
	
}, false);