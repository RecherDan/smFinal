import React from 'react';
import * as firebase from 'firebase';
import {  Panel, Button,  Grid, Row, Col, Table, Modal } from 'react-bootstrap';
import Memos from './memos';


var config = {
      apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
      authDomain: "smartdoor-2f29b.firebaseapp.com",
      databaseURL: "https://smartdoor-2f29b.firebaseio.com",
      storageBucket: "",
      messagingSenderId: "693048105512"
    };

firebase.initializeApp(config);

var Forecast = require('react-forecast');


export default class Main extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        memos: "",
        status: {
          ip: '',
          time: '',
          doorimg: './lock.png',
          doorstatus: ''
        },
        online: 'offline',
        doorbutton: 'Open',
        lastmove: false,
        move: false,
        showModal: false,
        statusref: firebase.database().ref().child('doors').child(this.props.door)
      } 
    }
    componentDidMount() {
/*      const rootRef = firebase.database().ref().child('memos');
      const doorRef = rootRef.child(this.props.door);
      var memos = "";
      var status = "";
      //doorRef.set(mem);
      doorRef.on('value' , snap => {
          this.setState( {
            memos: snap.val()
          }
          );

      });*/
      
      //doorRef.set(mem);
      this.state.statusref.on('value' , snap => {
          this.setState( {
            status: snap.val()
          }
          );

      });
      
      this.timer = setInterval( () => {
        var d = new Date();
        var online =  ((d.getTime() - this.state.status['time'] ) > 20000 ) ? "offline" : "online";
        var doorbutton = (this.state.status['doorcurrentstatus'] === "Close" ) ? "Unlock" : "Lock";
        var doorimg = (this.state.status['doorcurrentstatus'] === "Close" ) ? "./lock.png" : "./unlock.png";
        if (this.state.status['doorcurrentstatus'] === "Middle" ) doorimg = "./error.png";
        var doorbuttondisabled = false;
        if ((this.state.status['doorstatus'] === "Locking") || (this.state.status['doorstatus'] === "Unlocking" )) {
          doorbutton = this.state.status['doorstatus'];
          doorbuttondisabled = true;
          doorimg = "./loading.gif"
        }
        var EmergencyButton = (this.state.status['alarm'] === "On" ) ? "Stop Alarm" : "Emergency";
        var EmergencyClick = (this.state.status['alarm'] === "On" ) ? "AlarmOff" : "Emergency";
        var move = (this.state.status['move'] === undefined) ? "false" : this.state.status['move'] ;
        //var notification = (this.state.status['notification'] === undefined) ? "false" : this.state.status['notification'];
        //var lastnotification = this.state.notification;
        var notification = ( this.state.status['notification'] === undefined ) ? { popup: "false" } : this.state.status['notification'];
        var popup = ( notification['popup'] === undefined ) ? "false" : (( d.getTime() - notification['stime'] < 15000) ? notification['popup'] : "false" );
        var lastpopup = this.state.popup;
        var lastmove = this.state.move;

        var showModal = this.state.showModal;
        var modaltitle = this.state.modaltitle;
        var modalbody = this.state.modalbody;
        var smokedetect = (this.state.status['smokedetect'] === "Detected") ? "Detected" : "Clean";
        var alarm = (this.state.status['alarm'] === "On" ) ? "On" : "off";
        var smokecolor = (smokedetect === "Clean") ? "App-green" : "App-red";
        var alarmcolor = (alarm === "off") ? "App-green" : "App-red";
        if ( ((lastmove !== move) && (popup === "false")) ||  lastpopup !== popup ) {
          showModal = (move === "true" ) ? true : ((popup === "true") ? true : false);
          modaltitle = (popup === "true") ? notification['title'] : "Dont Forget!";
          var memos = this.state.status['memos'];
          modalbody = (popup === "true") ? <div> {notification['msg']} </div> : <Memos memos={memos} doorid={this.props.door} />;
        }        
        this.setState( {
          online: online,
          doorbutton: doorbutton,
          doorbuttondisabled: doorbuttondisabled,
          doorimg: doorimg,
          lastmove: (lastmove === undefined) ? "false" : lastmove,
          move: move,
          notification: notification,
          popup: popup,
          lastpopup: (lastpopup === undefined) ? "false" : lastpopup,
          showModal: showModal,
          modaltitle: modaltitle ,
          modalbody: modalbody,
          smokecolor: smokecolor,
          alarmcolor: alarmcolor,
          smokedetect: smokedetect,
          alarm: alarm,
          EmergencyButton: EmergencyButton,
          EmergencyClick: EmergencyClick
        });
      }, 50);
    }

    componentWillUnmount() {
         clearInterval(this.timer);
        this.timer = false;
        this.state.statusref.off();
    }
    close() {
      this.setState({ showModal: false });
    }
    writecom(command) {
      const rootRef2 = firebase.database().ref().child('doors');
      const doorRef2 = rootRef2.child(this.props.door);
      doorRef2.child('todo').set(command);
      doorRef2.child('todo-name').set(this.props.name);
      
    }
    open() {
      this.setState({ showModal: true });
    }
    render() {
        return (
          <div>
          <Modal show={this.state.showModal} onHide={this.close.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.modaltitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.modalbody}

           </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close.bind(this)}>Close</Button>
          </Modal.Footer>
          </Modal>         
          <Grid>
          <Row className="show-grid">

            </Row>
            { (() => {
              if (this.state.online === "offline" ) 
                  return <div>{this.props.door} door is: <div className='App-red'> Offline</div> please check door connectivity.</div>;
               else
                  return (            
                    <Row className="show-grid">
                    <Col  xs={12} sm={6} md={4}>
                    <Panel header="Control" className="App-aligntextleft">
                    <table className="App-filltable">
                      <tbody>
                      <tr>
                        <td>

                                <div>
                            <p>
                              <Button bsStyle="primary" bsSize="large" disabled={this.state.doorbuttondisabled} onClick={this.writecom.bind(this, this.state.doorbutton)}>{this.state.doorbutton} Door</Button>
                            </p>
                            <p>
                              <Button bsStyle="danger" bsSize="large"  onClick={this.writecom.bind(this, this.state.EmergencyClick)}>{this.state.EmergencyButton}</Button>
                            </p>
                                  </div>
                        </td>
                        <td>
                          <img src={this.state.doorimg} className="App-lock" alt="door state" />
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </Panel>
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                  <Panel header="information" className="App-aligntextleft">
                    <Table condensed>
                    <tbody>
                    <tr>
                      <td> door connectivity: </td>
                      <td>            { (() => {
                          if (this.state.online === "offline" ) 
                            return <div className='App-red'> Offline</div>;
                          else
                            return <div className='App-green'> Online</div>;
                        })()
                        } 
                          
                      </td>
                    </tr>
                    <tr>
                      <td> smoke detector </td>
                      <td> <div className={this.state.smokecolor}> {this.state.smokedetect} </div> </td>
                    </tr>
                    <tr>
                      <td> Alarm is </td>
                      <td>  <div className={this.state.alarmcolor}>  {this.state.alarm} </div></td>
                    </tr>
                    </tbody>
                  </Table>
                  </Panel>
                  </Col>
                  <Col xsHidden smHidden md={4}>
                  <Panel header="additional">
                      <Table condensed>
                      <tbody>
                      <tr>
                        <td> lan ip: </td>
                        <td> {this.state.status['lanip']} </td>
                      </tr>
                      <tr>
                        <td> ip: </td>
                        <td> {this.state.status['ip']} </td>
                      </tr>
                      <tr>
                        <td> BT: </td>
                        <td> {this.state.status['bt']} </td>
                      </tr>
                      </tbody>
                      </Table>
                  </Panel>
                  </Col>
                  </Row>
              )})()
                } 
          <Row className="show-grid">
            <Col xsHidden smHidden md={6}>
           <Panel header="forcast"  eventKey="1">
            <Forecast latitude={32.7940} longitude={34.9896} name='Haifa' units='ca' />
          </Panel>
            </Col>
            <Col xs={12} md={6}>
          <Panel header="Memos" eventKey="2">
            <Memos 
              memos={this.state.status['memos']} 
              doorid={this.props.door} />
          </Panel>
            </Col>
            </Row>
            </Grid>
          
          </div>
        );
    }
}