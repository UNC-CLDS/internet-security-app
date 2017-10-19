var app = {

  
    initialize: function() {
        this.bindEvents();
			
	},

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		
    },

    onDeviceReady: function() {
        setTimeout(loadEverything,1000);
		
    },

};
var results_file;
var questions_file;
var baseDelay = 5000
var lastTime;
var mailCounter = 0;
var secondsPerMail = 4;
var time = (secondsPerMail - 1) * 1000;
var bgImage = new Image();
bgImage.src = 'assets/img/emailBG.png';
var baseSpeed = 4500;
var delta = window.innerHeight / baseSpeed;
var mailOpen = false;
var correct_answer;
var score = 0;
var game_id = 1;
var spamBase = 0;
var update_file;
var pid;
var spamFilter = 0;
var stop_game = false;
var results_arr = [];
var results_arr2 = [];
var disableClick = false;
var mailImage = new Image();
mailImage.src = 'assets/img/mail.png';
var explosionImage = new Image();
explosionImage.src = 'assets/img/explosion.png';
var acceptPhishImage = new Image();
acceptPhishImage.src = 'assets/img/accept_phish.png';
var acceptAccountImage = new Image();
acceptAccountImage.src = 'assets/img/accept_account.png';
var acceptVirusImage = new Image();
acceptVirusImage.src = 'assets/img/accept_virus.png';
var rejectTeachImage = new Image();
rejectTeachImage.src = 'assets/img/reject_teach.png';
var rejectJobImage = new Image();
rejectJobImage.src = 'assets/img/reject_job.png';
var rejectFamilyImage = new Image();
rejectFamilyImage.src = 'assets/img/reject_family.png';
var rejectAccountImage = new Image();
rejectAccountImage.src = 'assets/img/reject_account.png';
var spamUpImage = new Image();
spamUpImage.src = 'assets/img/spam_up.png';
var scoreUpImage = new Image();
scoreUpImage.src = 'assets/img/score_up.png';

// Initiate mail array
var mailArr = []
for(i=0;i<3;i++){
    mailArr[i] = [];
}
var spriteArr = [];

function loadEverything(){
window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
            dir.getFile("info.json", {create:true}, function(file) {
                        update_file = file;
			dir.getFile("mail_questions.json", {create:true}, function(file) {
				questions_file = file;
				questions_file.file(function(file) {
				var reader = new FileReader();
				reader.onload = function(e) {
					filedata=this.result;
                    jsonObject = JSON.parse(filedata);
					update_file.file(function(file) {
                                        var reader = new FileReader();
                                        reader.onload = function(e) {
                                            
                                            filedata=this.result;
                                                     filedata = JSON.parse(filedata);
                                                     
                                            pid = filedata.PID;
                                                     canvas.addEventListener("touchstart",touchStart);
													 document.getElementsByClassName('back')[0].style.display = "block";
													 document.getElementsByClassName('play')[0].style.display = "block";
                                    document.getElementsByClassName('back')[0].onclick = back;
									document.getElementsByClassName('play')[0].onclick = play;
                                                     };
                                    reader.readAsText(file);
                                    }, fail);
                                    

				};
				reader.readAsText(file);
			}, fail);
			});
			});
        
	});

}
function play(){
	
    document.body.removeChild(document.getElementById("introContainer"));
	
	lastTime = Date.now()
	
	main();
	
    
}

function back(){
    window.location.href = 'main.html' + location.search
    
    
}
function mailTypeByInt(type){
	if (type ==0)
		return "Teacher Email";
	else if (type == 1)
		return "Job Email";
	else if (type == 2)
		return "Family Email";
	else if (type == 3)
		return "Account Security Email";
	else if (type == 4)
		return "Phishing Email";
	else if (type == 5)
		return "Fake Acc. Security Email";
	else if (type == 6)
		return "Virus Email";
	else if (type == 7)
		return "Spam";
}
// For sprite animations
function sprite(options){
    
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
    this.virus = options.virus;

    
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
            }else{
                // Remove sprite from array
                spriteArr.splice(spriteArr.indexOf(self),1)
                if (self.virus){
                    gameOver();
                }
            }
        }
    };
}

// Mail object
function mail(pos, text, type, sub,to,from,attach,id,message){
	this.x = pos * window.innerWidth/3;
	this.y = 0;
    this.width = window.innerWidth/3;
    this.height = window.innerHeight/8;
	this.img = mailImage;
    this.text = text;
    this.type = type;
    this.subject = sub;
	this.message=message; //wrong message showed in results
    this.delay = null;
    this.spamCheck = false;
	this.to = to;
	this.from=from;
	this.attach=attach;
	this.id = id
}

// Keeps track of spam filter
function changeSpam(diff){
    if (spamBase + diff <= 0){
        spamBase = 0;
    }else{
        spamBase = spamBase + diff;
    }
    // 70% of spam mails blocked at max, takes about 5 spams to get filter up to half of that
    spamFilter = parseFloat((0.7*(spamBase/(spamBase+5))).toFixed(2))
    
}

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.position = "absolute";
document.body.appendChild(canvas)


function gameOver(){
    stop_game = true;
	if (results_arr.length > 0){
    resultsPopup(0);
	}
	else{
		endingPopup();
	}
}
function playMedia(src) {
    
    // Android needs the search path explicitly specified
    if (navigator.userAgent.match(/Android/i) == "Android") {
        src = '/android_asset/www/' + src;
    }
    
    var mediaRes = new Media(src,
                             function onSuccess() {
                             // release the media resource once finished playing
                             mediaRes.release();
                             },
                             function onError(e){
                             console.log("error playing sound: " + JSON.stringify(e));
                             });
    mediaRes.play();
    
}

function scoreDown(){
    correct_answer = 0;
    score = score - 200;
    playMedia("assets/audio/miss.mp3");
}
function scoreUp(){
    correct_answer = 1;
    score = score + 100;
    playMedia("assets/audio/hit.mp3");
}
function closeMail(choice){
    // Default correct_answer is -1 or NULL
    correct_answer = -1;
    switch (choice){
        case 0: //accept
            if (openMail.type >= 0 && openMail.type <= 3){ //good mails
                scoreUp();
                var scoreUpSprite = new sprite({
                                               context: canvas.getContext("2d"),
                                               image: scoreUpImage,
                                               ticksPerFrame: 3,
                                               numberOfFrames: 12,
                                               x: canvas.width*1/10,
                                               y: document.getElementsByClassName("reject")[0].offsetTop,
                                               width: canvas.width/4,
                                               height: canvas.width/4});
                spriteArr.push(scoreUpSprite);
                openMail.img = explosionImage;
            }
			else
			{
				results_arr.push({"type":openMail.type,"wrong_message":openMail.message});
			}
            if (openMail.type == 4){ //bad mail phish
                scoreDown();
                changeSpam(-2);
                openMail.img = acceptPhishImage;
            }
            if (openMail.type == 5){ //bad mail fake acct
                scoreDown();
                openMail.img = acceptAccountImage;
                // Makes "permanant" block, so has different delay than other explosions
                openMail.delay = 999999;
                var popup = document.getElementsByClassName("popup")[0];
                popup.parentNode.removeChild(popup);
                mailOpen = false;
                return;
            }
            if (openMail.type == 6){ //bad mail Virus
                correct_answer = 0;
                var virusSprite = new sprite({
                                            context: canvas.getContext("2d"),
                                            image: acceptVirusImage,
                                            ticksPerFrame: 10,
                                            numberOfFrames: 10,
                                            width: canvas.width,
                                            height: canvas.width,
                                            virus: true});
                spriteArr.push(virusSprite);
                playMedia("assets/audio/power_down.mp3")
                openMail.img = explosionImage;
            }
            
            if (openMail.type == 7){ //spam mail
                // Technically a wrong answer, but sometimes accepting Spam is ok, so no loss of points
                playMedia("assets/audio/miss.mp3");
                changeSpam(-2);
                openMail.img = explosionImage;
            }
            break;
        case 1:  //reject
            if (openMail.type == 0){ //good mail teacher
                scoreDown();
                openMail.img = rejectTeachImage;
            }
            if (openMail.type == 1){ //good mail job
                scoreDown();
                openMail.img = rejectJobImage;
            }
            if (openMail.type == 2){ //good mail family
                scoreDown();
                openMail.img = rejectFamilyImage;
            }
            if (openMail.type == 3){ //good mail account
                scoreDown();
                openMail.img = rejectAccountImage;
            }
            if (openMail.type >= 4 && openMail.type <= 6){ //bad mail
                scoreUp();
                var scoreUpSprite = new sprite({
                                              context: canvas.getContext("2d"),
                                              image: scoreUpImage,
                                              ticksPerFrame: 3,
                                              numberOfFrames: 12,
                                              x: canvas.width*2/5,
                                              y: document.getElementsByClassName("reject")[0].offsetTop,
                                              width: canvas.width/4,
                                              height: canvas.width/4});
                spriteArr.push(scoreUpSprite);
                openMail.img = explosionImage;
            }
			else{
				results_arr.push({"type":openMail.type,"wrong_message":openMail.message});
			}
            if (openMail.type == 7){ //spam mail
                // Technically correct, but no points awarded
                playMedia("assets/audio/hit.mp3");
                openMail.img = explosionImage;
            }
            break;
        case 2: //spam
            if (openMail.type == 0){ //good mail teacher
                scoreDown();
                changeSpam(-1);
                openMail.img = rejectTeachImage;
            }
            if (openMail.type == 1){ //good mail job
                scoreDown();
                changeSpam(-1);
                openMail.img = rejectJobImage;
            }
            if (openMail.type == 2){ //good mail family
                scoreDown();
                changeSpam(-1);
                openMail.img = rejectFamilyImage;
            }
            if (openMail.type == 3){ //account
                scoreDown();
                changeSpam(-1);
                openMail.img = rejectAccountImage;
            }
            if (openMail.type >= 4 && openMail.type <= 6){ //bad mail
                // Technically a correct choice, but no points awarded
                playMedia("assets/audio/hit.mp3");
                openMail.img = explosionImage;
            }
            if (openMail.type == 7){ //spam mail
                scoreUp();
                changeSpam(1);
				
                var spamUpSprite = new sprite({
                                            context: canvas.getContext("2d"),
                                            image: spamUpImage,
                                            ticksPerFrame: 3,
                                            numberOfFrames: 12,
                                            x: canvas.width*7/10,
                                            y: document.getElementsByClassName("reject")[0].offsetTop,
                                            width: canvas.width/4,
                                            height: canvas.width/4});
                spriteArr.push(spamUpSprite);
                openMail.img = explosionImage;
            }
			else
				results_arr.push({"type":openMail.type,"wrong_message":openMail.message});
            
            break;
    }
    results_arr2.push({"id":openMail.id,"selected":choice,"game_id":game_id,"score":score,"correct_answer":correct_answer});    
    openMail.delay = 400;
    //destroy mail
    var popup = document.getElementsByClassName("popup")[0];
    popup.parentNode.removeChild(popup);
    mailOpen = false;
}
var openMail = null;
var trackingClick = false;
var targetElement = null;
var touchStartX = 0;
var touchStartY = 0;

// Create the open mail popup
function touchStart(e){

        if (mailOpen == false){
		
			for(j=0;j<mailArr.length;j++){
                    for(k=0;k<mailArr[j].length;k++){
				        if(e.touches[0].pageX >= mailArr[j][k].x && e.touches[0].pageX <= mailArr[j][k].x + mailArr[j][k].width && e.touches[0].pageY >= mailArr[j][k].y && e.touches[0].pageY <= mailArr[j][k].y + mailArr[j][k].height && mailArr[j][k].img == mailImage){
                            
                            openMail = mailArr[j][k]

                            
                            var popup = document.createElement("div");
                            popup.className = "popup";
                            
                            var scrollingBody = document.createElement("div");
                            scrollingBody.className = "scrollingBody";
                            
                            var to = document.createElement("div");
                            to.className = "to";
                            to.innerHTML = "<b>To:&nbsp;</b>" +openMail.to;
                            
                            var from = document.createElement("div");
                            from.className = "from";
                            from.innerHTML = "<b>From:&nbsp;</b>" + openMail.from;
                            
                            var subject = document.createElement("div");
                            subject.className = "subject";
                            subject.innerHTML = "<b>Subject:&nbsp;</b>" + openMail.subject;
                            
                            var body = document.createElement("div");
                            body.className = "mailBody";
                            body.innerHTML = mailArr[j][k].text;
                            
                            popup.appendChild(scrollingBody);
                            scrollingBody.appendChild(to);
                            scrollingBody.appendChild(from);
                            scrollingBody.appendChild(subject);
                            if (openMail.attach != ""){
                                var attach = document.createElement("div");
                                attach.className = "attach";
                                attach.innerHTML = "<b>Attachments:&nbsp;</b>" + openMail.attach;
                                scrollingBody.appendChild(attach);
                            }
                            scrollingBody.appendChild(body);
                      
                            var buttonRow = document.createElement("div");
                            buttonRow.className = "buttonRow";
                            
                            var button1 = document.createElement("div");

                            var button2 = document.createElement("div");

                            var button3 = document.createElement("div");
                            
                            popup.appendChild(buttonRow);
                            buttonRow.appendChild(button1);
                            buttonRow.appendChild(button2);
                            buttonRow.appendChild(button3);

                                                var accept = document.createElement("img");
                                                accept.src = "assets/img/accept_button.png";
                            
                            
                                                accept.addEventListener('touchstart', function(event){
                                                                        event.preventDefault();
                                                                        event.stopPropagation();

                                                                        trackingClick = true;
                                                                        targetElement = event.target;
                                                                        touchStartX = event.targetTouches[0].pageX;
                                                                        touchStartY = event.targetTouches[0].pageY;
                                                                        closeMail(0);
                                                                        return true;

                                                                        });
                                                button1.appendChild(accept)
                            
                                                var reject = document.createElement("img");
                                                reject.className = "reject"
                                                reject.src = "assets/img/reject_button.png";
                                                reject.addEventListener('touchstart', function(event){
                                                                        event.preventDefault();
                                                                        event.stopPropagation();
                                                                        trackingClick = true;
                                                                        targetElement = event.target;
                                                                        touchStartX = event.targetTouches[0].pageX;
                                                                        touchStartY = event.targetTouches[0].pageY;
                                                                        closeMail(1);
                                                                        return true;

                                                    });
                                                button2.appendChild(reject)
                            
                                                var spam = document.createElement("img");
                                                spam.src = "assets/img/spam_button.png";
                                                spam.addEventListener('touchstart', function(event){
                                                                      event.preventDefault();
                                                                      event.stopPropagation();

                                                                      trackingClick = true;
                                                                      targetElement = event.target;
                                                                      touchStartX = event.targetTouches[0].pageX;
                                                                      touchStartY = event.targetTouches[0].pageY;
                                                                      closeMail(2);
                                                                      return true;

                                                    });
                                                button3.appendChild(spam)
                            
                                                document.body.appendChild(popup)
                                                mailOpen = true;

                        }
                    }
			}
		
        }
}

function main (){
    if (!stop_game){
        requestAnimationFrame(main)
    }
    update()
	lastTime = Date.now()
	render()
}

function update(){
    // Update all the things
    editObjects(Date.now() - lastTime)
    // Call the update function for all existing sprites
    for(var i = 0;i < spriteArr.length;i++){
        spriteArr[i].update();
    }
    // If there is a row with 8 mails, end game
    for(i=0;i<mailArr.length;i++){
        if(mailArr[i].length > 7){
            gameOver();
        }
    }
}

function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage,0,0,window.innerWidth,window.innerHeight)
    
    for(i=0; i < mailArr.length; i++){
        for(j=0; j<mailArr[i].length;j++){
            ctx.drawImage(mailArr[i][j].img,mailArr[i][j].x,mailArr[i][j].y,mailArr[i][j].width, mailArr[i][j].height)
        }
    }
    ctx.font = "24pt Ariel"
    ctx.textAlign="left";
    ctx.strokeText("Score: " + score,10,45);
    ctx.fillText("Score: " + score,10,45);
    
    for(var i = 0;i < spriteArr.length;i++){
        spriteArr[i].render();
    }
    
}

function editObjects(dt){
    time = time + dt
    
    if (time >= secondsPerMail * 1000) {
        time = 0;
        mailCounter = mailCounter + 1;
        
        // Create new mail and push it to mailArr in a random column
        var randomMail = getRandomInt(0,jsonObject.length -1)
        var randomColumn = Math.floor(Math.random() * 3)
        mailArr[randomColumn].push(new mail(randomColumn, jsonObject[randomMail].mail_body,jsonObject[randomMail].mail_type,jsonObject[randomMail].mail_subject,jsonObject[randomMail].mail_to,jsonObject[randomMail].mail_from,jsonObject[randomMail].mail_attachments,jsonObject[randomMail].id,jsonObject[randomMail].wrong_message))
        
    }
    if (mailCounter == 5 && secondsPerMail > 1){
        mailCounter = 0;
        secondsPerMail = secondsPerMail - 0.5;
    }
    for (i=0;i<3;i++){
        
        // Spam filter action
        for (j=0;j<mailArr[i].length;j++){
            if (mailArr[i][j].spamCheck == false){
                var check = getRandomInt(1,100)
                if (check/100 <= spamFilter){
                    mailArr[i][j].img = explosionImage;
                    mailArr[i][j].delay = 400;
                }
                mailArr[i][j].spamCheck = true;
            }
            
            // If mail has a delay, it must be an explosion-like image, so increment delay counter
            if (mailArr[i][j].delay != null){
                mailArr[i][j].delay = mailArr[i][j].delay - dt
                
                // If the delay runs out, remove the object from mailArr
                if(mailArr[i][j].delay <= 0){
                    mailArr[i][j].delay = null;
                    mailArr[i].splice(j,1)
                    return;
                }
            }
            // Move all existing mails down, unless they are touching another mail
            // Falling Speed based on delta and baseSpeed
            if(mailArr[i][j].y <= window.innerHeight - (j+1)*window.innerHeight/8){
                mailArr[i][j].y = Math.min(mailArr[i][j].y + delta*dt, window.innerHeight - (j+1)*window.innerHeight/8);
            }
            
        }
    }
}

// I don't think we use this but at this point I'm afraid to delete anything
if (!Array.prototype.last){
      Array.prototype.last = function(){
                return this[this.length - 1];
                    };
};
function resultsPopup(number){
	var oldPopup = document.getElementsByClassName("finalPopup")[0]
	var oldDimmer = document.getElementsByClassName("dimmer")[0]
	if(oldPopup){
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
	missed.innerHTML = "You Missed a " + mailTypeByInt(results_arr[number].type);  
	var reason = document.createElement("div");
	reason.className = "reason";			 
	reason.innerHTML = results_arr[number].wrong_message; 
	var next = document.createElement("button");
	next.className = "nextButton";
	next.innerHTML = "NEXT"
	next.addEventListener('touchend', function(event){
							event.preventDefault();
							event.stopPropagation();
							if (number < results_arr.length - 1){
								resultsPopup(number +1)
							} else{
								endingPopup();							
							}
							return true;

							});
	popup.appendChild(missed)
	popup.appendChild(reason)
	popup.appendChild(next)
	document.body.appendChild(popup)
	
}
// The end game popup that appears after the results popup
// If MainMenu is pressed, then the results are pushed to the database
function endingPopup(){
    var oldPopup = document.getElementsByClassName("finalPopup")[0]
    var oldDimmer = document.getElementsByClassName("dimmer")[0]
    if(oldPopup){
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
    missed.innerHTML = "Final Score: " + score;
    missedContainer.appendChild(missed)
    var next = document.createElement("button");
    next.innerHTML = "Play Again"
    next.className = "restart";
    next.addEventListener('touchend', function(event){
                          event.preventDefault();
                          event.stopPropagation();
                          restartGame();
                          return true;
                          
                          });
    var mainMenu = document.createElement("button");
    mainMenu.innerHTML = "Main Menu"
    mainMenu.className = "mainMenu";
    mainMenu.addEventListener('touchend', function(event){
                              event.preventDefault();
                              event.stopPropagation();
							  
                            
							if (!disableClick){
							 disableClick=true;
								var xhttp = new XMLHttpRequest();
								
								xhttp.onreadystatechange = function() {

								if (xhttp.readyState == 4 && xhttp.status == 200) {
									window.location.href = 'main.html'
									
								}
								};
							
								xhttp.open("GET", "http://cybersafegames.unc.edu/mail_results_add.php?pid=" + pid + "&json_data=" + encodeURIComponent(JSON.stringify(results_arr2)), true);
								
								xhttp.send();

							}
							
                              return true;
                              });
    popup.appendChild(missedContainer)
    popup.appendChild(next)
    popup.appendChild(mainMenu);
    document.body.appendChild(popup)
}

// Resets all of the variables in the game in preparation for a new start
// Removes any popups
function restartGame(){
    var oldPopup = document.getElementsByClassName("finalPopup")[0]
    var oldDimmer = document.getElementsByClassName("dimmer")[0]
    if(oldPopup){
        document.body.removeChild(oldPopup);
        document.body.removeChild(oldDimmer);
    }
    mailArr = [];
    for(i=0;i<3;i++){
        mailArr[i] = [];
    }
    spriteArr = [];
    mailCounter = 0;
	game_id = game_id +1;
    secondsPerMail = 4;
	results_arr = [];
    time = (secondsPerMail - 1) * 1000;
    if (mailOpen){
        var popup = document.getElementsByClassName("popup")[0];
        popup.parentNode.removeChild(popup);
        mailOpen = false;
        openMail = null;
    }
    score = 0;
    stop_game = false;
    lastTime = Date.now()
    main();
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function fail(err){
	alert(err)
}


app.initialize();
