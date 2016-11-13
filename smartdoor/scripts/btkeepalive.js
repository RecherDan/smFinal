var minutes = 0.1, the_interval = minutes * 60 * 1000;
var SerialPort = require('serialport');
var receivedpong = 0;
var failcount = 0; 
var net = require('net'); // require net for open server.
fs = require('fs');
var Firebase = require("firebase");
var config = {
	    apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
	    authDomain: "smartdoor-2f29b.firebaseapp.com",
	    databaseURL: "https://smartdoor-2f29b.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "693048105512"
	  };
var doorconfig = require('/home/root/smartdoor/scripts/config'); // door configuration
Firebase.initializeApp(config);
var database = Firebase.database();
var rootref = database.ref().child('doors');
var doorref = rootref.child(doorconfig.doorname);
doorref.child('bt').set("Off");
var btdata="";
var btwait=false;
var btwaitfailcount=0;
var socketwrite = "";

function waitnsec(nsec) {
	var stop = new Date().getTime();
	while(new Date().getTime() < stop + nsec*1000) {
		;
	}
}
var proc = require('child_process').exec("bash -x /home/root/bt/startbt.sh");
waitnsec(15);

var port = new SerialPort('/dev/rfcomm0');

	port.on('open', function() {
			console.log("connected");
	});
	 
	// open errors will be emitted as an error event 
	port.on('error', function(err) {
	  //var procc = require('child_process').exec("sudo /bin/systemctl restart btkeeponline.service");
	  //var proc = require('child_process').exec("bash -x /home/root/bt/startbt.sh");
	  console.log('Error: ', err.message);
	  //waitnsec(10);
	})	
	port.on('data', function(data) {
		console.log('bt recived:' + data);
		if ( data == "4" ) {
			receivedpong = 1;
			failcount = 0;
			doorref.child('bt').set("On");
			doorref.child('alarm').set("Off");
		}
		if ( data == "5" ) {
			receivedpong = 1;
			failcount = 0;
			doorref.child('bt').set("On");
			doorref.child('alarm').set("On");
		}
		if ( data == "1" || data =="0") {
			if (btwait && (data == btdata)) {
				doorref.child('alarm').set((data == "0" ) ? "Off" : "On");
				btwaitfailcount = 0;
				btwait=false;
				console.log("received Alarm status btwait=false and data is: " + data);
				socketwrite.write((data == "0" ) ? "Off" : "On");
			}
		}

	});

	if ( doorconfig.BtKeepOnlineService == false ) return;	

setInterval(function() {
	if ( receivedpong == 0 ) {
		failcount++;
		console.log("fail: " + failcount);
	}
	if ( btwait ) {
		btwaitfailcount++;
		port.write(btdata);
		console.log("fail to receive alram status send again");
	}
	if ( failcount >= 3 || btwaitfailcount >= 3 ) {
		doorref.child('bt').set("Off");
		console.log("3 times error doing recovery failcount: " + failcount + " btwaitcount: " + btwaitfailcount);
		var procc = require('child_process').exec("sudo /bin/systemctl restart smartdoor-btkeeponline.service");
		var proc = require('child_process').exec("sudo bash /home/root/bt/startbt.sh");
		proc.stdout.on('data', (data) => {
			  console.log(`stdout: ${data}`);
		});
		proc.stdout.on('error', (data) => {
			  console.log(`stdout err: ${data}`);
		});
		waitnsec(10);
		failcount = -1000;
		btwaitfailcount = -1000;
	}
	if ( receivedpong == 1 ) {
		receivedpong = 0;
	}
	port.write("3");
}, the_interval);

var server = net.createServer(function(socket) {
	socket.setKeepAlive(true,60000);
	socket.on('data', function(data) {
		if ( data == "On" || data == "Off") {
			btdata = (data == "On" ) ? "1" : "0";
			btwait = true;
			if ( data == "On")
				port.write("1");
			else
				port.write("0");
			socketwrite = socket;
			//socketwrite.write("Alarm is now " + (btrecived == "0" ) ? "Off" : "On");
		}
		else {
			socket.write("Error, bad command");
		}

	});
});

server.listen(6007, '127.0.0.1');