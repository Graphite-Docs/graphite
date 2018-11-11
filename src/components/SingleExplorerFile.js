import React, { Component } from "react";
import {
  getFile,
  loadUserData
} from 'blockstack';
import ReactJson from 'react-json-view'
import { Link } from 'react-router-dom';
import { Container, Icon } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';


export default class SingleExplorerFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {}
    }
  }

  componentDidMount() {
    getFile(window.location.href.split('explorer/')[1], {decrypt: true})
      .then((fileContents) => {
        this.setState({file: JSON.parse(fileContents)})
      })
  }

  render(){
    const {file} = this.state;
    return(
      <div>

      <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
        <MainMenu.Item>
          <Link style={{color: "#fff"}} to={'/explorer'}><Icon name='arrow left' />Back to Explorer</Link>
        </MainMenu.Item>
        </MainMenu>

        <Container style={{marginTop: "65px"}}>
          <h5>Your file</h5>
          <p>See the file in your storage hub <a target="_blank" href={loadUserData().profile.apps[window.location.origin] + window.location.href.split('explorer/')[1]}>here</a></p>

          <ReactJson src={file} />
        </Container>
      </div>
    )
  }
}
