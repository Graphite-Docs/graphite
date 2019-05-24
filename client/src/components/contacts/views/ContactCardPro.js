import React, { Component, setGlobal } from 'reactn';
import { Input, Button } from 'semantic-ui-react';
import { saveContact } from '../helpers/singleContact';

class ContactCardPro extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      website: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      country: "",
      postalCode: "", 
      phone: "",
      image: ""
    }
  }

  componentDidMount() {
    const { contact } = this.global;
    this.setState({
      id: contact.id || contact.contact,
      name: contact.name,
      emailAddress: contact.emailAddress,
      website: contact.website,
      addressLine1: contact.addressLine1,
      addressLine2: contact.addressLine2,
      city: contact.city,
      region: contact.region,
      country: contact.country,
      postalCode: contact.postalCode,
      phone: contact.phone,
      dateAdded: contact.dateAdded,
      fileType: contact.fileType,
      notes: contact.notes,
      image: contact.image || contact.img,
      socialAccounts: contact.socialAccounts,
      types: contact.types
    })
  }
  handleChange = (e, field) => {
    // clearTimeout(timer); 
    // timer = setTimeout(() => saveContact(this.state), 2000);
    if(field === "name") {
      this.setState({name: e.target.value});
    } else if(field === "email") {
      this.setState({ emailAddress: e.target.value });
    } else if(field === "website") {
      this.setState({ website: e.target.value });
    } else if(field === "addressLine1") {
      this.setState({ addressLine1: e.target.value });
    } else if(field === "addressLine2") {
      this.setState({ addressLine2: e.target.value });
    } else if(field === "city") {
      this.setState({ city: e.target.value });
    } else if(field === "region") {
      this.setState({ region: e.target.value });
    } else if(field === "country") {
      this.setState({ country: e.target.value });
    } else if(field === "postalCode") {
      this.setState({ postalCode: e.target.value });
    } else if(field === "phone") {
      this.setState({ phone: e.target.value });
    }
  }
  renderEdit() {
    const { contact } = this.props;
    const { name, emailAddress, phone, website, addressLine1, addressLine2, region, country, postalCode, city } = this.state;
    return (
       <div className="contact-details-pro">
          <Button onClick={() => saveContact(this.state)} style={{float: "right"}} secondary>Save Contact Info</Button> : 
          <div className="line"><span className="label-item">Blockstack ID</span><div style={{marginLeft: "10px"}}>{contact.id || contact.contact ? contact.id || contact.contact : "Not a Blockstack User"}</div></div>
          <div className="line"><span className="label-item">Name</span><div><Input onChange={(e) => this.handleChange(e, 'name')} type="text" value={name ? name :  "Anonymous"} /></div></div>
          <div className="line"><span className="label-item">Email</span><div><Input onChange={(e) => this.handleChange(e, 'email')} type="text" value={emailAddress ? emailAddress : ""} /></div></div>
          <div className="line"><span className="label-item">Phone</span><div><Input onChange={(e) => this.handleChange(e, 'phone')} type="text" value={phone ? phone : ""} /></div></div>
          <div className="line"><span className="label-item">Website</span><div><Input onChange={(e) => this.handleChange(e, 'website')} type="text" value={website ? website : ""} /></div></div>
          <div className="line"><span className="label-item">Address Line 1</span><div><Input onChange={(e) => this.handleChange(e, 'addressLine1')} type="text" value={addressLine1 ? addressLine1 : ""} /></div></div>
          <div className="line"><span className="label-item">Address Line 2</span><div><Input onChange={(e) => this.handleChange(e, 'addressLine2')} type="text" value={addressLine2 ? addressLine2 : ""} /></div></div>
          <div className="line"><span className="label-item">City</span><div><Input onChange={(e) => this.handleChange(e, 'city')} type="text" value={city ? city : ""} /></div></div>
          <div className="line"><span className="label-item">Region</span><div><Input onChange={(e) => this.handleChange(e, 'region')} type="text" value={region ? region : ""} /></div></div>
          <div className="line"><span className="label-item">Country</span><div><Input onChange={(e) => this.handleChange(e, 'country')} type="text" value={country ? country : ""} /></div></div>
          <div className="line"><span className="label-item">Postal Code</span><div><Input onChange={(e) => this.handleChange(e, 'postalCode')} type="text" value={postalCode ? postalCode : ""} /></div></div>
      </div>
     );
  }

  renderStatic() {
    const { contact } = this.props;
    const { contactEditing } = this.global;
      const { name, emailAddress, phone, website, addressLine1, addressLine2, region, country, postalCode, city } = this.state;
      return (
         <div className="contact-details-pro">
            {
              contactEditing === false ? 
              <Button onClick={() => setGlobal({ contactEditing: true })} style={{float: "right"}}>Edit Contact Info</Button> : 
              <div className="hide" />
            }
            <div className="line"><span className="label-item">Blockstack ID</span><div style={{marginLeft: "10px"}}>{contact.id || contact.contact ? contact.id || contact.contact : "Not a Blockstack User"}</div></div>
            <div className="line"><span className="label-item">Name</span><div>{name ? name :  "Anonymous"}</div></div>
            <div className="line"><span className="label-item">Email</span><div>{emailAddress ? emailAddress : ""}</div></div>
            <div className="line"><span className="label-item">Phone</span><div>{phone ? phone : ""}</div></div>
            <div className="line"><span className="label-item">Website</span><div>{website ? website : ""}</div></div>
            <div className="line"><span className="label-item">Address Line 1</span><div>{addressLine1 ? addressLine1 : ""}</div></div>
            <div className="line"><span className="label-item">Address Line 2</span><div>{addressLine2 ? addressLine2 : ""}</div></div>
            <div className="line"><span className="label-item">City</span><div>{city ? city : ""}</div></div>
            <div className="line"><span className="label-item">Region</span><div>{region ? region : ""}</div></div>
            <div className="line"><span className="label-item">Country</span><div>{country ? country : ""}</div></div>
            <div className="line"><span className="label-item">Postal Code</span><div>{postalCode ? postalCode : ""}</div></div>
        </div>
       );
  }

  render() {
    const { contactEditing } = this.global;
      if(contactEditing) {
        return(
          this.renderEdit()
        );
      } else {
        return(
          this.renderStatic()
        )
      }
  }
}

export default ContactCardPro;
