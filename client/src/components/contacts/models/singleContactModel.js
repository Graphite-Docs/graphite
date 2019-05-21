const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
export const SingleContactModel = (newContact) => {
    let contact = {
        name: newContact.profile.name ? newContact.profile.name : "",
        id: newContact.fullyQualifiedName,
        image: newContact.profile.image ? newContact.profile.image[0].contentUrl : avatarFallbackImage,
        dateAdded: newContact.dateAdded,
        types: [],
        fileType: "contacts",
        emailAddress: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        region: "",
        country: "",
        phone: "",
        notes: [], 
        socialAccounts: newContact.profile ? newContact.profile.accounts ? newContact.profile.accounts : [] : []
    }
    return contact;
}