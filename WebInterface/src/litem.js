import React from 'react';
import {  ListGroupItem } from 'react-bootstrap';

export default class Litem extends React.Component {

    render() {
        return (
           <ListGroupItem onClick={this.props.chooseDoor.bind(this,this.props.item)}>
            {this.props.item}
           </ListGroupItem>
        );
    }
}