/* change between pages mechanism */
var settings;
var recbtnames;

var header = document.querySelector(".contentheader");

var helppage=document.getElementById("help-page");
var settingpage=document.getElementById("setting-page");
var mainpage=document.getElementById("main-page");

var hash=window.location.hash;

if ( mainpage != undefined || settingpage != undefined || helppage != undefined ) {
	if ( hash == "#Help" ) {
		helppage.style.display ="inline";
	} else if ( hash == "#Settings" ) {
		settingpage.style.display ="inline";
	} else {
		mainpage.style.display ="inline";
	}

header.addEventListener('click', function(ev) {
	var clicked=ev.target.innerHTML;
	helppage.style.display ="none";
	mainpage.style.display ="none";
	settingpage.style.display ="none";
	if ( clicked == "Settings" ) {
		settingpage.style.display ="inline";
	} else if ( clicked == "Help" ) {
		helppage.style.display ="inline";
	} else if ( clicked == "SmartDoor" ) {
		mainpage.style.display ="inline";
	} else {
		
	}
});

function sendsmsall() {
	for (phone in recbtnames) {
		MainActivityInterFace.sendsms(phone);
	}
}
/* bt refresh button */
var btref = document.getElementById("btrefresh");
btref.addEventListener('click', function(ev) {
        btref.disabled=true;
	    $.get("static/db/newbt.db", function(data, status){
            var btnames = document.getElementById("btnames");
            var recbtnames = JSON.parse(data);
            btnames.innerHTML='';
            btref.disabled=false;
            for (key in recbtnames) {
            	btnames.innerHTML+='<option value="' + key + '">' + recbtnames[key] + '</option>';
            }
        });
    
});

/* change door status button */
var doorstatus= document.getElementById("doorstatus");
doorstatus.addEventListener('click', function(ev) {
    if ( doorstate == 'off' ) {
         $.get("ledon", function(data, status){
            doorstatus.innerHTML="Close Door";
            doorstate='on';
        });
    } else {
        $.get("ledoff", function(data, status){
            doorstatus.innerHTML="Open Door";
         doorstate='off';
        });
    }
});

/* Help button */

var helpbut= document.getElementById("helpbut");
helpbut.addEventListener('click', function(ev) {
         $.get("helpbut", function(data, status){
            doorstatus.innerHTML="Close Door";
            doorstate='on';
        });
        if ( settings['callhelp'] == "on" ) {
        	 MainActivityInterFace.callemer(settings['callto']); 
        }
        sendsmsall();
});

/* Emergency button */

var emerbut= document.getElementById("emerbut");
emerbut.addEventListener('click', function(ev) {
         $.get("emerbut", function(data, status){
            doorstatus.innerHTML="Close Door";
            doorstate='on';
        });
        if ( settings['callemer'] == "on" ) {
        	setTimeout(function() {
        	 MainActivityInterFace.callemer(settings['callto']); 
        	},5000);
        }
        sendsmsall();
});
var memosid = -1;
var memoform = document.getElementById("memos");
var newmemobut = document.getElementById("newmemo");
var updmemobut = document.getElementById("updatememo");
var memos = {};
var memlastupdate = 0;
function newmemoform(memval) {
	memosid=memosid+1;
	return  ' <div class="input-group col-xs-offset-3"><span class="input-group-addon"><input type="checkbox" name="memosbox" checked></span><input type="text" id="memotext' + memosid + '" class="form-control" value="' + memval + '"></div>';
}
newmemobut.addEventListener('click', function(ev) {
	memoform.innerHTML+=newmemoform("");
});
updmemobut.addEventListener('click', function(ev) {
	updatemems();
});

function updatemems() {
  var newmemos = '';
  memosid=-1;
  var checkboxes = document.getElementsByName("memosbox");
  memos = {};
  // loop over them all
  console.log(checkboxes.length);
  for (var i=0; i<checkboxes.length; i++) {
     // And stick the checked ones onto an array...
     if (checkboxes[i].checked) {
     	var memotext = document.getElementById("memotext" + i);
        memos[i]=memotext.value;
        newmemos += newmemoform(memotext.value);
     }
  }
  memoform.innerHTML=newmemos;
  console.log(JSON.stringify(memos));
  	var date = new Date();
	memlastupdate = date.getTime();
  $.post("./updatememos", { 'data': JSON.stringify(memos) , 'lastupdate': memlastupdate});
}
/* Refresh: make app updated in eace device using it */

function refsite() {
	$.get("status", function(data, status){
			doorstate=data;
			if ( doorstate == 'off' ) {
				doorstatus.innerHTML="Open Door";
			} else {
				doorstatus.innerHTML="Close Door";	
			}
        });
	$.get("updatememos", function(data, status){
			serverlastupdate=data;
			if ( serverlastupdate >  memlastupdate ) {
				memelem = document.getElementById("memoslastupdate");
				if ( memelem != null  ) {
				document.getElementById("memoslastupdate").style.display="inline";
				}
			}
        });
 	    $.get("static/db/savedbt.db", function(data, status){
            var savedbt = document.getElementById("savedbt");
            var recbtnames = JSON.parse(data);
            savedbt.innerHTML='';
            for (key in recbtnames) {
            	savedbt.innerHTML+='<option value="' + key + '">' + recbtnames[key] + '</option>';
            }
        }); 
        if ( Object.keys(memos).length == 0 ) {
 	    $.get("static/db/notes.db", function(data, status){
 	      	var date = new Date();
			memlastupdate = date.getTime();
            memos = JSON.parse(data);
            var newmemos = '';
            memoform.innerHTML='';
            for (key in memos) {
            	newmemos += newmemoform(memos[key]);
            }
            memoform.innerHTML=newmemos;
            memelem = document.getElementById("memoslastupdate");
            if ( memelem != null ) {
             document.getElementById("memoslastupdate").style.display="none";
            }
        });   
        }
 	    /*$.get("static/db/wifi.db", function(data, status){
            var wifinames = document.getElementById("wifinames");
            var recbtnames = JSON.parse(data);
            wifinames.innerHTML='';
            for (key in recbtnames) {
            	wifinames.innerHTML+='<option>' + recbtnames[key] + '</option>';
            }
        });*/   
 	    $.get("static/db/phone.db", function(data, status){
            var phonenum = document.getElementById("phonenum");
            var callto = document.getElementById("callto");
            recbtnames = JSON.parse(data);
            phonenum.innerHTML='';
            callto.innerHTML='';
            for (key in recbtnames) {
            	phonenum.innerHTML+='<option>' + key + '</option>';
            	//if ( key == settings["callto"] ) { callto.innerHTML+='<option selected>' + key + '</option>'; }
            	callto.innerHTML+='<option>' + key + '</option>'; 
            }
        });   
         $.get("static/db/settings.db", function(data, status){
            settings = JSON.parse(data);
            for (key in settings) {
            	if ( key != "callto" ) {
            		var onradio = document.getElementById(key + 'on');
            		var offradio = document.getElementById(key + 'off');
            		if ( settings[key] == 'on' )  {
            			onradio.checked = true;
            		} else {
            			offradio.checked = true;
            		}
            	}
            	else {
            		document.getElementById(key).value = settings[key];
            	}
            }
        });   
}


/* update on start */
refsite();

/* refresh every 8 secs */
setInterval(function(){
  refsite();
}, 8000);

}