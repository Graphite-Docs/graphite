import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from '../shared/Header';
import { Grid, Item } from 'semantic-ui-react';
import Loading from '../shared/Loading';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedDocs extends Component {

  render() {
    const { loading, contacts } = this.props;
    let contactsList;
    if(contacts) {
      contactsList = contacts;
    } else {
      contactsList = [];
    }


    if(!loading) {
      return(
      <div>
      <Header />
      <div style={{marginTop: "45px", textAlign: "center"}}>
        <div className="container center-align">
          <h3>Documents Shared With Me</h3>
          <h5>Select the contact who shared with you</h5>
        </div>
        <Grid style={{maxWidth: "85%", margin: "auto"}} relaxed columns={2}>
          {contactsList.slice(0).reverse().map(contact => {
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
                      <Link to={'/documents/shared/'+ contact.contact}>
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
      </div>
    );
    } else {
      return (
      <Loading />
    );
    }
  }

}
//TODO add this back when you enable public sharing
// <div className="card center-align shared">
//   <h6>Enter the Blockstack user ID of the person who shared the file(s) with you</h6>
//   <input className="" placeholder="Ex: JohnnyCash.id" type="text" onChange={this.handleIDChange} />
//   <div className={hideButton}>
//     <Link to={fullLink}><button className="btn black">Find Files</button></Link>
//   </div>
//   <div className={loading}>
//     <div className="preloader-wrapper small active">
//         <div className="spinner-layer spinner-green-only">
//           <div className="circle-clipper left">
//             <div className="circle"></div>
//           </div><div className="gap-patch">
//             <div className="circle"></div>
//           </div><div className="circle-clipper right">
//             <div className="circle"></div>
//           </div>
//         </div>
//       </div>
//     </div>
// </div>
