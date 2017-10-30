window.onerror = function (msg, url, linenumber) {
	alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
	return true;
}
var canvas;
var ctx;
var bucket;
var av_button;
var av_counter = 0;
var base_penalty = 5000;
var av_speed_mod = .1;
var av_size_mod = -.1;
var win_score = 64;
var startTime = 30000;
var timeRemaining = startTime;
var score_arr = [];
var score_arr2 = [];
var virusEscapeTimer = null;

// New additions
var results_arr2 = [];
var disableClick = false;
var game_id = 1;



var app = {


	initialize: function () {
		this.bindEvents();


	},

	bindEvents: function () {
		document.addEventListener('deviceready', this.onDeviceReady, false);

	},

	onDeviceReady: function () {
		loadEverything();
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		//Set up the Canvas and create click functions
		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;
		document.body.appendChild(canvas)
		document.getElementsByClassName('back')[0].onclick = back;
		document.getElementsByClassName('play')[0].onclick = playButton;
		canvas.addEventListener('touchmove', touchMove);
		canvas.addEventListener("touchstart", touchStart);
		canvas.addEventListener("touchend", touchEnd);


		bucket = new bucket();
		av_button = new av_button();
		ctx.font = "24pt Ariel"
		ctx.textAlign = "left";
	},

};
app.initialize();
var currentImage = 0;
var previousImage = 0;
var totalImages = 1;
var score_image_arr = [];
var key_image_arr = [];
//Load the Key image (image you are building) into an array to use later
for (i = 0; i < 4; i++) {
	for (j = 0; j < 4; j++) {
		var tempImage = new Image();
		tempImage.src = 'assets/img/key_image/key Image-' + j + '-' + i + '.png';
		key_image_arr.push(tempImage);
	}

}
score_image_arr.push(key_image_arr);
var virus_red_image = new Image();
virus_red_image.src = 'assets/img/virus_red.png';
var notification_image = new Image();
notification_image.src = 'assets/img/virus_notification.png';
var virus_red_splat_image = new Image();
virus_red_splat_image.src = 'assets/img/virus_splat.png';
var virus_green_image = new Image();
virus_green_image.src = 'assets/img/virus_green.png';
var data_bucket_image = new Image();
data_bucket_image.src = 'assets/img/data_bucket.png';
var background_image;

var background_image_green = new Image();
background_image_green.src = 'assets/img/virusBG.png';
var background_image_red = new Image();
background_image_red.src = 'assets/img/virusBG_red.png';
background_image = background_image_green;
var timeBarImage = new Image();
timeBarImage.src = 'assets/img/time_bar.png'
var timeImage = new Image();
timeImage.src = 'assets/img/time.png'
var stop_game = false;
var timePercentage = 1;
var av_arr = [];
var greenCollected = 0;
var redMissed = 0;
var maxAV = 0;
var hit_sound_list = [];
var hit_sound_index = 0;
var hit_sound;
var miss_sound;
var miss_sound_list = [];
var miss_sound_index = 0;
var splat_sound;
var splat_sound_list = [];
var splat_sound_index = 0;
var notification_sound;
var hit_sound2;
var miss_sound2;
var splat_sound2;
var notification_sound2;
//Load the Antivirus counter image (image in the bottom right) to be used later
for (i = 0; i < 6; i++) {
	var av_count_image = new Image();
	av_count_image.src = 'assets/img/av_count_' + i + '.png';
	av_arr.push(av_count_image);
}

var pid;
var userData;
// copied from mail.js w/ canvas stuff gutted, we just want the PID
// this function really should be cleaned up by someone but for the sake of time we wont
function loadEverything() {
	console.log(cordova.file.dataDirectory);
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
		dir.getFile("info.json", { create: true }, function (file) {
			update_file = file;
			update_file.file(function (file) {
				var reader = new FileReader();
				reader.onload = function (e) {
					filedata = this.result;
					filedata = JSON.parse(filedata);
					userData = filedata;
					pid = filedata.PID;
				};
				reader.readAsText(file);
			}, fail);
		});
	});
}

function fail(err) {
	alert(err)
}

//Load all sounds for this game, called after the onclick event on the Play button
function loadAudio() {
	hit_sound = new Audio('assets/audio/hit.mp3');
	hit_sound.load();
	hit_sound_list.push(hit_sound);

	for (var i = 0; i < 4; i++) {
		hit_sound2 = hit_sound.cloneNode();
		hit_sound2.load();

		hit_sound_list.push(hit_sound2);

	}
	splat_sound = new Audio('assets/audio/virus_splat.mp3');
	splat_sound.load();
	splat_sound_list.push(splat_sound);

	for (var i = 0; i < 4; i++) {
		splat_sound2 = splat_sound.cloneNode();
		splat_sound2.load();
		splat_sound_list.push(splat_sound2);

	}
	miss_sound = new Audio('assets/audio/miss.mp3');
	miss_sound.load();
	miss_sound_list.push(miss_sound);
	for (var i = 0; i < 4; i++) {
		miss_sound2 = miss_sound.cloneNode();
		miss_sound2.load();
		miss_sound_list.push(miss_sound2);

	}
	notification_sound = new Audio('assets/audio/notification.mp3');
	notification_sound.load();
}

var spriteArr = [];
//Play button in the main splash screen
function playButton() {

	document.body.removeChild(document.getElementById("introContainer"));
	loadAudio();
	lastTime = Date.now()
	requestAnimationFrame(main);

}
//Back button in hte main splash screen
function back() {
	window.location.href = 'main.html' + location.search


}
//Function for animations
function sprite(options) {

	var self = this;

	this.context = options.context;
	this.imgWidth = options.image.width;
	this.imgHeight = options.image.height;
	this.img = options.image;
	this.frameIndex = 0,
		this.tickCount = 0,
		this.ticksPerFrame = options.ticksPerFrame || 0;
	this.numberOfFrames = options.numberOfFrames || 1;
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.width = options.width;
	this.height = options.height;


	this.render = function () {

		// Draw the animation
		self.context.drawImage(
			self.img,
			self.frameIndex * self.imgWidth / self.numberOfFrames,
			0,
			self.imgWidth / self.numberOfFrames,
			self.imgHeight,
			self.x,
			self.y,
			self.width,
			self.height);
	};

	this.update = function () {
		self.tickCount += 1;

		if (self.tickCount > self.ticksPerFrame) {

			self.tickCount = 0;
			// If the current frame index is in range
			if (self.frameIndex < self.numberOfFrames - 1) {
				// Go to the next frame
				self.frameIndex += 1;
			} else {
				spriteArr.splice(spriteArr.indexOf(self), 1)
			}
		}
	};
}


var virus_arr = [];
//This if ro Both green and Red objects, Type=1 is datachips, Type=2 is viruses
function virus(x, y, dx, dy, id, type, mod) {
	this.x = x;
	this.y = y;
	this.id = id;
	this.type = type
	this.width = (window.innerWidth / 10) * (Math.pow(1 + av_size_mod, mod));
	this.height = this.width;
	if (type == 1)
		this.img = virus_green_image
	else
		this.img = virus_red_image
	this.dx = dx * (Math.pow(1 + av_speed_mod, mod))
	this.dy = dy * (Math.pow(1 + av_speed_mod, mod))
}
//This is for the animation where the image goes into the vortex
function score_blob() {
	this.baseX = canvas.width - canvas.height * .2;
	this.baseY = 0;
	this.width = canvas.height * .2 / 4;
	this.height = this.width;
	this.img = key_image_arr[score - 1]
	this.dx;
	this.dy;
	this.currX;
	this.currY;


}
//download folder
function bucket() {
	this.x = canvas.width - canvas.height * .2;
	this.y = 0;
	this.size = canvas.height * .2;

}
//AV update button in the bottom right
function av_button() {
	this.x = canvas.width * .8;
	this.y = canvas.height * .89;
	this.size = canvas.height * .1;

}
var lastTime = Date.now();
//main game loop
function main() {
	if (!stop_game)
		requestAnimationFrame(main);
	update()
	lastTime = Date.now()
	render()

}

function update() {
	editObjects(Date.now() - lastTime);
	// Call the update function for all existing sprites
	for (var i = 0; i < spriteArr.length; i++) {
		spriteArr[i].update();
	}
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Draw Background
	ctx.drawImage(background_image, 0, 0, canvas.width, canvas.height)
	// Draw Viruses and Data
	for (var i = 0; i < virus_arr.length; i++) {
		var current = virus_arr[i];
		ctx.drawImage(current.img, current.x, current.y, current.width, current.height)

	}
	// Draw Bucket
	ctx.drawImage(data_bucket_image, bucket.x, bucket.y, bucket.size, bucket.size)
	// Draw Key Image
	for (var i = 0; i < score_arr.length; i++) {
		var current = score_arr[i];
		ctx.drawImage(score_image_arr[currentImage % totalImages][i], current.baseX + current.width * (i % 4), current.baseY + current.height * Math.floor(i / 4), current.width, current.height)

	}
	for (var i = 0; i < score_arr2.length; i++) {
		var current = score_arr2[i];
		ctx.drawImage(score_image_arr[previousImage % totalImages][i], current.currX, current.currY, current.width, current.height);
	}

	// Draw Update Counter
	ctx.drawImage(av_arr[av_counter], av_button.x, av_button.y, av_button.size, av_button.size)

	// Draw Time Bar
	ctx.drawImage(timeImage, canvas.width * .01, canvas.height * .01, (bucket.x - canvas.width * .01) * timePercentage, canvas.height * .05)
	ctx.drawImage(timeBarImage, canvas.width * .01, canvas.height * .01, bucket.x - canvas.width * .01, canvas.height * .05)


	// Draw currently held data
	if (held) {
		ctx.drawImage(held.img, held.x, held.y, held.width, held.height)
	}

	// Draw Sprites
	for (var i = 0; i < spriteArr.length; i++) {
		spriteArr[i].render();
	}
}
var currentID = 0;
var millisecondsPerVirus = 200;
var baseSpeed = 4000;
var millisecondsPerUpdate = 15000;
var av_open = false;
var av_update = false;
var av_update_counter = 0;
//For logicically moving objects in the game, also used for ending the game and bringing up the popup, called in update()
function editObjects(dt) {
	timeRemaining = timeRemaining - dt;
	timePercentage = timeRemaining / startTime;
	//end the game if time is up
	if (timeRemaining <= 0) {
		stop_game = true;
		resultsPopup(0)
	}
	//Flashing Red background
	if (virusEscapeTimer) {
		virusEscapeTimer = virusEscapeTimer - dt;
		if (virusEscapeTimer <= 0) {
			background_image = background_image_green;
			virusEscapeTimer = null;
		}
	}
	//See if any Datchips or Virsues have reached the edge of the screen
	for (var i = 0; i < virus_arr.length; i++) {
		var current = virus_arr[i];
		current.x = current.x + current.dx * dt;
		current.y = current.y + current.dy * dt;
		if (current.x > window.innerWidth || current.x + current.width < 0 || current.y > window.innerHeight || current.y + current.height < 0) {
			if (current.type == 2) {
				virusEscapeTimer = 200;
				redMissed = redMissed + 1;
				background_image = background_image_red;
				miss_sound_list[miss_sound_index % 5].play();
				miss_sound_index++;
				score_arr = score_arr.slice(0, score_arr.length - av_counter - 1);
				score = Math.max(0, score - (av_counter + 1));
			}
			virus_arr.splice(i, 1);
		}

	}
	//Moving image into the vortex
	for (var i = 0; i < score_arr2.length; i++) {
		score_arr2[i].currX = score_arr2[i].currX + score_arr2[i].dx * dt;
		score_arr2[i].currY = score_arr2[i].currY + score_arr2[i].dy * dt;
		if (score_arr2[i].currX < canvas.width * .45 && score_arr2[i].currY > canvas.height / 2)
			score_arr2.splice(i, 1);
	}
	if (Math.random() < (1 / millisecondsPerUpdate) * dt && av_counter < 5 && !av_update) {
		//increment update counter
		var notificationSprite = new sprite({
			context: canvas.getContext("2d"),
			image: notification_image,
			ticksPerFrame: 6,
			numberOfFrames: 5,
			x: av_button.x - av_button.size * .5,
			y: av_button.y - av_button.size * 1.5,
			width: av_button.size * 1.5,
			height: av_button.size * 1.5
		});
		spriteArr.push(notificationSprite);
		av_counter++;
		if (av_counter > maxAV)
			maxAV = av_counter;
		notification_sound.play();


		millisecondsPerUpdate = 15000;

	}
	else if (av_counter < 5 && !av_update) {
		millisecondsPerUpdate = millisecondsPerUpdate - dt;
	}
	//If you are updating your antivirus
	if (av_update) {
		av_update_counter = av_update_counter - dt;
		if (av_update_counter <= 0) {
			av_counter--;
			if (av_counter > 0) {
				av_update_counter = 1000
			}
			else {
				av_update = false;
				closeAntiVirusPopup();
			}
		}
	}
	//Randomly add a object be in green or red
	if (Math.random() * (virus_arr.length / 4 + 1) < (1 / millisecondsPerVirus) * dt) {
		var rnd = getRandomInt(0, 3);

		var xcoord;
		var ycoord;
		var deltaX;
		var deltaY
		if (rnd == 0) {
			xcoord = 0;
			deltaX = (window.innerWidth / baseSpeed) / 1.5 + (window.innerWidth / baseSpeed) * Math.random();
			ycoord = Math.random() * window.innerHeight;
			if (ycoord > window.innerHeight / 2)
				deltaY = -window.innerHeight / baseSpeed;
			else
				deltaY = window.innerWidth / baseSpeed
		} else if (rnd == 1) {
			ycoord = 0;
			deltaY = (window.innerHeight / baseSpeed) / 1.5 + (window.innerHeight / baseSpeed) * Math.random();
			xcoord = Math.random() * window.innerWidth;
			if (xcoord > window.innerWidth / 2)
				deltaX = -window.innerWidth / baseSpeed;
			else
				deltaX = window.innerWidth / baseSpeed;

		} else if (rnd == 2) {
			xcoord = window.innerWidth;
			deltaX = (-window.innerWidth / baseSpeed) / 1.5 + (-window.innerWidth / baseSpeed) * Math.random();
			ycoord = Math.random() * window.innerHeight;
			if (ycoord > window.innerHeight / 2)
				deltaY = -window.innerHeight / baseSpeed;
			else
				deltaY = window.innerWidth / baseSpeed

		} else if (rnd == 3) {
			ycoord = window.innerHeight;
			deltaY = (-window.innerHeight / baseSpeed) / 1.5 + (-window.innerHeight / baseSpeed) * Math.random();
			xcoord = Math.random() * window.innerWidth;
			if (xcoord > window.innerWidth / 2)
				deltaX = -window.innerWidth / baseSpeed;
			else
				deltaX = window.innerWidth / baseSpeed;

		}
		var rnd2 = getRandomInt(0, 20)
		var virus_type = 1

		if (rnd2 >= (19 - av_counter)) {
			virus_type = 2
			virus_arr.push(new virus(xcoord, ycoord, deltaX, deltaY, currentID, virus_type, av_counter))
		} else {
			virus_arr.push(new virus(xcoord, ycoord, deltaX, deltaY, currentID, virus_type, 0))
		}
		currentID++;

	}

}

var held;
var score = 0;
var imagesCollected = 0;
function touchStart(e) {
	for (j = 0; j < virus_arr.length; j++) {
		if (e.touches[0].pageX >= virus_arr[j].x - virus_arr[j].width / 2 && e.touches[0].pageX <= virus_arr[j].x + virus_arr[j].width * 1.5 && e.touches[0].pageY >= virus_arr[j].y - virus_arr[j].height / 2 && e.touches[0].pageY <= virus_arr[j].y + virus_arr[j].height * 1.5) {
			if (virus_arr[j].type == 1) {
				//picking up a green
				held = virus_arr[j];
				virus_arr.splice(j, 1);
			}
			else {
				//splating a red
				splat_sound_list[splat_sound_index % 5].play();
				splat_sound_index++;
				var virusSplatSprite = new sprite({
					context: canvas.getContext("2d"),
					image: virus_red_splat_image,
					ticksPerFrame: 6,
					numberOfFrames: 7,
					x: virus_arr[j].x,
					y: virus_arr[j].y,
					width: virus_arr[j].width,
					height: virus_arr[j].height * 3
				});
				spriteArr.push(virusSplatSprite);
				virus_arr.splice(j, 1);


			}


			return true;
		}
	}
	//clicked the av_update button
	if (e.touches[0].pageX >= av_button.x && e.touches[0].pageX <= av_button.x + av_button.size && e.touches[0].pageY >= av_button.y && e.touches[0].pageY <= av_button.y + av_button.size) {
		if (!av_open && av_counter > 0)
			antiVirusPopup();
	}

}
function touchEnd(e, kill) {
	if (held) {

		if (held.x + held.width / 2 >= bucket.x && held.x + held.width / 2 <= bucket.x + bucket.size && held.y >= bucket.y && held.y <= bucket.y + bucket.size) {
			score++;
			greenCollected = greenCollected + 1;
			score_arr.push(new score_blob());
			if (score == 16) {
				score = 0;

				imagesCollected++;
				for (var i = 0; i < score_arr.length; i++) {
					score_arr[i].currX = score_arr[i].baseX + score_arr[i].width * (i % 4);
					score_arr[i].currY = score_arr[i].baseY + score_arr[i].height * Math.floor(i / 4);
					score_arr[i].dx = (canvas.width * .35 - (score_arr[i].baseX + score_arr[i].width * (i % 4))) / 1000;
					score_arr[i].dy = (canvas.height / 2 - (score_arr[i].baseY + score_arr[i].height * Math.floor(i / 4))) / 1000
				}

				score_arr2 = score_arr;
				previousImage = currentImage;
				currentImage++;

				score_arr = [];
			}
			hit_sound_list[hit_sound_index % 5].play();
			hit_sound_index++;
		}
		else //just remove the object all together if it was called from the kill area in touchMove, don't put it back into the game
			if (!kill)
				virus_arr.push(held);
		held = null;
	}
}
function touchMove(e) {
	e.preventDefault();
	if (held) {
		held.x = e.touches[0].pageX - held.width / 2;
		held.y = e.touches[0].pageY - held.height / 2;
		//if it is near the edge,kill the object
		if (e.touches[0].pageX / canvas.width > .98)
			touchEnd(e, true);
	} else {
		for (j = 0; j < virus_arr.length; j++) {
			if (e.touches[0].pageX >= virus_arr[j].x - virus_arr[j].width / 2 && e.touches[0].pageX <= virus_arr[j].x + virus_arr[j].width * 1.5 && e.touches[0].pageY >= virus_arr[j].y - virus_arr[j].height / 2 && e.touches[0].pageY <= virus_arr[j].y + virus_arr[j].height * 1.5) {
				if (virus_arr[j].type == 1) {
					held = virus_arr[j];
					virus_arr.splice(j, 1);
				}
				return true;
			}
		}
	}
}
//for finding a vius in the array by id
function virusIndex(id) {
	for (var i = 0; i < virus_arr.length; i++) {
		if (virus_arr[i].id == id)
			return i;
	}
	return -1;

}
var av_frozen;
function antiVirusPopup() {
	var popup = document.createElement("div");
	popup.className = "popup";
	popup.style.top = getRandomInt(0, 70) + '%';
	var img = document.createElement("img");
	img.src = 'assets/img/virus_popup.png'
	img.className = "update";
	var div = document.createElement("div");
	div.style.position = "absolute";
	div.style.width = "100%";
	div.style.top = "50%";
	div.style.height = "50%";
	div.style.zIndex = "5";
	div.addEventListener("touchstart", antiVirusUpdate);
	popup.appendChild(div);
	popup.appendChild(img);
	document.body.appendChild(popup);
	av_open = true;
	av_frozen = av_counter;
}
var antivirus_update_id = 0;
function closeAntiVirusPopup() {
	antivirus_update_id++;
	results_arr2.push({
		"game_id": game_id,
		"antivirus_update_id": antivirus_update_id,
		"antivirus_counter": av_frozen,
		"data_chips": greenCollected,
		"viruses_missed": redMissed,
		"score": (16 * imagesCollected + score)
	});
	var popup = document.getElementsByClassName("popup")[0];
	popup.remove();
	av_open = false;

}
function antiVirusUpdate() {
	av_update_counter = 1000;
	av_update = true;
	var button = document.getElementsByClassName("update")[0];
	button.src = "assets/img/virus_popup2.gif?" + Date.now();
	button.onclick = null;

}

function resultsPopup(number) {
	var oldPopup = document.getElementsByClassName("finalPopup")[0]
	var oldDimmer = document.getElementsByClassName("dimmer")[0]
	if (oldPopup) {
		document.body.removeChild(oldPopup);
		document.body.removeChild(oldDimmer);
	}
	var dimmer = document.createElement("div");
	dimmer.className = "dimmer";
	document.body.appendChild(dimmer);
	var popup = document.createElement("div");
	popup.className = "finalPopup";
	var gameOver = document.createElement("div");
	gameOver.className = "gameOver";
	gameOver.innerHTML = "GAME OVER";
	popup.appendChild(gameOver);
	var missed = document.createElement("div");
	missed.className = "missed";
	if (number == 0)
		missed.innerHTML = "You Collected:";
	else if (number == 1)
		missed.innerHTML = "You Missed:";
	else
		missed.innerHTML = "Your AntiVirus Updates"
	var reason = document.createElement("div");
	reason.className = "reason";
	if (number == 0)
		reason.innerHTML = greenCollected + " DataChips";
	else if (number == 1)
		reason.innerHTML = redMissed + " Viruses";
	else
		reason.innerHTML = "You let your AntiVirus counter get to " + maxAV + ". Remember to keep your AntiVirus updated!"
	var next = document.createElement("button");
	next.className = "nextButton";
	next.innerHTML = "NEXT"
	next.addEventListener('touchend', function (event) {
		event.preventDefault();
		event.stopPropagation();
		if (number < 2) {
			resultsPopup(number + 1)
		} else {
			endingPopup();
		}
		return true;

	});
	popup.appendChild(missed)
	popup.appendChild(reason)
	popup.appendChild(next)
	document.body.appendChild(popup)
}
function endingPopup() {
	var oldPopup = document.getElementsByClassName("finalPopup")[0]
	var oldDimmer = document.getElementsByClassName("dimmer")[0]
	if (oldPopup) {
		document.body.removeChild(oldPopup);
		document.body.removeChild(oldDimmer);
	}
	var dimmer = document.createElement("div");
	dimmer.className = "dimmer";
	document.body.appendChild(dimmer);
	var popup = document.createElement("div");
	popup.className = "finalPopup";
	var gameOver = document.createElement("div");
	gameOver.className = "gameOver";
	gameOver.innerHTML = "GAME OVER";
	popup.appendChild(gameOver);
	var missedContainer = document.createElement("div");
	missedContainer.className = "finalScoreContainer";

	var missed = document.createElement("span");
	missed.className = "finalScore";
	missed.innerHTML = "Final Score: " + (16 * imagesCollected + score);
	missedContainer.appendChild(missed)
	// var next = document.createElement("button");
	// next.innerHTML = "Play Again"
	// next.className = "restart";
	// next.addEventListener('touchend', function(event){
	// 						event.preventDefault();
	// 						event.stopPropagation();
	// 						// Add HTTP Request
	// 						if (!disableClick) {
	// 							disableClick = true;
	// 							var xhttp = new XMLHttpRequest();
	// 							xhttp.open("GET", "http://cybersafegames.unc.edu/virus_results_add.php?pid=" + pid + "&json_data=" + encodeURIComponent(JSON.stringify(results_arr2)), true);
	// 							xhttp.send();
	// 						}
	// 						restartGame();
	// 						return true;

	// 						});
	var mainMenu = document.createElement("button");
	mainMenu.innerHTML = "Main Menu"
	mainMenu.className = "nextButton";
	mainMenu.addEventListener('touchend', function (event) {
		event.preventDefault();
		event.stopPropagation();
		// Add HTTP Request
		if (!disableClick) {
			disableClick = true;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (xhttp.readyState == 4) {
					if (xhttp.status == 200) {
						window.location.href = 'main.html'
					} else {
						alert(xhttp.status);
					}
				}
			};
			console.log(userData);
			xhttp.open("GET", "http://cybersafegames.unc.edu/virus_results_add.php"
				+ "?pid=" + userData.PID
				+ "&program=" + userData.program
				+ "&classyear=" + userData.classyear
				+ "&gender=" + userData.gender
				+ "&age=" + userData.age
				+ "&english=" + userData.english
				+ "&json_data=" + encodeURIComponent(JSON.stringify(results_arr2)), true);
			xhttp.send();
		}
		return true;
	});
	popup.appendChild(missedContainer);
	// popup.appendChild(next);
	popup.appendChild(mainMenu);
	document.body.appendChild(popup)
}
function restartGame() {
	disableClick = false;
	console.log(disableClick);
	var oldPopup = document.getElementsByClassName("finalPopup")[0]
	var oldDimmer = document.getElementsByClassName("dimmer")[0]
	if (oldPopup) {
		document.body.removeChild(oldPopup);
		document.body.removeChild(oldDimmer);
	}
	virus_arr = [];
	score_arr = [];
	score_arr2 = [];
	held = null;
	greenCollected = 0;
	redMissed = 0;
	maxAV = 0;
	score = 0;
	imagesCollected = 0;
	timeRemaining = startTime;
	if (av_open) {
		closeAntiVirusPopup();
	}
	av_counter = 0;
	stop_game = false;
	lastTime = Date.now();
	results_arr2 = [];
	main();
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
