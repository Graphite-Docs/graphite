import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedVault extends Component {

  componentDidMount() {
    this.props.loadVaultContacts();
  }

  renderView() {
    const { show, contacts, sharedWithMe } = this.props;

    if(sharedWithMe === true) {
      return(
      <div className={show}>
        <div className="container center-align">
          <h3>Files Shared With Me</h3>
          <h5>Select the contact who shared with you</h5>
        </div>

        <div className="container">

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
              <ul className="collection">
                <li key={contact.contact} className="collection-item avatar">
                  <Link to={'/vault/shared/'+ contact.contact}>
                    <img src={imageLink} alt="Profile" className="circle" />
                    <span className="title">{contact.contact}</span>
                    <p>{name}</p>
                  </Link>
                </li>
              </ul>
            )
          })
        }
        </div>
      </div>
    );
    } else {
      return (
      <div className={show}>
        <div className="container center-align">
          <h3>Files Shared With Others</h3>
          <h5 >Select the contact you shared with</h5>
        </div>

        <div className="container">

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
              <ul className="collection">
                <li key={contact.contact} className="collection-item avatar">
                  <Link to={'/vault/sent/'+ contact.contact}>
                    <img src={imageLink} alt="Profile" className="circle" />
                    <span className="title">{contact.contact}</span>
                    <p>{name}</p>
                  </Link>
                </li>
              </ul>
            )
          })
        }
        </div>
      </div>
    );
    }
  }


  render() {
      return (
        <div>
        <Header />
        <div className="shared-docs-page">

        </div>
        {this.renderView()}
      </div>
      );
    }

}
