var net = require('net');
var Firebase = require("firebase");
var doorconfig = require('/home/root/smartdoor/scripts/config'); // door configuration

var config = {
	    apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
	    authDomain: "smartdoor-2f29b.firebaseapp.com",
	    databaseURL: "https://smartdoor-2f29b.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "693048105512"
	  };
Firebase.initializeApp(config);
var database = Firebase.database();

//pins definitions
var minutes = 0.01, the_interval = minutes * 60 * 1000;

if ( doorconfig.DoorStatusService == false ) return;

setInterval(function() {
	  var rootref = database.ref().child('doors');
	  var doorref = rootref.child(doorconfig.doorname);
	  doorref.child('doorcurrentstatus').set(doorconfig.MotorStatus(1));
	  console.log(doorconfig.PotentiometerReadVal.read());
}, the_interval);