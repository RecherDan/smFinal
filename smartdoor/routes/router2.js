var express = require('express');
var passport = require('passport');
var passportLocal = require('passport-local');
var bodyParser =require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var path = require('path');
var arp = require('node-arp');
var fs = require('fs');
var debug = 1;
var lan = 0;
function runcommand(command) {
	exec(command, function(error, stdout, stderr) {
  		console.log('stdout: ' + stdout);
   		console.log('stderr: ' + stderr);
    	if (error !== null) {
   		     console.log('exec error: ' + error);
  		  }
		});
}

if ( debug == 0 ) {
	var mraa = require("mraa");
	var exec = require('child_process').exec;
	//var buzz = new mraa.Pwm(6, true);
	//var buzz = new mraa.Gpio(6);
	//buzz.dir(mraa.DIR_OUT);
	//buzz.write(0);
	 
	runcommand('echo 254 > /sys/class/gpio/export');
	runcommand('echo 222 > /sys/class/gpio/export');
	runcommand('echo 214 > /sys/class/gpio/export ');
	runcommand('echo low > /sys/class/gpio/gpio214/direction ');
	runcommand('echo high > /sys/class/gpio/gpio254/direction ');
	runcommand('echo in > /sys/class/gpio/gpio222/direction');
	runcommand('echo high > /sys/class/gpio/gpio214/direction');
	runcommand('echo 182 > /sys/class/gpio/export');
	runcommand('echo 254 > /sys/class/gpio/export');
	runcommand('echo 0 > /sys/class/gpio/gpio254/value');
	
}

function alarmon() {
	if ( debug == 0 ) {
		//buzz.enable(true);
		//buzz.write(1);
		runcommand('echo 1 > /sys/class/gpio/gpio254/value');
	}
	else {
		console.log("alarm is on");
	}	
}
function alarmoff() {
		if ( debug == 0 ) {
			runcommand('echo 0 > /sys/class/gpio/gpio254/value');
			//buzz.write(0);	
			//buzz.enable(true);
			//buzz.enable(false);
			//buzz.enable(true);
			//buzz.enable(false);
		}
		else {
			console.log("alarm is off");
		}
}

function opendoor() {
	if ( debug == 0 ) {
		
		exec('node /home/root/scripts/doorCommand open', function(error, stdout, stderr) {
  		console.log('stdout: ' + stdout);
   		console.log('stderr: ' + stderr);
    	if (error !== null) {
   		     console.log('exec error: ' + error);
  		  }
		});
	}
	else {
		console.log("door is open");
	}
	doorstate=1;
}
function closedoor() {
	if ( debug == 0 ) {
		
		exec('node /home/root/scripts/doorCommand close', function(error, stdout, stderr) {
  		console.log('stdout: ' + stdout);
   		console.log('stderr: ' + stderr);
    	if (error !== null) {
   		     console.log('exec error: ' + error);
  		  }
		});
	}
	else {
		console.log("door is closed");
	}
	doorstate=0;
}
alarmoff();

var doorstate = 0;
var users = {};
var btusers = {};
var btnew = {};
var phones = {};
var settings = {};
var wifi = {};
var memos = {};
var memlastupdate = 0;
fs.readFile(path.join(__dirname, '../db/notes.db'), "utf-8"  , function read(err, data) {
	if ( err ) {
	 	console.log(err);
	} else {
		if ( data.length == 0 )  {
			memos = {};
		} else {
			memos=JSON.parse(data);
		}
	}
	
});
fs.readFile(path.join(__dirname, '../db/settings.db'), "utf-8"  , function read(err, data) {
	if ( err ) {
	 	console.log(err);
	} else {
		if ( data.length == 0 )  {
			settings = {};
		} else {
			settings=JSON.parse(data);
		}
	}
	
});
fs.readFile(path.join(__dirname, '../db/users.db'), "utf-8"  , function read(err, data) {
	if ( err ) {
	 	console.log(err);
	} else {
		if ( data.length == 0 )  {
			users = {};
		} else {
			users=JSON.parse(data);
		}
	}
	
});
fs.readFile(path.join(__dirname, '../db/savedbt.db'), "utf-8"  , function read(err, data) {
	if ( err ) {
	 	console.log(err);
	} else {
		if ( data.length == 0 )  {
			btusers = {};
		} else {
			btusers=JSON.parse(data);
		}
	}
	
});

fs.readFile(path.join(__dirname, '../db/newbt.db'), "utf-8"  , function read(err, data) {
	if ( err ) {
	 	console.log(err);
	} else {
		if ( data.length == 0 )  {
			btnew = {};
		} else {
			btnew=JSON.parse(data);
		}
	}
	
});

fs.readFile(path.join(__dirname, '../db/phone.db'), "utf-8"  , function read(err, data) {
	if ( err ) {
	 	console.log(err);
	} else {
		if ( data.length == 0 )  {
			phones = {};
		} else {
			phones=JSON.parse(data);
		}
	}
	
});
//var users = {};
var router = express.Router();


router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(expressSession({ 
	secret: process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: false
	}));

router.use(passport.initialize());
router.use(passport.session());

passport.use(new passportLocal.Strategy(
	{usernameField: 'username', passReqToCallback: true},
	function(req, username, password, done) {
	console.log('passport');

	if (( username == 'Admin') && ( password == '1234')) {
		var ip = req.client.remoteAddress;
		if ( ip.substr(0,7) == '::ffff:') ip=ip.substr(7);
		arp.getMAC(ip, function(err, mac) {
    		if (!err) {
        		console.log(mac);
        		console.log(mac + ' added in: ' + users[mac]);
        		var date = new Date();
				var delta = date.getTime() - users[mac];
				users[mac]=date.getTime();
				console.log('new mac!' + mac);
				fs.writeFile('../db/users.db', JSON.stringify(users), function(err) {
					
				});
    		}
		});
		done(null, { id: username, name: username});
	} else {
		done(null, null);
	};
	
}));
passport.serializeUser(function(user, done) {
	done(null, user.id);
});
passport.deserializeUser(function(id, done) {
	done(null, { id: id, name: id});
});
//router.use(express.static(__dirname));
router.use(express.static(path.join(__dirname, '../views/')));
function alreadyloged(req,res, next) {
	if ( lan == 1 ) {
		if ( req.isAuthenticated() ) next();
		var ip = req.client.remoteAddress;
		if ( ip.substr(0,7) == '::ffff:') ip=ip.substr(7);
		console.log('user ip: ' + ip + ' host ip: ' + req.hostname);
		//console debug capibilities {
		if ( ip == req.hostname ) {
						req.login({ id: 'owner', name: 'owner'}, function(err){
	       					 if(err) return next(err);
	       					 console.log('loggin in ' + req.isAuthenticated());
	   					 });
	   					 console.log('owner is logged in');
	   					 next();
		} else {
				arp.getMAC(ip, function(err, mac) {
	    		if (!err) {
	        		console.log(mac);
	        		if ( users[mac] != undefined ) {
	        			console.log(mac + ' added in: ' + users[mac]);
	        			var date = new Date();
						var udate = new Date();
						udate.setTime=users[mac];
						date.setMonth(date.getMonth() -1);
						var delta = date.getTime() - users[mac];
						console.log('delta is: ' + delta);
						req.login({ id: mac, name: mac}, function(err){
	       					 if(err) return next(err);
	       					 console.log('loggin in ' + req.isAuthenticated());
	   					 });
					} else {
						console.log('not logged');
					}
	    		}
	    		next();
			});
		}
	}
	else {
		next();
	}

}
router.post('/' , passport.authenticate('local') ,function(req,res) {
	console.log("try to log in");
	res.redirect('/');
});
router.post('/addphone' , function(req, res) {
	console.log('new phone: ' + req.body.phonename + ' and name is: ' + req.body.phone);
	phones[req.body.phone]=req.body.phonename;
	fs.writeFile('../db/phone.db', JSON.stringify(phones), function(err) {
					
	});
	res.redirect('./#Settings');
});
router.post('/delphone' , function(req, res) {
	console.log('del phone: ' + req.body.phone + ' and name is: ' + phones[req.body.phone]);
	delete phones[req.body.phone];
	fs.writeFile('../db/phone.db', JSON.stringify(phones), function(err) {
					
	});
	res.redirect('./#Settings');
});
router.post('/newbt' , function(req, res) {
	console.log('new bt: ' + req.body.newbt + ' and name is: ' + btnew[req.body.newbt]);
	btusers[req.body.newbt]=btnew[req.body.newbt];
	fs.writeFile('../db/savedbt.db', JSON.stringify(btusers), function(err) {
					
	});
	res.redirect('./#Settings');
});
router.post('/delbt' , function(req, res) {
	console.log('del bt: ' + req.body.btrem + ' and name is: ' + btnew[req.body.btrem]);
	delete btusers[req.body.btrem];
	fs.writeFile('../db/savedbt.db', JSON.stringify(btusers), function(err) {
					
	});
	res.redirect('./#Settings');
});
router.post('/setemer' , function(req, res) {
	console.log('new settings: callhelp:' + req.body.callhelp + ' alarmhelp: ' + req.body.alarmhelp + ' callemer: ' + req.body.callemer + ' alarmemer: ' + req.body.alarmemer);
	settings['callhelp']=req.body.callhelp;
	settings['alarmhelp']=req.body.alarmhelp;
	settings['callemer']=req.body.callemer;			
	settings['alarmemer']=req.body.alarmemer;
	settings['callto']=req.body.callto;
	fs.writeFile('../db/settings.db', JSON.stringify(settings), function(err) {
					
	});
	res.redirect('./#Settings');
});
router.post('/setbt' , function(req, res) {
	console.log('new settings: btopen:' + req.body.btopen);
	settings['btopen']=req.body.btopen;
	fs.writeFile('../db/settings.db', JSON.stringify(settings), function(err) {
					
	});
	res.redirect('./#Settings');
});

router.post('/updatememos' , function(req, res) {
	console.log('new memos!:' + req.body.data);
	memos=JSON.parse(req.body.data);
	fs.writeFile('../db/notes.db', req.body.data, function(err) {
					
	});
	memlastupdate = req.body.lastupdate;
	res.redirect('./#Settings');
});
router.get('/updatememos', function(req, res) {
	// todo: need to check real status
	res.status(200).send(memlastupdate);
});
router.get('/', alreadyloged, function(req,res) {
	res.render('index', {
		isAuthtenticated: req.isAuthenticated()
	});
});
router.get('/status', function(req, res) {
	// todo: need to check real status
	res.status(200).send((doorstate ? 'on' : 'off' ));
});
router.get('/ledon', function(req, res) {
	// todo: need to run opening door scripts
	opendoor();
	res.sendStatus(200);
});
router.get('/ledoff', function(req, res) {
	// todo: need to run closing door scripts
	closedoor();
	alarmoff();
	res.sendStatus(200);
});
router.get('/helpbut', function(req, res) {
	// todo: need to run opening door scripts + help options
if ( settings['alarmhelp'] == "on") {
   alarmon();
   setTimeout(function () {
        alarmoff();
    }, 5000);
 }
	opendoor();
	res.sendStatus(200);
});
router.get('/emerbut', function(req, res) {
	// todo: need to run opening door scripts + emergency options
if ( settings['alarmemer'] == "on") {
   alarmon();
   setTimeout(function () {
   		console.log("timeout alram");
        alarmoff();
    }, 5000);
 }
	opendoor();
	res.sendStatus(200);
});

module.exports = router;
