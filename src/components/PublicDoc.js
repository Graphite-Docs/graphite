import React, { Component, Link } from 'react';
import Header from './Header';
import axios from 'axios';

export default class PublicDoc extends Component {

  constructor(props) {
  	super(props);
    this.state = {
      gaiaLink: "",
      title: "",
      content: "",
      view: false
    }
    this.fetchData = this.fetchData.bind(this);
    this.handleLinkChange = this.handleLinkChange.bind(this);
    this.sendLink = this.sendLink.bind(this);
    this.newLink = this.newLink.bind(this);
  }

  componentDidMount() {
    // this.refresh = setInterval(() => this.fetchData(), 1000);
  }

  fetchData() {
    axios
      .get(
        this.state.gaiaLink
      )
      .then(res => {
        this.setState({ title: res.data.title, content: res.data.content})
        console.log(res.data);
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleLinkChange(e) {
    this.setState({
      gaiaLink: e.target.value
    });
  }

  sendLink() {
    this.fetchData();
    this.setState({ view: true })
  }

  newLink() {
    this.setState({ view: false, gaiaLink: "" })
  }

  renderView() {

    if (this.state.view == false) {
      return(
        <div>
        <h2>Enter the link shared with you</h2>
          <input placeholder="Public Link" type="text" onChange={this.handleLinkChange} />
          <button className="btn" onClick={this.sendLink}>View Document</button>
        </div>
      )

    } else {
      return (
        <div>
        <div className="card sharing-notice">
          <p>This is Graphite's public sharing feature. Public sharing is view-only. If you'd like to edit this document and collaborate, <a href="https://app.graphite.com" target="_blank">sign into Graphite or create an account.</a></p>
          <button className="btn" onClick={this.newLink}>Enter New Share Link</button>
        </div>
        <div />
        <div className="card doc-card">
          <div className="double-space doc-margin">
          <div
            className="print-view no-edit center-align"
            dangerouslySetInnerHTML={{ __html: this.state.title }}
            />
            <div
            className="print-view no-edit"
            dangerouslySetInnerHTML={{ __html: this.state.content }}
            />
          </div>
          </div>
        </div>
      )

    }
  }

  render() {
    console.log(this.state.gaiaLink);
    return (
      <div>
      <Header />
        <div className="container">
          {this.renderView()}
        </div>
      </div>
    );
  }

}
