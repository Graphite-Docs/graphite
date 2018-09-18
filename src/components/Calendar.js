import React, { Component } from "react";
import Header from './Header';
var elmnt1;
var elemt2;

export default class Calendar extends Component {

  componentDidMount() {
    elmnt1 = document.getElementById("outer").offsetHeight;
    elemt2 = document.getElementById("inner").offsetHeight;
  }

  render() {
    if(elemt2 > elmnt1) {
      alert('Bang!')
    }

    return(
      <div>
        <Header />
        <div id="outer" className="card full-page">
          <textarea className="materialize-textarea" id="inner">
          </textarea>
        </div>
      </div>
    )
  }
}
