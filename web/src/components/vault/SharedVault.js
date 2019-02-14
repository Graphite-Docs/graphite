import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from '../shared/Header';
import { Container, Grid, Item } from 'semantic-ui-react';
import Loading from '../shared/Loading';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedVault extends Component {

  componentDidMount() {
    this.props.loadVaultContacts();
  }

  renderView() {
    const { contacts, loading } = this.props;

    if(!loading) {
      return(
      <div style={{marginTop: "45px", textAlign: "center"}}>
        <div className="container center-align">
          <h3>Files Shared With Me</h3>
          <h5>Select the contact who shared with you</h5>
        </div>
        <Grid style={{maxWidth: "85%", margin: "auto"}} relaxed columns={2}>
          {contacts.slice(0).reverse().map(contact => {
            let imageLink;
            let name;
            if(contact.img) {
              imageLink = contact.img;
            } else {
              imageLink = avatarFallbackImage;
            }

            if(contact.name) {
              name = contact.name;
            } else {
              name = "";
            }
              return (
                <Grid.Column style={{textAlign: "center"}} key={contact.contact}>
                  <Item.Group>
                    <Item className="contacts-items">
                      <Link to={'/vault/shared/'+ contact.contact}>
                        <Item.Image size='tiny' src={imageLink} />
                        <Item.Content>
                          <Item.Header>{contact.contact}</Item.Header>
                          <Item.Meta>{name}</Item.Meta>
                        </Item.Content>
                      </Link>
                    </Item>
                  </Item.Group>
                </Grid.Column>
              )
            })
          }
          </Grid>
      </div>
    );
    } else {
      return (
      <Loading />
    );
    }
  }


  render() {
      return (
        <div>
          <Header />
          <Container>
            {this.renderView()}
          </Container>
        </div>
      );
    }

}
