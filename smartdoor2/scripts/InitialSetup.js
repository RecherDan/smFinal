var mraa = require('mraa'); //require mraa


//pins definitions
var analogPin1 = new mraa.Aio(0); //to indecat if the door isclose or not useing a potensiometer
var analogValue = analogPin1.read(); //read the value of the analog pin


var minutes = 0.01, the_interval = minutes * 60 * 1000;

var doorconfig = require('./config'); // door configuration



setInterval(function() {
	console.log(analogPin1.read());
	
}, the_interval);