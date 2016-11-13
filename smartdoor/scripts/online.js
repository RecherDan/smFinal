//var mraa = require('mraa'); //require mraa
//var PotentiometerStatus = new mraa.Aio(0); // Potentiometer Status
//var analogValue = analogPin0.read(); //read the value of the analog pin
var Firebase = require("firebase");
//var getIP = require('external-ip')();
var net = require('net');
var childProcess = require('child_process'), child;
var doorconfig = require('/home/root/smartdoor/scripts/config'); // door configuration
var doorname = "Technion-door";

var minutes = 0.01, the_interval = minutes * 60 * 1000;
var config = {
	    apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
	    authDomain: "smartdoor-2f29b.firebaseapp.com",
	    databaseURL: "https://smartdoor-2f29b.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "693048105512"
	  };
Firebase.initializeApp(config);
var database = Firebase.database();
var doorstatus = "closed";
var smokedet = "clean";
var lastevent = "13:20";
var alarm = "off";
var eip = "";
var emergencycount =0;

//MotorStatus read Potentiometer Status and consider if door is "Open", "Close" or in the "Middle"
//function MotorStatus() {
//	var PotentiometerRead = PotentiometerStatus.read();
//	if ( PotentiometerRead < doorconfig.ThrasholdConsiderdOpen ) return "Open";
//	else if ( PotentiometerRead > doorconfig.ThrasholdConsiderdClose ) return "Close";
//	return "Middle";
//}

console.log("start updating online status");
//getIP(function (err, ip) {
//    if (err) {
//        // every service in the list has failed 
//        console.log(err);
//    }
//    eip = ip;
//});
function getlanip() {
	
	var proc = require('child_process').spawn("/home/root/scripts/getlanip.sh");
	console.log("lan ip");
	proc.stdout.on('data', (data) => {
		  console.log(`stdout: ${data}`);
		  database.ref().child('doors').child(doorname).child('lanip').set(data.toString().replace(/(\r\n|\n|\r)/gm,""));
	});
}
getlanip();
function storeLog(name, todo) {
	  var d = new Date();
	  var log = {
			  name: name,
			  todo: todo,
			  time: d.getTime()
	  }
	  database.ref().child('doors').child(doorname).child('log').push(log);
}
function applyService (service, mode, emergency) {
	emergencycount = 0;
	var port = 0;
	switch(service) {
		case "Motor":
			port = 6001;
			break;
		case "Alarm":
			port = 6007;
			break;
		default:
			return;
	}
	  if ( doorconfig.debug == false ) {
		  var client = new net.Socket();
		  client.connect(port, '127.0.0.1', function() {
		  	console.log('Connected');
		  	client.write(mode);
		  });

		  client.on('data', function(data) {
		  	console.log('Received: ' + data);
		  	client.destroy(); // kill client after server's response
		  });

		  client.on('close', function() {
		  	console.log('Connection closed');
		  });
		  client.on('error', function(e) {
			  console.log('Error');
			  if ( emergency == true && emergencycount < 3 ) {
			        client.setTimeout(4000, function() {
			            client.connect(port, '127.0.0.1', function(){
			    		  	console.log('Connected');
			    		  	client.write(mode);
			            });
			        });
			        console.log('Emrgency mode keeping trying to apply service!');
			  }
		  });
	  }
}



database.ref().child('doors').child('Technion-door').on("value", function(snapshot) {
		
	  if (snapshot.child('todo').val() != "null" ) {
		  database.ref().child('doors').child(doorname).child('todo').set("null");
		  console.log("todo " + snapshot.child('todo').val());
		  if ( snapshot.child('todo').val()  == "Lock" ) {
			  storeLog(snapshot.child('todo-name').val(), snapshot.child('todo').val());
			  if (doorconfig.MotorService) 
				  applyService("Motor", "Close", false);
		  } 
		  if ( snapshot.child('todo').val()  == "Unlock" ) {
			  storeLog(snapshot.child('todo-name').val(), snapshot.child('todo').val());
			  if (doorconfig.MotorService) 
				  applyService("Motor", "Open", false);
		  } 
		  if ( snapshot.child('todo').val()  == "AlarmOff" ) {
			  if (doorconfig.AlarmService) 
				  applyService("Alarm", "Off", true);
			  database.ref().child('doors').child(doorname).child('Emergency').set("Off");
				var notification = {
						title: "",
					    msg: "",
						popup: "false"	
				}	
				database.ref().child('doors').child(doorname).child('notification').set(notification);
		  }
		  if ( snapshot.child('todo').val()  == "Emergency" ) {
			  storeLog(snapshot.child('todo-name').val(), snapshot.child('todo').val());
			  database.ref().child('doors').child(doorname).child('Emergency').set("On");
			  if (doorconfig.MotorService)
				  applyService("Motor", "Open", true);
			  if (doorconfig.AlarmService)
				  applyService("Alarm", "On", true);
			  // send notification to android devices
			  if (doorconfig.NotificationService) {
				  child = childProcess.exec('node /home/root/smartdoor/scripts/sendnotification.js "Emergency!!!" "Some one apply the emegency mode!"', function (error, stdout, stderr) {
				   if (error) {
				     console.log(error.stack);
				     console.log('Error code: '+error.code);
				     console.log('Signal received: '+error.signal);
				   }
				   console.log('Child Process STDOUT: '+stdout);
				   console.log('Child Process STDERR: '+stderr);
				 });
			  }
				var notification = {
						title: "Emergency!!!",
					       	msg: "Some one apply the emegency mode!",
						popup: "true"	
					}	
				database.ref().child('doors').child(doorname).child('notification').set(notification);
//			    var stop = new Date().getTime();
//				while(new Date().getTime() < stop + 10000) {
//					;
//				}
//				notification['popup'] = "false";
//				database.ref().child('doors').child(doorname).child('notification').set(notification);
//				applyService(6007, "Off", true);
		  } 
	  }
		  
	  
	  
	});



setInterval(function() {
  //console.log(doorname + ": I am doing my 0.1 minutes check");
  var d = new Date();
  var rootref = database.ref().child('doors');
  var doorref = rootref.child(doorname);
  //exec tester.js to receive door information
  doorref.child('ip').set(eip);
  doorref.child('time').set(d.getTime());
//  doorref.child('doorcurrentstatus').set(MotorStatus());
  //doorref.set({ip: eip,
	//  time: d.getTime(),
	  //doorstatus: doorstatus,
	//  smokedetect: smokedet,
	//  alarm: alarm,
	//  lastevent: lastevent
	//  });
  // do your stuff here
}, the_interval);