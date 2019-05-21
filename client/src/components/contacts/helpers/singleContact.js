import { setGlobal, getGlobal } from 'reactn';
import update from 'immutability-helper';
import { ToastsStore} from 'react-toasts';
import { postData } from '../../shared/helpers/post';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
const uuid = require('uuidv4');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export async function loadContact(contactName) {
    setGlobal({ loading: true });
    const contacts = await getGlobal().contacts;
    if(contacts.length > 0){
        let index = await contacts
        .map(x => {
        return x.id || x.contact;
        })
        .indexOf(contactName);
        if(index > -1) {
            const thisContact = contacts[index];
            setGlobal({ contact: thisContact, contactNotes: thisContact.notes || [], loading: false });
        } else {
            console.log("Index error", index)
        }
    } else {
        setTimeout(() => loadContact(contactName), 1000);
    }
}

export async function saveContact(contact) {
    setGlobal({ 
        contactEditing: false,
        contact  
    });
    const contacts = await getGlobal().contacts;
    if(contacts.length > 0){
        let index = await contacts
        .map(x => {
        return x.id || x.contact;
        })
        .indexOf(contact.id);
        if(index > -1) {
            const updatedContacts = update(contacts, {$splice: [[index, 1, contact]]});
            await setGlobal({contacts: updatedContacts});
            let contactsParams = {
                fileName: "contact.json",
                encrypt: true,
                body: JSON.stringify(getGlobal().contacts)
              };
            
              const postedContacts = await postData(contactsParams);
              console.log(postedContacts);
              ToastsStore.success(`Contact saved`)
        } else {
            console.log("Index error", index)
        }
    } else {
        console.log("Error fetching contacts");
    }
}

export function handleNote(e) {
    setGlobal({ newNote: e.target.value });
}

export async function saveNote() {
    const { userSession } = getGlobal();
    const note = {
        id: uuid(), 
        userName: userSession.loadUserData().username,
        userImg: userSession.loadUserData().profile.image[0].contentUrl || avatarFallbackImage, 
        date: getMonthDayYear(),
        note: getGlobal().newNote
    };

    let contacts = getGlobal().contacts;
    const contactId = window.location.href.split('contacts/')[1];
    const index = await contacts
    .map(x => {
    return x.id || x.contact;
    })
    .indexOf(contactId);
    let thisContact = contacts[index];
    if(thisContact.notes) {
        thisContact.notes.push(note);
    } else {
        thisContact.notes = [];
        thisContact.notes.push(note);
    }
    const updatedContacts = update(contacts, {$splice: [[index, 1, thisContact]]});
    await setGlobal({ contacts: updatedContacts, contactNotes: thisContact.notes });
    setGlobal({ newNote: "" });
    let contactsParams = {
        fileName: "contact.json",
        encrypt: true,
        body: JSON.stringify(getGlobal().contacts)
      };
    
    const postedContacts = await postData(contactsParams);
    console.log(postedContacts);
}