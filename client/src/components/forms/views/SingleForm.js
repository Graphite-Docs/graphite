import React, { Component } from 'reactn';
import { loadForm } from '../helpers/singleForm';
import { Icon, Input, Container, Popup } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import {Menu as MainMenu} from 'semantic-ui-react';
import EditForm from './EditForm';
import Responses from './Responses';
import SingleFormSkel from './SingleFormSkel';
const single = require('../helpers/singleForm');

class SingleForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: "Edit Form"
    }
  }

  componentDidMount() {
    const id = window.location.href.includes('new') ? window.location.href.split('new/')[1] : window.location.href.split('forms/')[1];
    loadForm(id);
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
      const { singleForm, formLoading } = this.global;
      const { activeItem } = this.state;
      if(formLoading === true) {
        return (
          <SingleFormSkel />
        )
      } else {
        return (
          <div>
            <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
              <MainMenu.Item>
                <Link style={{color: "#fff"}} to={'/forms'}>
                  <Icon name='arrow left' />
                </Link>
              </MainMenu.Item>
              <MainMenu.Item>
                <Input placeholder="Give it a title" value={singleForm.title} onChange={single.handleTitle} type="text"/> 
              </MainMenu.Item>
                <MainMenu.Item
                    name='Edit Form'
                    active={activeItem === 'Edit Form'}
                    onClick={this.handleItemClick}
                >
                  <Icon name="edit" /> Edit Form
                </MainMenu.Item>
                <MainMenu.Item name='Responses' active={activeItem === 'Responses'} onClick={this.handleItemClick}>
                  <Icon name="comment outline" /> Responses
                </MainMenu.Item>
                <MainMenu.Item>
                  <Popup
                    trigger={<Icon name='linkify' />}
                    content='Link to form'
                    offset='0, 50px'
                    position='bottom center'
                  />
                </MainMenu.Item>
                <MainMenu.Item>
                  <Popup
                    trigger={<Icon name='code' />}
                    content='Embed form'
                    offset='0, 50px'
                    position='bottom center'
                  />
                </MainMenu.Item>
              </MainMenu>
              <div style={{marginTop: "125px", marginBottom: "45px"}}>
                <Container>
                  
                  {
                    activeItem === "Edit Form" ? 
                    <EditForm 
                      singleForm={singleForm}
                    /> : 
                    <Responses />
                  }
                </Container>
              </div>
          </div>
         );
      }
  }
}

export default SingleForm;
