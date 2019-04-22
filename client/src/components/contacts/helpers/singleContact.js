import { setGlobal, getGlobal } from 'reactn';
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