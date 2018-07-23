import React, { Component } from 'react';

export default class Timer extends Component {

  constructor() {
    super();
    this.state = {
      time: {},
      seconds: 10
    };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      "h": hours,
      "m": minutes,
      "s": seconds
    };
    return obj;
  }

  componentDidMount() {
    let timeLeftVar = this.secondsToTime(this.state.seconds);
    this.setState({ time: timeLeftVar });

    if (this.props.docLoaded === true && this.props.yjsConnected === true) {
      console.log('in timer, docLoaded and yjsConnected, so starting timer...')
      this.startTimer() //calling function once component mounted...
    }
  } // end of componentDidMount

  componentDidUpdate() {
    if (this.props.docLoaded === true && this.props.yjsConnected === true) {
      console.log('in timer, docLoaded and yjsConnected, so starting timer...')
      this.startTimer() //calling function again once component updated...
    }
  } // end of componentDidUpdate

  componentWillUnmount() {
    clearInterval(this.timer) //need this to stop getting warning in console.
  }

  startTimer() {
    if (this.timer === 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds - 1;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds,
    });

    // Check if we're at zero.
    if (seconds === 0) {
      clearInterval(this.timer);
      this.props.timeUp() //calling this when clock gets to zero
    }
  }

  render() {
    return(
      <div>
        {/* <button onClick={this.startTimer}>Start</button> */}
        {/* m: {this.state.time.m}  */}
        seconds: {this.state.time.s}
      </div>
    );
  }
}
