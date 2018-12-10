import React, { Component } from "react";
import Header from './Header';



export default class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    }
  }

  onChange = date => this.setState({ date })


  render() {

    return(
      <div>
        <Header />
        <div className="main">
      
        </div>
      </div>
    )
  }
}
