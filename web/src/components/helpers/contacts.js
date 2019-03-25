import { setGlobal, getGlobal } from 'reactn';
import {
  getFile,
  putFile,
  lookupProfile, 
  encryptContent, 
  decryptContent
} from 'blockstack';
import {
  getMonthDayYear
} from './getMonthDayYear';
import axios from 'axios';
import update from 'immutability-helper';
import { postToStorageProvider } from './storageProviders/post';
import { fetchFromProvider } from './storageProviders/fetch';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export async function loadContactsCollection() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  const global = getGlobal();
  setGlobal({ loading: true})
  if(authProvider === 'uPort') {
    const thisKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private

      //Create the params to send to the fetchFromProvider function.

      //The oauth token could be stored in two ways (for dropbox it's always a single access token)
      let token;
      if(localStorage.getItem('oauthData')) {
        if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
          token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
        } else {
          token = JSON.parse(localStorage.getItem('oauthData'))
        }
      } else {
        token = "";
      }
      
      const object = {
        provider: JSON.parse(localStorage.getItem('storageProvider')),
        token: token,
        filePath: '/contacts/contact.json'
      }
      // //Call fetchFromProvider and wait for response.
      let fetchFile = await fetchFromProvider(object);
      if(JSON.parse(localStorage.getItem('storageProvider')) === 'google') {
        if(fetchFile) {
          const decryptedContent = await JSON.parse(decryptContent(fetchFile, { privateKey: thisKey }))
          setGlobal({ contacts: decryptedContent, filteredContacts: decryptedContent, loading: false })
        } else {
          setGlobal({ loading: false })
        }
      } else {
        //Now we need to determine if the response was from indexedDB or an API call:
        if(fetchFile) {
          if(fetchFile.loadLocal || JSON.parse(localStorage.getItem('storageProvider')) === 'ipfs') {
            if(fetchFile.loadLocal) {
              console.log("Loading local instance first");
              const decryptedContent = await JSON.parse(decryptContent(JSON.parse(fetchFile.data.content), { privateKey: thisKey }))
              setGlobal({ contacts: decryptedContent, filteredContacts: decryptedContent, loading: false })
            } else {
              let content = fetchFile.data.pinataContent ? fetchFile.data.pinataContent : fetchFile.data;
              const decryptedContent = await JSON.parse(decryptContent(content.content, { privateKey: thisKey }))
              setGlobal({ contacts: decryptedContent, filteredContacts: decryptedContent, loading: false })
            }
          } else {
            //check if there is no file to load and set state appropriately.
            if(typeof fetchFile === 'string') {
              console.log("Nothing stored locally or in storage provider.")
              if(fetchFile.includes('error')) {
                console.log("Setting state appropriately")
                setGlobal({contacts: [], filteredContacts: [], loading: false})
              }
            } else {
              //No indexedDB data found, so we load and read from the API call.
              //Load up a new file reader and convert response to JSON.
              const reader = await new FileReader();
              var blob = fetchFile.fileBlob;
              reader.onloadend = async (evt) => {
                console.log("read success");
                const decryptedContent = await JSON.parse(decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey }))
                setGlobal({ contacts: decryptedContent, filteredContacts: decryptedContent, loading: false })
              };
              await console.log(reader.readAsText(blob));
            }
          }
      } else {
        setGlobal({ contacts: [], filteredContacts: [], loading: false }) //temporarily set loading to false here.
      }
    }
  } else {
    getFile("contact.json", {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        setGlobal({ contacts: JSON.parse(fileContents || '{}').contacts, types: [] });
        setGlobal({ filteredContacts: global.contacts });
      } else {
        console.log("No contacts");
      }
    })
    .then(() => {
      setGlobal({ loading: false})
    })
     .catch(error => {
       console.log(error);
       setGlobal({ loading: false})
     });
  }
}

export function addNewContact() {
  setGlobal({ add: true});
}

export function handleAddContact(props) {
  const global = getGlobal();
  setGlobal({loading: true})
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
      setGlobal({ 
        confirmAdd: false,
        contacts: [...global.contacts, object],
        filteredContacts: [...global.contacts, object],
        add: false
      }, () => {
        saveNewContactsFile();
      })
    })
    .catch((error) => {
      console.log(error)
      setGlobal({ loading: false })
    })
}

export function handleAddUPortContact(props) {
  const global = getGlobal();
  setGlobal({loading: true})
  const object = {
    contact: props.profile.did, 
    name: props.profile.name, 
    dateAdded: getMonthDayYear(),
    types: [], 
    img: props.profile.image ? props.profile.image : avatarFallbackImage,
    fileType: "contacts", 
    pubKey: props.publicKey
  }
  setGlobal({
    confirmAdd: false, 
    contacts: [...global.contacts, object], 
    filteredContacts: [...global.contacts, object]
  }, () => {
    saveNewContactsFile();
  })
}

export async function saveNewContactsFile() {
  const global = getGlobal();
  const authProvider = JSON.parse(localStorage.getItem('authProvider'))
  if(authProvider === 'uPort') {
    const publicKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
    const data = JSON.stringify(global.contacts);
    const encryptedData = await encryptContent(data, { publicKey: publicKey });
    const storageProvider = JSON.parse(localStorage.getItem("storageProvider"));
    let token;
    if(localStorage.getItem('oauthData')) {
      if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
        token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
      } else {
        token = JSON.parse(localStorage.getItem('oauthData'))
      }
    } else {
      token = "";
    }

    const params = {
      content: encryptedData,
      filePath: "/contacts/contact.json",
      provider: storageProvider,
      token: token, 
      update: getGlobal().contacts.length > 0 ? true : false
    };

    let postToStorage = await postToStorageProvider(params);
    console.log(postToStorage);
    setGlobal({loading: false})
  } else {
    putFile("contact.json", JSON.stringify(global), {encrypt: true})
    .then(() => {
      setGlobal({loading: false });
      loadContactsCollection();
    })
    .catch(e => {
      console.log(e);
    });
  }
}

export function handleNewContact(e) {
  const global = getGlobal();
    setGlobal({ newContact: e.target.value }, () => {
      let link = 'https://core.blockstack.org/v1/search?query=';
      axios
        .get(
          link + global.newContact
        )
        .then(res => {
          console.log('calling: ' + link + global.newContact)
          console.log(res.data);
          if(res.data.results){
            setGlobal({ results: res.data.results });
          } else {
            setGlobal({ results: []})
          }
        })
        .catch(error => {
          console.log(error);
        });
    })
  }

  export async function handleNewUportContact(e) {
    const global = getGlobal();
    setGlobal({newContact: e.target.value})
    //Need to query the mongo profile db and fall back to the IPFS database if necessary.
    //We should not query on every keystroke, so we need to set a timeout ->
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      const url = 'https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/contacts_lookup';
      await axios.post(url, JSON.stringify(global.newContact))
              .then((res) => {
                let results = res.data.filter(a => a.profile.name.includes(global.newContact))
                console.log(results)
                setGlobal({ results })
              }).catch(error => console.log(error));
    }, 1500);
  }

  export function handleManualAdd(e) {
    const global = getGlobal();
    setGlobal({ showResults: "hide", loading: "", show: "hide", confirmManualAdd: false })
    console.log("adding...");
    const object = {};
    object.contact = global.addContact;
    object.img = global.newContactImg;
    object.name = global.name;
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
          setGlobal({ contacts: [...global.contacts, object], add: false });
          setGlobal({ filteredContacts: global.contacts });
          setTimeout(saveNewContactsFile, 500);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  export function manualAdd() {
    const global = getGlobal();
    lookupProfile(global.newContact, "https://core.blockstack.org/v1/names")
      .then((profile) => {
          console.log(profile);
          const object = {};
          object.contact = global.newContact;
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
          setGlobal({ 
            contacts: [...global.contacts, object], 
            add: false, 
            filteredContacts: global.contacts
          }, () => {
            saveNewContactsFile();
          });
      })
      .catch((error) => {
        console.log('could not resolve profile')
        window.Materialize.toast("That ID was not found. Please make sure you are typing the full ID.", 3000);
      })

  }

export function filterContactsList(event){
  const global = getGlobal();
  var updatedList = global.contacts;
  updatedList = updatedList.filter(function(item){
    return item.contact.toLowerCase().search(
      event.target.value.toLowerCase()) !== -1;
  });
  setGlobal({filteredContacts: updatedList});
}

export function handleContactsCheckbox(event) {
  const global = getGlobal();
    let checkedArray = global.contactsSelected;
      let selectedValue = event.target.value;

        if (event.target.checked === true) {
        	checkedArray.push(selectedValue);
            setGlobal({
              contactsSelected: checkedArray
            });
          if(checkedArray.length === 1) {
            setGlobal({activeIndicator: true});

          } else {
            setGlobal({activeIndicator: false});
          }
        } else {
          setGlobal({activeIndicator: false});
        	let valueIndex = checkedArray.indexOf(selectedValue);
			      checkedArray.splice(valueIndex, 1);

            setGlobal({
              contactsSelected: checkedArray
            });
            if(checkedArray.length === 1) {
              setGlobal({activeIndicator: true});
            } else {
              setGlobal({activeIndicator: false});
            }
        }
  }

  export function setTypes(e) {
    setGlobal({ type: e.target.value});
  }

export function handleContactsKeyPress(e) {
  const global = getGlobal();
    if (e.key === 'Enter') {
      setGlobal({ types: [...global.types, global.type]});
      setGlobal({ type: "" });
    }
  }

  export function addTypeManual(){
    const global = getGlobal();
    setGlobal({ types: [...global.types, global.type]}, () => {
      setGlobal({ type: "" });
    });

  }

  export async function loadSingleTypes(contact) {
    const global = getGlobal();
    const authProvider = JSON.parse(localStorage.getItem('authProvider'));
    setGlobal({typeDownload: false});
    if(authProvider === 'uPort') {
      let contacts = global.contacts;
      const thisContact = await contacts.find((a) => { return a.contact === contact.contact});
      let index = thisContact && thisContact.contact;
      function findObjectIndex(contact) {
          return contact.contact === index;
      }
      if(thisContact && thisContact.types) {
        await setGlobal({index: contacts.findIndex(findObjectIndex), newContactImg: thisContact && thisContact.img, types: thisContact && thisContact.types, name: thisContact && thisContact.name, contact: thisContact && thisContact.contact, dateAdded: thisContact && thisContact.dateAdded });
      } else {
        await setGlobal({index: contacts.findIndex(findObjectIndex), newContactImg: thisContact && thisContact.img, types: [], name: thisContact && thisContact.name, contact: thisContact && thisContact.contact, dateAdded: thisContact && thisContact.dateAdded });
      }
    } else {
      getFile("contact.json", {decrypt: true})
      .then((fileContents) => {
        setGlobal({ contacts: JSON.parse(fileContents || '{}').contacts });
        setGlobal({ filteredContacts: global.contacts });
      }).then(() =>{
        let contacts = global.contacts;
        const thisContact = contacts.find((a) => { return a.contact === contact.contact});
        let index = thisContact && thisContact.contact;
        function findObjectIndex(contact) {
            return contact.contact === index;
        }
        if(thisContact && thisContact.types) {
          setGlobal({index: contacts.findIndex(findObjectIndex), newContactImg: thisContact && thisContact.img, types: thisContact && thisContact.types, name: thisContact && thisContact.name, contact: thisContact && thisContact.contact, dateAdded: thisContact && thisContact.dateAdded });
        } else {
          setGlobal({index: contacts.findIndex(findObjectIndex), newContactImg: thisContact && thisContact.img, types: [], name: thisContact && thisContact.name, contact: thisContact && thisContact.contact, dateAdded: thisContact && thisContact.dateAdded });
        }
  
      })
       .then(() => {
         setGlobal({ typeModal: ""});
       })
        .catch(error => {
          console.log(error);
        });
    }
  }

  export function saveNewTypes() {
    const global = getGlobal();
    console.log(global.index);
    setGlobal({ loading: true })
    const object = {};
    object.contact = global.contact;
    object.name = global.name;
    object.dateAdded = global.dateAdded;
    object.types = global.types;
    object.img = global.newContactImg;
    const index = global.index;
    const updatedContact = update(global.contacts, {$splice: [[index, 1, object]]});
    setGlobal({contacts: updatedContact, filteredContacts: updatedContact }, () => {
      saveNewContactsFile();
    });
    // setTimeout(saveFullCollectionTypes, 500);
  }

  export function saveFullCollectionTypes() {
    const authProvider = JSON.parse(localStorage.getItem('authProvider'));
    if(authProvider === 'uPort') {

    } else {
      putFile("contact.json", JSON.stringify(global), {encrypt: true})
      .then(() => {
        console.log("Saved");
        setGlobal({loading: false})
        loadContactsCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
    }
  }

export function handleContactsPageChange(event) {
  setGlobal({
    currentPage: Number(event.target.id)
  });
}

export function deleteType(props) {
  const global = getGlobal();
  setGlobal({ deleteState: false });

  let types = global.types;
  const thisType = types.find((type) => { return type === props});
  let typeIndex = thisType;
  function findObjectIndex(type) {
      return type === typeIndex;
  }
  setGlobal({ typeIndex: types.findIndex(findObjectIndex) }, () => {
    const updatedTypes = update(global.types, {$splice: [[global.typeIndex, 1]]});
    setGlobal({types: updatedTypes });
  });

}

export function applyContactsFilter() {
    setGlobal({ applyFilter: false }, () => {
      filterContactsNow();
    });
  }

  export function dateFilterContacts(props) {
    const global = getGlobal();
    let contacts = global.contacts;
    let dateFilter = contacts.filter(x => x.dateAdded.includes(props));
    setGlobal({ filteredContacts: dateFilter, appliedFilter: true, visible: false});
  }

  export function typeFilter(props) {
    const global = getGlobal();
    let contacts = global.contacts;
    let tagFilter = contacts.filter(x => typeof x.types !== 'undefined' ? x.types.includes(props) : console.log(""));
    setGlobal({ filteredContacts: tagFilter, appliedFilter: true, visible: false});
  }

  export function clearContactsFilter() {
    const global = getGlobal();
    setGlobal({ appliedFilter: false, filteredContacts: global.contacts});
  }

  export function filterContactsNow() {
    const global = getGlobal();
    let contacts = global.contacts;

    if(global.selectedType !== "") {
      let typeFilter = contacts.filter(x => typeof x.types !== 'undefined' ? x.types.includes(global.selectedType) : console.log("nada"));
      // let typeFilter = contacts.filter(x => x.types.includes(global.selectedType));
      setGlobal({ filteredContacts: typeFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    } else if (global.selectedDate !== "") {
      let dateFilter = contacts.filter(x => typeof x.dateAdded !== 'undefined' ? x.dateAdded.includes(global.selectedDate) : console.log("nada"));
      // let dateFilter = contacts.filter(x => x.dateAdded.includes(global.selectedDate));
      setGlobal({ filteredContacts: dateFilter, appliedFilter: true});
      window.$('.button-collapse').sideNav('hide');
    }
  }


  export async function handleDeleteContact(contact) {
    setGlobal({loading: true})
    const global = getGlobal();
    let contacts = global.contacts;
    const thisContact = contacts.find((a) => { return a.contact === contact.contact});
    let index = thisContact && thisContact.contact;
    function findObjectIndex(contact) {
        return contact.contact === index; //comparing numbers
    }
    console.log(thisContact);
    console.log(contacts.findIndex(findObjectIndex))
    await contacts.splice(contacts.findIndex(findObjectIndex),1);
    await setGlobal({contacts, filteredContacts: contacts, loading: false})
    saveNewContactsFile();
  };

  export function setContactsPerPage(event) {
    setGlobal({ contactsPerPage: event.target.value})
  }
