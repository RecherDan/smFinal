var mraa = require('mraa'); //require mraa
var sleep = require('sleep'); //require sleep libary to delay between commands
var net = require('net'); // require net for open server.
var exec = require('child_process').exec;

// pins definitions
var AlarmPin = new mraa.Gpio(10); //setup digital pin to make the steps in the stepper motor
var LightsPin=new mraa.Gpio(9); //setup digital pin to make direction of the rotation of the stepper motor 1(clockwise) 0 (anti clockwise) 
AlarmPin.dir(mraa.DIR_OUT); //set the gpio direction to output
LightsPin.dir(mraa.DIR_OUT); //set the gpio direction to output

//global definitions
var ModeSaver = "Off";


function runcommand(command) {
	exec(command, function(error, stdout, stderr) {
  		console.log('stdout: ' + stdout);
   		console.log('stderr: ' + stderr);
    	if (error !== null) {
   		     console.log('exec error: ' + error);
  		  }
		});
}

// this function used for printing door status to the screen
function PrintDoorStatus(MSG) {
	// TODO: command to screen!
	console.log(MSG);
}

function setAlarmBT(Mode) {
	runcommand('python /home/root/smartdoor/scripts/blueArduinoCommand ' + (Mode == "On" ? "1" : "0"));
}
function setSoundAlarm(Mode) {
	//TODO: check if it's work.
	if ( Mode == "On")
		AlarmPin.write(1);
	else
		AlarmPin.write(0);
	
}
function setSoundLights(Mode) {
	//TODO: check if it's work.
	if ( Mode == "On")
		LightsPin.write(1);
	else
		LightsPin.write(0);
	
}

function setAlarm(Mode) {
	if ( ModeSaver == Mode ) {
		PrintDoorStatus("Alarm is already " + Mode);
		return;
	}
	else if ( Mode != "On" && Mode != "Off" ) {
		PrintDoorStatus("Alarm mode " + Mode + " is not eligible!");
		return;
	}
	else {
		PrintDoorStatus("Set Alarm to: " + Mode);
		setSoundAlarm(Mode);
		setSoundLights(Mode);
		ModeSaver = Mode;
		return
	}
}

// open socket server and wait to commands.
var server = net.createServer(function(socket) {
	socket.setKeepAlive(true,60000);
	socket.on('data', function(data) {
		if ( data == "On" || data == "Off") {
			setAlarm(data);
			setAlarmBT(data);
			socket.write("Alarm " + data);
		}
		else {
			socket.write("Error, bad command");
		}

	});
});

server.listen(6003, '127.0.0.1');