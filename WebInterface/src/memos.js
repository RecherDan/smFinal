import _ from 'lodash';
import * as firebase from 'firebase';
import React from 'react';
import MemoItem from './memo-item';
import { Table, FormGroup, FormControl, Button } from 'react-bootstrap';

import ReactDOM from 'react-dom';

var config = {
      apiKey: "AIzaSyCRpzldmrnwtOf7M_TBBNGFofyswZ2IifQ",
      authDomain: "smartdoor-2f29b.firebaseapp.com",
      databaseURL: "https://smartdoor-2f29b.firebaseio.com",
      storageBucket: "",
      messagingSenderId: "693048105512"
    };

firebase.initializeApp(config, "Secondary");
var inputDivStyle = {
  overflow: 'hidden',
  paddinRight: '.5em'
};
var submitDivStyle = {
  float: 'right'
};

export default class Memos extends React.Component {
  renderItems() {
    const props = _.omit(this.props, 'memos');
    return _.map(this.props.memos, (memo, key) => <MemoItem key={key} index={key} {...memo} {...props} deleteTask={this.deleteTask.bind(this)} />)
  }
    render() {

        return (
      <div>
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            <th width='10px'> Status </th>
            <th> Memo </th>
            {/*<th> Action </th>*/}
          </tr>
        </thead>
        <tbody>
          {this.renderItems()}
        </tbody>
      </Table>
      <form  onSubmit={this.onSaveClick.bind(this)}>
        <FormGroup bsSize="small">
          <div style={submitDivStyle}>
            <Button type="submit"  onClick={this.onSaveClick.bind(this)}>
              New
            </Button>
          </div>
          <div style={inputDivStyle}>
            <FormControl type="text" placeholder="insert new memo" ref="editInput" />
          </div>​

        </FormGroup>
      </form>
      </div>
        );
    }

      onSaveClick(event) {
        event.preventDefault();

        const task = ReactDOM.findDOMNode(this.refs.editInput).value;
        const rootRef = firebase.database().ref().child('doors').child(this.props.doorid);
        const doorRef = rootRef.child('memos');
        doorRef.push({
          task,
        }
        );
        ReactDOM.findDOMNode(this.refs.editInput).value = '';
    }
    deleteTask(taskToDelete) {
        const rootRef = firebase.database().ref().child('doors').child(this.props.doorid);
        const doorRef = rootRef.child('memos');
        const memoRef = doorRef.child(taskToDelete);
        memoRef.remove();
    }
}