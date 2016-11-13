import React, { Component } from 'react';

import * as firebase from 'firebase';
import './App.css';
import TopBar from './topbar';
import Footer from './footer';
import SelDoor from './seldoor';
import Main from './main';
import Help from './help';
import Logs from './logs';
import Settings from './settings';
var config = {
      apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
      authDomain: "smartdoor-2f29b.firebaseapp.com",
      databaseURL: "https://smartdoor-2f29b.firebaseio.com",
      storageBucket: "",
      messagingSenderId: "693048105512"
    };

firebase.initializeApp(config, "App");
function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)===' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      doorselected: getCookie("doorselected"),
      door: getCookie("door"),
      name: getCookie("name"),
      curpage: "main",
      app: false
    }
    //console.log("door " + getAllUrlParams().doorname + " name: " + getAllUrlParams().name );
    if ( getAllUrlParams().applogin === "true" ) {
      this.state = {
        doorselected: "true",
        door: getAllUrlParams().doorname,
        name: getAllUrlParams().name,
        app: true
      }
    }
  }
  render() {
    
    return (
      <div className="App">
        <TopBar pagechange={this.pagechange.bind(this)} door={this.state.door} doorchange={this.doorchange.bind(this) } name={this.state.name}/>
        { (() => {
          if ( this.state.doorselected === "true" ) {
            switch (this.state.curpage ) {
              case "help":
                return <Help />
              case "settings":
                return <Settings />
              case "logs":
                return <Logs door={this.state.door} />
              default:
                return <Main doorchange={this.doorchange.bind(this) } door={this.state.door} name={this.state.name}/>;
            }
          }
          else
            return <SelDoor chooseDoor={this.chooseDoor.bind(this)} name={this.state.name} app={this.state.app} />;
        })() }
        <Footer />
      </div>
    );
  }
    chooseDoor(name, door, remember) {
      console.log(remember);
      if ( remember === true) {
        setCookie("name", name, 100);
        setCookie("door", door, 100);
        setCookie("doorselected", "true", 100);
      }
      else {
        setCookie("doorselected", "false", 100);
        setCookie("door", "", 100);
      }
    this.setState( {
      doorselected: "true",
      name: name,
      door: door
    });
      const rootRef2 = firebase.database().ref().child('users');
      const doorRef2 = rootRef2.child(name);
      doorRef2.child('door').set(door);
    }
  doorsel() {
    console.log("change");
    this.setState( {
      doorselected: "true"
    });
  }
  doorchange() {
    this.setState( {
      doorselected: "false"
    });
  }
  pagechange(page) {
    this.setState( {
      curpage: page
    });
  }
}

export default App;
