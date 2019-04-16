import React, { Component } from 'reactn';
import { Link } from 'react-router-dom';
import {Menu as MainMenu} from 'semantic-ui-react';
import { Button, Container, Icon } from 'semantic-ui-react';
import { deleteDoc } from '../helpers/documents';

class DeleteDoc extends Component {

  render() {
    const { singleDoc } = this.global;
      return (
        <div>
          <MainMenu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <MainMenu.Item>
              <Link style={{color: "#fff"}} to={`/documents/${singleDoc.id}`}>
                <Icon name='arrow left' />
              </Link>
            </MainMenu.Item>
            <MainMenu.Item>
              Delete "{singleDoc.title}"?
            </MainMenu.Item>
            </MainMenu>
            <div className="margin-top-85">
              <div className='doc-card'>
                <div className="double-space doc-margin">
                  <Container className="center">
                    <h1>Delete "{singleDoc.title}"?</h1>
                    <Link to={`/documents`}><Button onClick={() => deleteDoc(singleDoc)} color="red">Yes, Delete</Button></Link>
                    <Link to={`/documents/${singleDoc.id}`}><Button>No, Go Back</Button></Link>
                  </Container>
                </div>
              </div>
            </div>
        </div>
       );
  }
}

export default DeleteDoc;
