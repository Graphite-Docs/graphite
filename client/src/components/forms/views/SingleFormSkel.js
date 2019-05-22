import React, { Component } from 'reactn';
import { List, Container, Menu, Icon } from 'semantic-ui-react';

class SingleFormSkel extends Component {
  render() {
      return (
        <div>
            <Menu className='loading-nav-editor item-menu' style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <Menu.Item>
                <Icon name='arrow left' />
            </Menu.Item>
            <Menu.Item>
                <span className='title-skel-div'></span>
            </Menu.Item>
            </Menu>
            <div style={{paddingTop: "120px"}} className="settings-side">
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
            <div style={{paddingTop: "120px"}} className="settings-main-container">
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

export default SingleFormSkel;
