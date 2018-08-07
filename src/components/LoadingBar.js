import React, { Component } from "react";

export default class LoadingBar extends Component {


  render() {
    return (
      <div className="progress">
          <div className="indeterminate"></div>
      </div>
    );
  }
}
