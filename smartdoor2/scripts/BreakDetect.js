var sleep = require('sleep'); //require sleep libary to delay between commands
var net = require('net'); // require net for open server.
var doorconfig = require('/home/root/smartdoor/scripts/config'); // door configuration
var minutes = 0.05, the_interval = minutes * 60 * 1000;
var childProcess = require('child_process'), child;
var Firebase = require("firebase");
var AlretCount = 0;


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

if ( doorconfig.BreakDetectService == false ) return;	
var sendnot = require('/home/root/smartdoor/scripts/sendnot.js')
setInterval(function() {
	var doorneedtobe = doorref.child('doorneedtobe');
	doorneedtobe.on('value' , snap => {
			if ( doorconfig.MotorStatus(1) != snap.val() ) {
				if ( snap.val() == "Close" ) {
					AlretCount++;
					if (AlretCount >= 2 ) {
						console.log("ok lets send notifications");
						var d = new Date();
						var notification = {
								title: "Thief Alert",
							    msg: "someone is opening your lock manually!",
								popup: "true",
								stime: d.getTime()
							}	
						doorref.child('notification').set(notification);
//						child = childProcess.exec('node /home/root/smartdoor/scripts/sendnotification.js "Thief Alert" "someone is opening your lock manually!"', function (error, stdout, stderr) {
//							   if (error) {
//							     console.log(error.stack);
//							     console.log('Error code: '+error.code);
//							     console.log('Signal received: '+error.signal);
//							   }
//							   console.log('Child Process STDOUT: '+stdout);
//							   console.log('Child Process STDERR: '+stderr);
//							 });
						sendnot.send("Thief Alert" ,"someone is opening your lock manually!");
					    var stop = new Date().getTime();
						while(new Date().getTime() < stop + 10000) {
							;
						}
						console.log("popup false");
						notification['popup'] = "false";
						doorref.child('notification').set(notification);
					    var stop = new Date().getTime();
						while(new Date().getTime() < stop + 60000) {
							;
						}
					}
				}
			}
			else {
				AlretCount=0;
			}
		}
	    );
}, the_interval);