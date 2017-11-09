function begin() {
	document.getElementById("background").onclick = play;
	var tap = document.getElementsByClassName("tapAnywhere")[0]
	tap.style.display = "block";
}
var popup;
var body;
var app = {


	initialize: function () {
		this.bindEvents();

	},

	bindEvents: function () {
		document.addEventListener('deviceready', this.onDeviceReady, false);

	},

	onDeviceReady: function () {
		//load all the files we are going to need
		window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
			dir.getFile("info.json", { create: true }, function (file) {
				update_file = file;
				dir.getFile("whack_questions.json", { create: true }, function (file) {
					questions_file = file;
					dir.getFile("mail_questions.json", { create: true }, function (file) {
						mail_questions_file = file;

						window.onerror = function (msg, url, linenumber) {
							alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
							return true;
						}
						popup = document.createElement("div");
						popup.className = "popup";
						var headerContainer = document.createElement("div");
						headerContainer.className = "popupHeader";
						var header = document.createElement("span");
						header.innerHTML = "Checking For Updates";

						headerContainer.appendChild(header);
						popup.appendChild(headerContainer);

						bodyContainer = document.createElement("div");
						bodyContainer.className = "popupBody";
						body = document.createElement("span")
						body.innerHTML = "Checking...";
						bodyContainer.appendChild(body);
						popup.appendChild(bodyContainer);
						document.body.appendChild(popup);

						checkForUpdates();

					});
				});
			});
		}, function (error) { alert("failed"); });
	}

};
var questions_file;
var mail_questions_file;
var update_file;

function play() {
	window.location.href = 'main.html'

}

function checkForUpdates() {

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {

		if (xhttp.readyState == 4 && xhttp.status == 200) {
			//connected to the update page and seeing if we need to run a download
			var updateData = JSON.parse(xhttp.responseText);

			var mail_date
			var whack_date
			if (updateData[0].type == "MAIL") {

				mail_date = new Date(updateData[0].date)
				whack_date = new Date(updateData[1].date)
			} else {
				whack_date = new Date(updateData[0].date)
				mail_date = new Date(updateData[1].date)
			}

			update_file.file(function (file) {
				var reader = new FileReader();
				reader.onload = function (e) {
					filedata = this.result;
					update_file.createWriter(function (fileWriter) {
						//if the PID has been written before
						if (filedata.length > 0) {
							var jsonObject = JSON.parse(filedata);
							var last_update = new Date(jsonObject.updated);


							if (mail_date < last_update || true) {
								body.innerHTML = "Downloading..."
								writeMailQuestionsToFile()
							}
							else {
								mail_done = true;
								checkDone();
							}
							if (whack_date < last_update || true) {
								body.innerHTML = "Downloading..."
								writeWhackQuestionsToFile()
							}
							else {
								whack_done = true
								checkDone();
							}

						} else { //If we need a new PID
							var PID = ""
							while (PID === null || PID.length < 9) {
								PID = prompt("Please enter your PID");
							}
							var data = {
								PID: PID,
								program: programDialog(),
								classyear: classyearDialog(),
								gender: genderDialog(),
								age: ageDialog(),
								english: englishDialog(),
								updated: Date.now()
							}
							console.log(data)
							fileWriter.write(JSON.stringify(data));
							body.innerHTML = "Downloading..."
							writeMailQuestionsToFile()
							writeWhackQuestionsToFile()

						}
					})
				};
				reader.readAsText(file);
			}, fail);

		}
	};
	xhttp.open("GET", "http://cybersafegames.unc.edu/update_data.php", true);
	xhttp.send();

}
var whack_done = false
var mail_done = false

function makeButton(text) {
	var button = document.createElement('button');
	button.innerHTML = text;
	button.className = 'nextButton';
	return button;
}

function programDialog() {
	// var program = '';

	// var dialog = document.createElement('div');
	// dialog.className = 'dialog';

	// var buttons = ['BSBA', 'MAC', 'MBA']
	// buttons.forEach(x => {
	// 	var button = makeButton(x);
	// 	button.addEventListener('touchend', () => {
	// 		program = x;
	// 		popup.removeChild(dialog);			
	// 	});
	// 	dialog.appendChild(button);
	// });

	// document.body.appendChild(dialog);	

	// return program
	var program = '';
	while (
		program === null || (
			program !== 'BSBA' && program !== 'bsba'
			&& program !== 'MBA' && program !== 'mba'
			&& program !== 'MAC' && program !== 'mac'
		)
	) {
		program = prompt("Your Program (BSBA or MBA or MAC)")
	}
	return program.toUpperCase()
}

function classyearDialog() {
	var classyear = '';
	while (classyear === null || classyear.length < 4) {
		classyear = prompt("Your Class Year");
	}
	return parseInt(classyear)
}

function genderDialog() {
	// var gender = '';

	// var dialog = document.createElement('div');
	// dialog.className = 'dialog';

	// var buttons = ['M', 'F']
	// buttons.forEach(x => {
	// 	var button = makeButton(x);
	// 	button.addEventListener('touchend', () => {
	// 		gender = x;
	// 		document.body.removeChild(dialog);			
	// 	});
	// 	dialog.appendChild(button);
	// });

	// document.body.appendChild(dialog);	

	// return gender
	var gender = 'none';
	while (
		gender === null || (
			gender !== 'M' && gender !== 'm'
			&& gender !== 'F' && gender !== 'f'
			&& gender !== ''
		)
	) {
		gender = prompt("Optional: gender (F or M or leave blank)");
	}
	return gender == '' ? 'blank' : gender.toUpperCase();
}

function ageDialog() {
	// var age = 0;

	// var dialog = document.createElement('div');
	// dialog.className = 'dialog';

	// var buttons = ['<18', '18-22', '>22']
	// buttons.forEach(x => {
	// 	var button = makeButton(x);
	// 	button.addEventListener('touchend', () => {
	// 		if (x === '<18')
	// 			age = 1;
	// 		else if (x === '18-22')
	// 			age = 2;
	// 		else if (x === '>22')
	// 			age = 3;
	// 		document.body.removeChild(dialog);
	// 	});
	// 	dialog.appendChild(button);
	// });

	// document.body.appendChild(dialog);		

	// return age;
	var age = 0;
	while (age === null || (age !== 1 && age !== 2 && age !== 3)) {
		age = parseInt(prompt("Enter age group as: 1 (if <18), 2 (if 18-22), 3 (if >22)"))
	}
	return age;
}

function englishDialog() {
	// var english = '';

	// var dialog = document.createElement('div');
	// dialog.className = 'dialog';

	// var buttons = ['Y', 'N']
	// buttons.forEach(x => {
	// 	var button = makeButton(x);
	// 	button.addEventListener('touchend', () => {
	// 		english = x;
	// 		document.body.removeChild(dialog);			
	// 	});
	// 	dialog.appendChild(button);
	// });

	// document.body.appendChild(dialog);	

	// return english
	var english = '';
	while (
		english === null || (
			english !== 'Y' && english !== 'y'
			&& english !== 'N' && english !== 'n'
		)
	) {
		english = prompt("Native English speaker? (Y or N)");
	}
	return english.toUpperCase();
}


function writeWhackQuestionsToFile() {
	var filedata

	questions_file.file(function (file) {

		var reader = new FileReader();
		reader.onload = function (e) {

			filedata = this.result;
			questions_file.createWriter(function (fileWriter) {

				fileWriter.truncate(0);

				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function () {
					if (xhttp.readyState == 4 && xhttp.status == 200) {
						fileWriter.write(xhttp.responseText);
						whack_done = true;
						checkDone();
					}
				};
				xhttp.open("GET", "http://cybersafegames.unc.edu/whack_data.php", true);
				xhttp.send();


			}, fail);
		};
		reader.readAsText(file);
	}, fail);

}

function writeMailQuestionsToFile() {
	var filedata
	mail_questions_file.file(function (file) {
		var reader = new FileReader();
		reader.onload = function (e) {
			filedata = this.result;
			mail_questions_file.createWriter(function (fileWriter) {
				fileWriter.truncate(0);


				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function () {
					if (xhttp.readyState == 4 && xhttp.status == 200) {

						fileWriter.write(xhttp.responseText);
						mail_done = true;
						checkDone();
					}
				};
				xhttp.open("GET", "http://cybersafegames.unc.edu/mail_data.php", true);
				xhttp.send();


			}, fail);
		};
		reader.readAsText(file);
	}, fail);

}
//see if both write whack and write mail has been run
function checkDone() {
	if (whack_done && mail_done) {
		document.body.removeChild(popup);
		begin()
	}

}

function fail(err) {
	alert(err)
}
app.initialize();