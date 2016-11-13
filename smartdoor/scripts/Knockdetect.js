var mraa = require('mraa'); //require mraa
var net = require('net'); // require net for open server.
var minutes = 0.000001, the_interval = minutes * 60 * 1000;
var analogPin1 = new mraa.Aio(3); //to indecat if the door isclose or not useing a potensiometer
var childProcess = require('child_process'), child;
var doorconfig = require('/home/root/smartdoor/scripts/config'); // door configuration
var Firebase = require("firebase");
var myDigitalPin2 = new mraa.Gpio(2);
myDigitalPin2.dir(mraa.DIR_IN);
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


var KnockCount = 0;
var lastKnock = 0;
var minThreshold = 200;
var MaxtimeBetweenKnocks = 6000;
var MintimeBetweenKnocks = 200;

if ( doorconfig.KnockDetectService == false ) return;

setInterval(function() {
	if ( myDigitalPin2.read() == 1 ) {
	//	console.log("Emm got 0");
	}
	//if ( analogPin1.read() > 100 ) console.log("got: " + analogPin1.read() );
	var d = new Date();
	if ( (d.getTime() - lastKnock) >  MaxtimeBetweenKnocks ) {
		KnockCount = 0;
	}
	if ( ( analogPin1.read() > minThreshold ) && ((d.getTime() - lastKnock) >  MintimeBetweenKnocks )) {
		console.log("Took " + KnockCount + "Threshold: " +  analogPin1.read());
		KnockCount=KnockCount+1;
		lastKnock = d.getTime();
	}
	if ( KnockCount >= 3 ) {
		KnockCount = 0;
		console.log("Took Took Took"  + "Threshold: " +  analogPin1.read());
		child = childProcess.exec('node /home/root/smartdoor/scripts/sendnotification.js "Took took" "someone knocked your door"', function (error, stdout, stderr) {
			   if (error) {
			     console.log(error.stack);
			     console.log('Error code: '+error.code);
			     console.log('Signal received: '+error.signal);
			   }
			   console.log('Child Process STDOUT: '+stdout);
			   console.log('Child Process STDERR: '+stderr);
			 });
		var d = new Date();
		var notification = {
				title: "Knock Knock",
			       	msg: "some one knocked your door!",
				popup: "true",
				stime: d.getTime()	
			}	
				doorref.child('notification').set(notification);
		
		var proc = require('child_process').spawn("aplay", ['/home/root/smartdoor/scripts/wellcom_transcript.wav'] );
		var stop = new Date().getTime();
		while ( new Date().getTime() < stop + 5000 ) {
			;
		}
		var client = new net.Socket();
		client.connect(6006, '127.0.0.1', function() {
			console.log('Connected');
			client.write("Record");
		});

		client.on('data', function(data) {
			console.log('Received: ' + data);
			client.destroy(); // kill client after server's response
		});

		client.on('close', function() {
			console.log('Connection closed');
		});
		stop = new Date().getTime();
		while (new Date().getTime() < stop + 5000) {
			;
		}
		notification['popup'] = "false";
		//doorref.child('notification').set(notification);
	}	
}, the_interval);
