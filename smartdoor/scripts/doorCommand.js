var mraa = require('mraa'); //require mraa
var sleep = require('sleep'); //require sleep libary to delay between commands
var net = require('net'); // require net for open server.
var doorconfig = require('/home/root/smartdoor/scripts/config'); // door configuration
var Firebase = require("firebase");
var config = {
	    apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
	    authDomain: "smartdoor-2f29b.firebaseapp.com",
	    databaseURL: "https://smartdoor-2f29b.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "693048105512"
	  };
Firebase.initializeApp(config);

var database = Firebase.database();
var rootref = database.ref().child('doors');
var doorref = rootref.child(doorconfig.doorname);


// pins definitions
var myDigitalPin7 = new mraa.Gpio(7);
myDigitalPin7.dir(mraa.DIR_OUT);
var StepPin = new mraa.Gpio(12); //setup digital pin to make the steps in the stepper motor
var DirectionPin=new mraa.Gpio(11); //setup digital pin to make direction of the rotation of the stepper motor 1(clockwise) 0 (anti clockwise) 
StepPin.dir(mraa.DIR_OUT); //set the gpio direction to output
DirectionPin.dir(mraa.DIR_OUT); //set the gpio direction to output
var PotentiometerStatus = new mraa.Aio(0); // Potentiometer Status


// global definitions
var inOperation = 0;
var commendstr="unnoknown";

if ( doorconfig.MotorService == false ) return;

// this function used for printing door status to the screen
function PrintDoorStatus(MSG) {
	doorref.child('doormsg').set(MSG);
	console.log(MSG);
}

// StepMotor doing the "stepping" to direction "Direction"
function StepMotor(Direction) {
	// rely on
	myDigitalPin7.write(1);
	
	// set direction
	DirectionPin.write((Direction == "Open") ? doorconfig.MotorDirectionToOpen : doorconfig.MotorDirectionToClose);

    var sleep_between_steps = (doorconfig.MotorMaxSpeed + 1 - doorconfig.MotorSpeed ) * 1000;
    
    for(var i = 0; i < doorconfig.MotorThreshold ;i++){
	    StepPin.write(1);
	    sleep.usleep(sleep_between_steps);
	    console.log("iterate: " + i + " Direction: " + Direction + " motorstatus: " + doorconfig.MotorStatus(0));
	    if (Direction == "Open" && doorconfig.MotorStatus(0) == "Open" )
	    	break;
	    if (Direction == "Close" && doorconfig.MotorStatus(0) == "Close" )
	    	break;
	    StepPin.write(0);
	    sleep.usleep(sleep_between_steps) ;
	    if (Direction == "Open" && doorconfig.MotorStatus(0) == "Open" )
	    	break;
	    if (Direction == "Close" && doorconfig.MotorStatus(0) == "Close" )
	    	break;
    }
   	sleep.usleep(5000);
	// rely off
	myDigitalPin7.write(0);
}

// DoorCom receives "Open" or "Close" and then controlling the stepper to open or close.
function doorCom(command) {
	var motorStatus = doorconfig.MotorStatus(1);
	
	// checks if any operation is needed.
	if ( command == "Open" && motorStatus == "Open" ) {
		PrintDoorStatus("Door Already Open");
		return ;
	}
	
	if ( command == "Close" && motorStatus == "Close" ) {
		PrintDoorStatus("Door Already Closed");
		return ;
	}	
	
	//checks if command is eligible
	if ( command != "Open" && command != "Close") {
		PrintDoorStatus("Received bad command.");
		return ;	
	}
	
	//update status
	if ( command == "Open")
		doorref.child('doorstatus').set("Unlocking");
	if ( command == "Close")
		doorref.child('doorstatus').set("Locking");
	
	// step the motor
	StepMotor(command);
		
	// check status after operation
	motorStatus = doorconfig.MotorStatus(1);
	
	if ( command == "Open" && motorStatus == "Open" ) {
		PrintDoorStatus("Door Open sucessfully!");
		return ;
	}
	
	if ( command == "Close" && motorStatus == "Close" ) {
		PrintDoorStatus("Door Closed sucessfully!");
		return ;
	}	
	
	
	PrintDoorStatus("Some Errors occurs while trying to " + command + " the Door. current status is: " + motorStatus);
}

doorref.child('doorstatus').set(doorconfig.MotorStatus(1));


// open socket server and wait to commands.
var server = net.createServer(function(socket) {
	socket.setKeepAlive(true,60000);
	socket.on('data', function(data) {
		var tempcom = false;
		if ( inOperation == 1 ) {
			socket.write("Error, already working");
		}
		else if ( data == "Open" || data == "Close") {
			// motor is in use don't allow others to do operation!
			inOperation = 1;
			doorCom(data);
			var motorStatus = doorconfig.MotorStatus(1);
			doorref.child('doorstatus').set(motorStatus);
			sleep.usleep(1000) ;
			doorref.child('doorneedtobe').set(motorStatus);
			inOperation = 0;
			socket.write("Door " + motorStatus);
		}
		else {
			socket.write("Error, bad command");
		}

	});
});

server.listen(6001, '127.0.0.1');
