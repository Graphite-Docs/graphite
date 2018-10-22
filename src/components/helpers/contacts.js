import {
  getFile,
  putFile,
  lookupProfile
} from 'blockstack';
import {
  getMonthDayYear
} from './getMonthDayYear';
import axios from 'axios';
import update from 'immutability-helper';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export function loadContactsCollection() {
  getFile("contact.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
       this.setState({ filteredContacts: this.state.contacts });
     } else {
       console.log("No contacts");
     }
   })
    .catch(error => {
      console.log(error);
    });
}

export function addNewContact() {
  this.setState({ add: true});
}

export function handleAddContact(props) {
  const object = {};
  lookupProfile(props, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      console.log(profile);
      object.contact = props;
      profile.image ? object.img = profile.image[0].contentUrl : object.img = avatarFallbackImage;
      object.name = profile.name;
      object.dateAdded = getMonthDayYear();
      object.types = [];
      object.fileType = "contacts";
      this.setState({ showResults: "hide", loading: "", show: "hide", confirmAdd: false })
      this.setState({ contacts: [...this.state.contacts, object], add: false });
      this.setState({ filteredContacts: this.state.contacts });
      setTimeout(this.saveNewContactsFile, 500);
    })
    .catch((error) => {
      console.log(error)
    })
}

export function saveNewContactsFile() {
  putFile("contact.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      this.setState({loading: "hide", show: "" });
    })
    .catch(e => {
      console.log(e);
    });
}

export function handleNewContact(e) {
    this.setState({ newContact: e.target.value })
    let link = 'https://core.blockstack.org/v1/search?query=';
    axios
      .get(
        link + e.target.value
      )
      .then(res => {
        if(res.data.results.length > 0){
          this.setState({ results: res.data.results });
        } else {
          this.setState({ results: [] })
          lookupProfile(this.state.newContact, "https://core.blockstack.org/v1/names")
            .then((profile) => {
              console.log(profile);
              this.setState({ manualResults: profile });
            })
            .catch((error) => {
              console.log('could not resolve profile')
            })
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  export function handleManualAdd(e) {
    this.setState({ showResults: "hide", loading: "", show: "hide", confirmManualAdd: false })
    console.log("adding...");
    const object = {};
    object.contact = this.state.addContact;
    object.img = this.state.newContactImg;
    object.name = this.state.name;
    object.dateAdded = getMonthDayYear();
    object.types = [];
    let link = 'https://core.blockstack.org/v1/names/' + object.contact;
    axios
      .get(
        link
      )
      .then(res => {
        if(res.data.zonefile.indexOf('https://blockstack.s3.amazonaws.com/') >= 0){
          window.Materialize.toast(object.contact + " is a legacy Blockstack ID and cannot access Graphite.", 3000);
        } else {
          this.setState({ contacts: [...this.state.contacts, object], add: false });
          this.setState({ filteredContacts: this.state.contacts });
          setTimeout(this.saveNewContactsFile, 500);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  export function manualAdd() {
    lookupProfile(this.state.newContact, "https://core.blockstack.org/v1/names")
      .then((profile) => {
          console.log(profile);
          const object = {};
          object.contact = this.state.newContact;
          if(profile.image) {
            object.img = profile.image[0].contentUrl;
          } else {
            object.img = avatarFallbackImage;
          }
          if(profile.name) {
            object.name = profile.name;
          } else {
            object.name = "";
          }
          object.types = [];
          object.dateAdded = getMonthDayYear();
          this.setState({ contacts: [...this.state.contacts, object], add: false });
          this.setState({ filteredContacts: this.state.contacts });
          setTimeout(this.saveNewFile, 500);
      })
      .catch((error) => {
        console.log('could not resolve profile')
        window.Materialize.toast("That ID was not found. Please make sure you are typing the full ID.", 3000);
      })

  }

export function filterContactsList(event){
  var updatedList = this.state.contacts;
  updatedList = updatedList.filter(function(item){
    return item.contact.toLowerCase().search(
      event.target.value.toLowerCase()) !== -1;
  });
  this.setState({filteredContacts: updatedList});
}

export function handleContactsCheckbox(event) {
    let checkedArray = this.state.contactsSelected;
      let selectedValue = event.target.value;

        if (event.target.checked === true) {
        	checkedArray.push(selectedValue);
            this.setState({
              contactsSelected: checkedArray
            });
          if(checkedArray.length === 1) {
            this.setState({activeIndicator: true});

          } else {
            this.setState({activeIndicator: false});
          }
        } else {
          this.setState({activeIndicator: false});
        	let valueIndex = checkedArray.indexOf(selectedValue);
			      checkedArray.splice(valueIndex, 1);

            this.setState({
              contactsSelected: checkedArray
            });
            if(checkedArray.length === 1) {
              this.setState({activeIndicator: true});
            } else {
              this.setState({activeIndicator: false});
            }
        }
  }

  export function setTypes(e) {
    this.setState({ type: e.target.value});
  }

export function handleContactsKeyPress(e) {
    if (e.key === 'Enter') {
      this.setState({ types: [...this.state.types, this.state.type]});
      this.setState({ type: "" });
    }
  }

  export function addTypeManual(){
    this.setState({ types: [...this.state.types, this.state.type]});
    this.setState({ type: "" });
  }

  export function loadSingleTypes() {
    window.$('#typeModal').modal('open');
    this.setState({typeDownload: false});
    getFile("contact.json", {decrypt: true})
    .then((fileContents) => {
      this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
      this.setState({ filteredContacts: this.state.contacts });
    }).then(() =>{
      let contacts = this.state.contacts;
      const thisContact = contacts.find((contact) => { return contact.contact === this.state.contactsSelected[0]});
      let index = thisContact && thisContact.contact;
      function findObjectIndex(contact) {
          return contact.contact === index;
      }
      if(thisContact && thisContact.types) {
        this.setState({index: contacts.findIndex(findObjectIndex), newContactImg: thisContact && thisContact.img, types: thisContact && thisContact.types, name: thisContact && thisContact.name, contact: thisContact && thisContact.contact, dateAdded: thisContact && thisContact.dateAdded });
      } else {
        this.setState({index: contacts.findIndex(findObjectIndex), newContactImg: thisContact && thisContact.img, types: [], name: thisContact && thisContact.name, contact: thisContact && thisContact.contact, dateAdded: thisContact && thisContact.dateAdded });
      }

    })
     .then(() => {
       this.setState({ typeModal: ""});
     })
      .catch(error => {
        console.log(error);
      });
  }

  export function saveNewTypes() {
    this.setState({ loadingTwo: ""});
    const object = {};
    object.contact = this.state.contact;
    object.name = this.state.name;
    object.dateAdded = this.state.dateAdded;
    object.types = this.state.types;
    object.img = this.state.newContactImg;
    const index = this.state.index;
    const updatedContact = update(this.state.contacts, {$splice: [[index, 1, object]]});
    this.setState({contacts: updatedContact, filteredContacts: updatedContact });
    setTimeout(this.saveFullCollectionTypes, 500);
  }

  export function saveFullCollectionTypes() {
    window.$('#typeModal').modal('close');
    putFile("contact.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("Saved");
        this.setState({typeModal: "hide", type: "", loadingTwo: "hide"})
        this.loadContactsCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

export function handleContactsPageChange(event) {
  this.setState({
    currentPage: Number(event.target.id)
  });
}

export function deleteType(props) {
  this.setState({ deleteState: false });

  let types = this.state.types;
  const thisType = types.find((type) => { return type.id === props});
  let typeIndex = thisType && thisType.id;
  function findObjectIndex(type) {
      return type.id === typeIndex;
  }
  this.setState({ typeIndex: types.findIndex(findObjectIndex) });
  const updatedTypes = update(this.state.types, {$splice: [[this.state.typeIndex, 1]]});
  this.setState({types: updatedTypes });
}

export function applyContactsFilter() {
    this.setState({ applyFilter: false });
    setTimeout(this.filterNow, 500);
    console.log(this.state.selectedType);
  }

  export function dateFilterContacts(props) {
    let contacts = this.state.contacts;
    let dateFilter = contacts.filter(x => x.dateAdded.includes(props));
    this.setState({ filteredContacts: dateFilter, appliedFilter: true});
    window.$('.button-collapse').sideNav('hide');
  }

  export function typeFilter(props) {
    let contacts = this.state.contacts;
    let tagFilter = contacts.filter(x => typeof x.types !== 'undefined' ? x.types.includes(props) : console.log(""));
    this.setState({ filteredContacts: tagFilter, appliedFilter: true});
    window.$('.button-collapse').sideNav('hide');
  }

  export function clearContactsFilter() {
    this.setState({ appliedFilter: false, filteredContacts: this.state.contacts});
  }

  export function filterContactsNow() {
    let contacts = this.state.contacts;

    if(this.state.selectedType !== "") {
      let typeFilter = contacts.filter(x => typeof x.types !== 'undefined' ? x.types.includes(this.state.selectedType) : console.log("nada"));
      // let typeFilter = contacts.filter(x => x.types.includes(this.state.selectedType));
      this.setState({ filteredContacts: typeFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (this.state.selectedDate !== "") {
      let dateFilter = contacts.filter(x => typeof x.dateAdded !== 'undefined' ? x.dateAdded.includes(this.state.selectedDate) : console.log("nada"));
      // let dateFilter = contacts.filter(x => x.dateAdded.includes(this.state.selectedDate));
      this.setState({ filteredContacts: dateFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    }
  }
