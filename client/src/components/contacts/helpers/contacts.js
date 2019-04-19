import axios from 'axios';
import { getGlobal, setGlobal } from 'reactn';
import { ContactModel } from '../models/contactModel';
import { postData } from '../../shared/helpers/post';

export function handleNewContact(e) {
    setGlobal({ newContact: e.target.value }, () => {
    let link = 'https://core.blockstack.org/v1/search?query=';
    axios
        .get(
        link + getGlobal().newContact
        )
        .then(res => {
        if(res.data.results){
            console.log(res.data.results)
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

export async function handleAddContact(contact) {
    const contactModel = ContactModel(contact);
    let contacts = await getGlobal().contacts;
    await setGlobal({ contacts : [...contacts, contactModel ], filteredContacts: [...contacts, contactModel]})
    let contactsParams = {
        fileName: 'contacts.json', 
        encrypt: true, 
        body: JSON.stringify(getGlobal().contacts)
    }

    const updatedContacts = await postData(contactsParams);
    console.log(updatedContacts);
}