import React, { Component } from 'reactn';
import { Modal, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class ContactCardFree extends Component {
  render() {
      const { name, contact } = this.props;
      return (
         <div className="contact-details">
            <Modal closeIcon size='small' trigger={<Button style={{float: "right"}}>Edit Contact Info</Button>}>
                <Modal.Header>Ready to get more?</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <p>With Graphite Pro, you can update information about your contacts, including addresses, email, websites, and more. <Link to={'/trial'}>Try it free for 30 days.</Link></p>
                        <Link to={'/trial'}><Button secondary>Try Graphite Pro Free</Button></Link>
                    </Modal.Description>
                </Modal.Content>
            </Modal>
            <div className="line"><span className="label-item">Blockstack ID</span><div>{name ? name : "Not a Blockstack User"}</div></div>
            <div className="line"><span className="label-item">Name</span><div>{contact.name ? contact.name :  "Anonymous"}</div></div>
            <div className="line"><span className="label-item">Email</span><div>{contact.emailAddress ? contact.emailAddress : ""}</div></div>
            <div className="line"><span className="label-item">Website</span><div>{contact.website ? contact.website : ""}</div></div>
            <div className="line"><span className="label-item">Address Line 1</span><div>{contact.addressLine1 ? contact.addressLine1 : ""}</div></div>
            <div className="line"><span className="label-item">Address Line 2</span><div>{contact.addressLine2 ? contact.addressLine2 : ""}</div></div>
            <div className="line"><span className="label-item">City</span><div>{contact.city ? contact.city : ""}</div></div>
            <div className="line"><span className="label-item">Region</span><div>{contact.region ? contact.region : ""}</div></div>
            <div className="line"><span className="label-item">Country</span><div>{contact.country ? contact.country : ""}</div></div>
        </div>
       );
  }
}

export default ContactCardFree;
