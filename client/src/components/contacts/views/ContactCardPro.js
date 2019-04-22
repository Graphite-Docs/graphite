import React, { Component } from 'reactn';
import { Input } from 'semantic-ui-react';

class ContactCardFree extends Component {
  render() {
      const { name, contact } = this.props;
      return (
         <div className="contact-details-pro">
            <div className="line"><span className="label-item">Blockstack ID</span><div style={{marginLeft: "10px"}}>{name ? name : "Not a Blockstack User"}</div></div>
            <div className="line"><span className="label-item">Name</span><div><Input type="text" value={contact.name ? contact.name :  "Anonymous"} /></div></div>
            <div className="line"><span className="label-item">Email</span><div><Input type="text" value={contact.emailAddress ? contact.emailAddress : ""} /></div></div>
            <div className="line"><span className="label-item">Website</span><div><Input type="text" value={contact.website ? contact.website : ""} /></div></div>
            <div className="line"><span className="label-item">Address Line 1</span><div><Input type="text" value={contact.addressLine1 ? contact.addressLine1 : ""} /></div></div>
            <div className="line"><span className="label-item">Address Line 2</span><div><Input type="text" value={contact.addressLine2 ? contact.addressLine2 : ""} /></div></div>
            <div className="line"><span className="label-item">City</span><div><Input type="text" value={contact.city ? contact.city : ""} /></div></div>
            <div className="line"><span className="label-item">Region</span><div><Input type="text" value={contact.region ? contact.region : ""} /></div></div>
            <div className="line"><span className="label-item">Country</span><div><Input type="text" value={contact.country ? contact.country : ""} /></div></div>
        </div>
       );
  }
}

export default ContactCardFree;
