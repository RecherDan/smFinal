var net = require('net');
var Firebase = require("firebase");


var config = {
	    apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
	    authDomain: "smartdoor-2f29b.firebaseapp.com",
	    databaseURL: "https://smartdoor-2f29b.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "693048105512"
	  };
Firebase.initializeApp(config);

var sendnot = require('/home/root/smartdoor/scripts/sendnot.js')
var device = process.argv[2];
var mode = process.argv[3];
var port = 6001;
if ( device == "Motor") port = 6001;
if ( device == "DoorStatus" ) port = 6002;
if ( device == "Alarm" ) port = 6003;
if ( device == "Smoke" ) port = 6004;
if ( device == "record" ) port = 6006;
if ( device == "bt" ) port = 6007;
if ( device == "not" ) {
	sendnot.send(mode , process.argv[4] );
	return;
}


var client = new net.Socket();
client.connect(port, '127.0.0.1', function() {
	console.log('Connected');
	client.write(mode);
	//if ( device == "bt") client.destroy();
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});