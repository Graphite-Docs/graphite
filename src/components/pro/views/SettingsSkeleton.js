import React, { Component } from 'reactn';
import { List, Container } from 'semantic-ui-react';
import Nav from '../../shared/views/Nav';

class SettingsSkeleton extends Component {
  render() {
      return (
        <div>
            <Nav />
            <div className="settings-side">
                <List>
                    <List.Item>
                        <div className="black-skel-div"></div>
                    </List.Item>
                    <List.Item>
                      <div className="black-skel-div"></div>
                    </List.Item>
                    <List.Item>
                      <div className="black-skel-div"></div>
                    </List.Item>
                </List>
            </div>
            <div className="settings-main-container">
                <Container style={{paddingLeft: "45px"}}>
                  <div className="padding-top-30">
                    <div className="grey-skel-div center"></div>
                  </div>
                </Container>
            </div>
        </div>
       );
  }
}

export default SettingsSkeleton;
