var mraa = require('mraa'); //require mraa
var net = require('net');

//pins definitions
var analogPin1 = new mraa.Aio(1); //to indecat if the door isclose or not useing a potensiometer
var analogValue = analogPin1.read(); //read the value of the analog pin


var minutes = 0.1, the_interval = minutes * 60 * 1000;

var doorconfig = require('/home/root/smartdoor/scripts/config'); // door configuration
var Firebase = require("firebase");
var config = {
	    apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
	    authDomain: "smartdoor-2f29b.firebaseapp.com",
	    databaseURL: "https://smartdoor-2f29b.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "693048105512"
	  };

function SmokeDetect() {
	//TODO: implement to return 1 if smoke detected or 0 else.
	console.log(analogPin1.read());
	if ( analogPin1.read() > doorconfig.SmokeThresh) 
		return 1;
	return 0
}

Firebase.initializeApp(config);
var database = Firebase.database();
var rootref = database.ref().child('doors');
var doorref = rootref.child(doorconfig.doorname);
var Smokecount = 0;
var SmokeTime = 0;

if ( doorconfig.SmokeDetectService == false ) return;

setInterval(function() {
	if ( SmokeDetect() == 1 ) {
		Smokecount++;
		console.log("Detected smoke number: " + Smokecount);
		if ( Smokecount >= 3 )
			console.log("Detected smoke updating!");
			doorref.child('smokedetect').set('Detected');
	}
	if ( SmokeDetect() == 0 ) {
		Smokecount = 0;
		doorref.child('smokedetect').set('Clean');
	}
	
}, the_interval);