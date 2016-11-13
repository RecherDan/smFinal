import React from 'react';
import {  Well, FormGroup, FormControl, ControlLabel ,Button,  Form, Col, Checkbox } from 'react-bootstrap';
import * as firebase from 'firebase';

var config = {
      apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
      authDomain: "smartdoor-2f29b.firebaseapp.com",
      databaseURL: "https://smartdoor-2f29b.firebaseio.com",
      storageBucket: "",
      messagingSenderId: "693048105512"
    };

firebase.initializeApp(config, "third");


export default class SelDoor extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        doors: "",
        val: this.props.name
      } 
      this.chooseDoor = this.props.chooseDoor.bind(this);

    }
    componentDidMount() {
      const rootRef = firebase.database().ref().child('doors');
      rootRef.on('value' , snap => {
          this.setState( {
            doors: snap.val()
          }
          );
      });
    }
    render() {

        return (
          <div className="container">
            <Well>
            <Form horizontal onSubmit={this.handleSubmit.bind(this)}>
              <FormGroup>
                <Col componentClass={ControlLabel} sm={2}>
                  Name
                </Col>
                <Col sm={10}>
                  <FormControl type="input" placeholder="Name" id="name" defaultValue={this.state.val} disabled={this.props.app} />
                </Col>
              </FormGroup>

              <FormGroup>
                <Col componentClass={ControlLabel} sm={2}>
                  Door
                </Col>
                <Col sm={10}>

                    <FormControl componentClass="select" placeholder="select" id="door" >
                      { 

                        Object.keys(this.state.doors).map(item => {
                          return <option value={item} key={item}>{item}</option>;
                        })
                      }
                    </FormControl>

                </Col>
              </FormGroup>

              <FormGroup>
                <Col smOffset={2} sm={10}>
                  <Checkbox  defaultChecked id="remember">Remember me</Checkbox>
                </Col>
              </FormGroup>

              <FormGroup>
                <Col smOffset={2} sm={10}>
                  <Button type="submit">
                    Sign in
                  </Button>
                </Col>
              </FormGroup>
            </Form>
            </Well>
          </div>
        
        );
    }
    handleSubmit(event) {
      event.preventDefault();
      var name = document.getElementById("name").value;
      var door = document.getElementById("door").value;
      var remember = document.getElementById("remember").checked;
      this.chooseDoor(name, door, remember);
    }

}