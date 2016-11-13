import React from 'react';
import { Checkbox } from 'react-bootstrap';

var tdStyle = {
  textAlign: 'left'
};

export default class MemoItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    };
  }


  render() {
    const { index, task } = this.props;
    return (
      <tr>
       <td> <Checkbox onClick={this.props.deleteTask.bind(this, index)}> </Checkbox></td>
       <td style={tdStyle}> {task } </td>
       {/*<td> <Button bsStyle="primary">Delete </Button> </td> */}
      </tr>
    );
  }

    onCheckClick(event) {
        console.log(event);
    }
}