import React from 'react';
import _ from 'lodash';
import * as firebase from 'firebase';
import {  Table } from 'react-bootstrap';

var config = {
      apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
      authDomain: "smartdoor-2f29b.firebaseapp.com",
      databaseURL: "https://smartdoor-2f29b.firebaseio.com",
      storageBucket: "",
      messagingSenderId: "693048105512"
    };

firebase.initializeApp(config, "logs");



export default class Logs extends React.Component {
  constructor() {
    super();
    this.state = {
      logs: ""
    } 
  }
  returnTime(time) {
    var d = new Date(time);
    var ret = d.toString();
    return <div> {ret} </div>;

  }
  renderItems() {
    console.log(Object.keys(this.state.logs).sort().reverse());
    return (
      _.map(this.state.logs,  (log, key) => <tr key={key}><td> {log.todo} </td><td> {log.name} </td><td> {this.returnTime(log.time)} </td></tr>)
      )

  }
  componentDidMount() {
    var logs = firebase.database().ref().child('doors').child(this.props.door).child('log');
    //doorRef.set(mem);
    logs.orderByChild("time").on('value' , snap => {
      this.setState( {
        logs: snap.val()
      }
    );
  });
  }
    componentWillUnmount() {
         clearInterval(this.timer);
        this.timer = false;
    }
    render() {
        return (
            <div>
            <h1> Logs </h1>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th width='10px'> Command </th>
                  <th> Done by </th>
                  <th> Time </th>
                  {/*<th> Action </th>*/}
                </tr>
              </thead>
              <tbody>
                {this.renderItems()}
              </tbody>
            </Table>
            </div>
        );
    }
}