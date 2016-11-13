var FCM = require('fcm-node');
var Firebasenot = require("firebase");
var doorconfig = require('./config'); // door configuration

var sendnot = {};


//var doorref = rootref.child(doorconfig.doorname);

var serverKey = 'AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ';
var fcm = new FCM(serverKey);



var config = {
	    apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
	    authDomain: "smartdoor-2f29b.firebaseapp.com",
	    databaseURL: "https://smartdoor-2f29b.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "693048105512"
	  };
Firebasenot.initializeApp(config, "Sendnot");

sendnot.send = function(Title, Msg) {


	var database = Firebasenot.database();
	var rootref = database.ref().child('users');
	var query = Firebasenot.database().ref("users").orderByKey();
	query.once("value", function(snapshot) {
	snapshot.forEach(function(childSnapshot) {
	  // key will be "ada" the first time and "alan" the second time
	  var key = childSnapshot.key;
	  // childData will be the actual contents of the child
	  var childData = childSnapshot.val();
	  if ( doorconfig.doorname == childSnapshot.child("door").val()) {
		  console.log(key);
		  console.log(childSnapshot.child("toekn").val());
		  console.log(childSnapshot.child("door").val());  
		  
		  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
				    to: childSnapshot.child("toekn").val(), 
				    
				    notification: {
				        title: Title, 
				        body: Msg 
				    }
				};
	
				fcm.send(message, function(err, response){
				    if (err) {
				        console.log("Something has gone wrong!");
				        return;
				    } else {
				        console.log("Successfully sent with response: ", response);
				        return;
				    }
				});
	  }
	return;
	});
	return;
	});
}
module.exports = sendnot;