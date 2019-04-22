import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
export const ContactModel = (newContact) => {
    console.log(newContact.profile.account);
    let contact = {
        name: newContact.profile.name ? newContact.profile.name : "",
        id: newContact.fullyQualifiedName,
        image: newContact.profile.image ? newContact.profile.image[0].contentUrl : avatarFallbackImage,
        dateAdded: getMonthDayYear(),
        types: [],
        fileType: "contacts",
        emailAddress: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        region: "",
        country: "",
        website: newContact.profile ? newContact.profile.website ? newContact.profile.website[0].url : "" : "",
        socialAccounts: newContact.profile ? newContact.profile.account ? newContact.profile.account : [] : [], 
        notes: []
    }
    console.log(contact);
    return contact;
}