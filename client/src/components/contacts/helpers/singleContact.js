import { setGlobal, getGlobal } from 'reactn';
import update from 'immutability-helper';
import { ToastsStore} from 'react-toasts';
import { postData } from '../../shared/helpers/post';

export async function loadContact(contactName) {
    console.log(contactName)
    setGlobal({ loading: true });
    const contacts = await getGlobal().contacts;
    if(contacts.length > 0){
        let index = await contacts
        .map(x => {
        return x.id || x.contact;
        })
        .indexOf(contactName);
        if(index > -1) {
            console.log(contacts[index]);
            setGlobal({ contact: contacts[index], loading: false });
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