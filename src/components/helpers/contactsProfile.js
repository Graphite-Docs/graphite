import {
  loadUserData,
  getFile,
  lookupProfile
} from 'blockstack';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export function profileLoad() {
  this.setState({receiver: loadUserData().username});
  let info = loadUserData().profile;
  if(info.image) {
    this.setState({ userImg: info.image[0].contentUrl});
  } else {
    this.setState({ userImg: avatarFallbackImage});
  }

  getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("Contacts are here");
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
         let contact = this.state.contacts;
         const thisContact = contact.find((a) => { return a.contact === contact});
         this.setState({ conversationUser: thisContact && thisContact.contact});
       } else {
         console.log("No contacts");
       }
     })
      .catch(error => {
        console.log(error);
      });
    this.fetchContactData();
    this.refresh = setInterval(() => this.fetchContactData(), 1000);
}

export function fetchContactData() {
const username = window.location.href.split('profile/')[1];

  lookupProfile(username, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      let image = profile.image;
      if(image) {
        this.setState({ img: image[0].contentUrl });
      } else {
        this.setState({ img: avatarFallbackImage });
      }
      this.setState({
        username: username,
        name: profile.name,
        description: profile.description,
        accounts: profile.accounts
      })
    })
    .catch((error) => {
      console.log('could not resolve profile')
    })
}
