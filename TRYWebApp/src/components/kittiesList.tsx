import React, { Component } from "react";

class Item extends Component {
  state = {
    listitems: ['List Item 1','List Item 2', 'List Item 3']
  };

  render() {
    return (
      <React.Fragment>
        <ul>
          {this.state.listitems.map(listitem => (
            <li
              key={listitem}
            >
              {listitem}
            </li>
          ))}
        </ul>
      </React.Fragment>
    );
  }
}

export default Item;