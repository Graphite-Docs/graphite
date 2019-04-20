import axios from "axios";
import { getGlobal, setGlobal } from "reactn";
import { ContactModel } from "../models/contactModel";
import { postData } from "../../shared/helpers/post";
import { fetchData } from "../../shared/helpers/fetch";
import { loadData } from "../../shared/helpers/accountContext";
import { ToastsStore} from 'react-toasts';
import update from 'immutability-helper';

export async function loadSingleContact(contact) {
  //First fetch the contact file
  const contactName = contact.contact ? contact.contact : contact.id;
  const contactNameShort = contactName.split(".").join("_");
  const contactParams = {
    fileName: `contacts/${contactNameShort}.json`,
    decrypt: true
  };
  const contactFile = await fetchData(contactParams);
  if (contactFile) {
    setGlobal({ contactFile: JSON.parse(contactFile) });
  } else {
    setGlobal({ contactFile: {} });
  }
  //Next find the individual contact in the index
  let contacts = getGlobal().contacts;
  let index = await contacts
    .map(x => {
      return x.id || x.contact;
    })
    .indexOf(contactName);
  setGlobal({ types: contacts[index].types });
}

export function handleNewContact(e) {
  setGlobal({ newContact: e.target.value }, () => {
    let link = "https://core.blockstack.org/v1/search?query=";
    axios
      .get(link + getGlobal().newContact)
      .then(res => {
        if (res.data.results) {
          console.log(res.data.results);
          setGlobal({ results: res.data.results });
        } else {
          setGlobal({ results: [] });
        }
      })
      .catch(error => {
        console.log(error);
      });
  });
}

export async function handleAddContact(contact) {
  const contactModel = ContactModel(contact);
  let contacts = await getGlobal().contacts;
  await setGlobal({
    contacts: [...contacts, contactModel],
    filteredContacts: [...contacts, contactModel]
  });
  let contactsParams = {
    fileName: "contact.json",
    encrypt: true,
    body: JSON.stringify(getGlobal().contacts)
  };

  const updatedContacts = await postData(contactsParams);
  console.log(updatedContacts);
  setGlobal({ contactModalOpen: false });
}

export function filterContactsList(event) {
  var updatedList = getGlobal().contacts;
  updatedList = updatedList.filter(function(item) {
    if (item.contact) {
      return (
        item.contact.toLowerCase().search(event.target.value.toLowerCase()) !==
        -1
      );
    } else {
      return (
        item.id.toLowerCase().search(event.target.value.toLowerCase()) !== -1
      );
    }
  });
  setGlobal({ filteredContacts: updatedList });
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
  setGlobal({
    filteredContacts: dateFilter,
    appliedFilter: true,
    visible: false
  });
}

export function typeFilter(props) {
  const global = getGlobal();
  let contacts = global.contacts;
  let tagFilter = contacts.filter(x =>
    typeof x.types !== "undefined" ? x.types.includes(props) : console.log("")
  );
  setGlobal({
    filteredContacts: tagFilter,
    appliedFilter: true,
    visible: false
  });
}

export function clearContactsFilter() {
  const global = getGlobal();
  setGlobal({ appliedFilter: false, filteredContacts: global.contacts });
}

export function filterContactsNow() {
  const global = getGlobal();
  let contacts = global.contacts;

  if (global.selectedType !== "") {
    let typeFilter = contacts.filter(x =>
      typeof x.types !== "undefined"
        ? x.types.includes(global.selectedType)
        : console.log("nada")
    );
    // let typeFilter = contacts.filter(x => x.types.includes(global.selectedType));
    setGlobal({ filteredContacts: typeFilter, appliedFilter: true });
    window.$(".button-collapse").sideNav("hide");
  } else if (global.selectedDate !== "") {
    let dateFilter = contacts.filter(x =>
      typeof x.dateAdded !== "undefined"
        ? x.dateAdded.includes(global.selectedDate)
        : console.log("nada")
    );
    // let dateFilter = contacts.filter(x => x.dateAdded.includes(global.selectedDate));
    setGlobal({ filteredContacts: dateFilter, appliedFilter: true });
    window.$(".button-collapse").sideNav("hide");
  }
}

export async function deleteType(tag) {
    let tags = getGlobal().types;
    let index = await tags.map((x) => {return x }).indexOf(tag);
    tags.splice(index, 1);
    setGlobal({types: tags});
}

export function setTypes(e) {
  setGlobal({ type: e.target.value });
}

export function addTypeManual() {
    setGlobal({
        types: [...getGlobal().types, getGlobal().type], type: ""
    })
}

export function checkKey(event) {
    if(event.key === "Enter") {
        if(getGlobal().type !== "") {
            addTypeManual();
        }
    }
}

export async function saveTypes(contact) {
    setGlobal({tagModalOpen: false})
    const contactName = contact.contact ? contact.contact : contact.id;
    const contactNameShort = contactName.split(".").join("_");
    ToastsStore.success(`Saving contact types...`)
    //Then update the doc collection and save it
    let contacts = await getGlobal().contacts;
    let index = await contacts
        .map(x => {
        return x.id || x.contact;
        })
        .indexOf(contactName);
    let contactFile = contacts[index];
    contactFile["types"] = getGlobal().types;
    const updatedContacts = update(getGlobal().contacts, {$splice: [[index, 1, contactFile]]});
    await setGlobal({
      contacts: updatedContacts
    })
    try {   
        let file = 'contact.json';
        let contactsParams = {
            fileName: file, 
            body: JSON.stringify(getGlobal().contacts), 
            encrypt: true
        }
        const updatedContactIndex = await postData(contactsParams);
        console.log(updatedContactIndex);
        ToastsStore.success(`Contact types saved!`)
        loadData({refresh: false})
    } catch(error) {
        console.log(error)
    }

     //Save the single contact now
     try {
        let file = `contacts/${contactNameShort}.json`
        let contactFileParams = {
            fileName: file, 
            body: JSON.stringify(contactFile), 
            encrypt: true
        }
        let postedContactFile = await postData(contactFileParams)
        console.log(postedContactFile)
    } catch(error) {
        console.log(error)
    }
}

export async function hanldeDeleteContact(contact) {
    const contactName = contact.contact ? contact.contact : contact.id;
    const contactNameShort = contactName.split(".").join("_");
    //First we delete the file from the index
    let contacts = await getGlobal().contacts;
    let index = await contacts.map((x) => {return x.id || x.contact }).indexOf(contact.id || contact.contact);
    contacts.splice(index, 1);
    await setGlobal({ contacts: contacts, deleteModalOpen: false });
    ToastsStore.success(`Deleting contact...`)
    try {
      let file = 'contact.json';
      let contactsParams = {
          fileName: file, 
          body: JSON.stringify(getGlobal().contacts), 
          encrypt: true
      }
      const updatedContactsIndex = await postData(contactsParams);
      console.log(updatedContactsIndex);
    } catch(error) {
      console.log(error)
    }

    //Now we have to save an empty file for the contact
    const empty = {};
    try {
      let singleContactFile = `contacts/${contactNameShort}.json`;
      let singleContactParams = {
          fileName: singleContactFile, 
          body: JSON.stringify(empty), 
          encrypt: true
      }
      const singleContactEmpty = await postData(singleContactParams);
      console.log(singleContactEmpty);
      ToastsStore.success(`Contact deleted!`);
      loadData({refresh: false});
    } catch(error) {
      console.log(error)
    }
}
