var mraa = require('mraa'); //require mraa
var minutes = 0.000001, the_interval = minutes * 60 * 1000;
var myDigitalPin6 = new mraa.Gpio(6);
myDigitalPin6.dir(mraa.DIR_IN);
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

if ( doorconfig.MotionService == false ) return;

setInterval(function() {
	if (myDigitalPin6.read() == 1 ) {
		console.log("Movement!")
		doorref.child('move').set('true');
		    var stop = new Date().getTime();
			while(new Date().getTime() < stop + 5000) {
				;
			}
		doorref.child('move').set('false');
	}

	
}, the_interval);