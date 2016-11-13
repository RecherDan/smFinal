import React from 'react';

export default class Footer extends React.Component {


    render() {
        return (
        <footer className="footer">
          <div className="container">
            <p>
            <span className="glyphicon glyphicon-copyright-mark" aria-hidden="true"></span>
              SmartDoor By: Dan Recher, Ori Nitzan
            </p>
          </div>
        </footer>
        );
    }
}