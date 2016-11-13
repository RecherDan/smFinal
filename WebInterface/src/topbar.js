import React from 'react';
import { Nav, Navbar, NavItem,ButtonGroup, Button } from 'react-bootstrap';
const smlogo = "./smartdoor.png";

export default class Topbar extends React.Component {
    constructor() {
      super();
      this.state = {
        navExpanded: false
      } 
    }
    render() {
        return (
          <Navbar inverse={false} onToggle={this.setNavExpanded.bind(this)} expanded={this.state.navExpanded}>
            <Navbar.Header>
              <Navbar.Brand>
                <a onClick={this.props.pagechange.bind(this,"main")} className="App-link"><img alt="Brand" src={smlogo} className="App-smlogo" /> {this.props.door}  SmartDoor </a>

              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav onSelect={this.closeNav.bind(this)}>
                <NavItem><ButtonGroup bsSize="xsmall"><Button bsStyle="info" onClick={this.props.doorchange.bind(this)}>Change Door</Button></ButtonGroup></NavItem>
                <NavItem eventKey={1}  onClick={this.props.pagechange.bind(this,"settings")}>Settings</NavItem>
                <NavItem eventKey={2}  onClick={this.props.pagechange.bind(this,"logs")}>Logs</NavItem>
                <NavItem eventKey={3}  onClick={this.props.pagechange.bind(this,"help")}>Help</NavItem>
              </Nav>
            </Navbar.Collapse>
        

          </Navbar>
        );
    }

    setNavExpanded(expanded) {
        
        this.setState({ navExpanded: expanded });
        
    }
    closeNav() {
     this.setState({ navExpanded: false });
    }
}