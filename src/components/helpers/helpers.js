import {
  getFile
} from "blockstack";

export function loadDocs() {
  this.setState({ loading: true });
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(JSON.parse(fileContents || '{}').value) {
       this.setState({ value: JSON.parse(fileContents || '{}').value, countFilesDone: JSON.parse(fileContents || '{}').countFilesDone, filteredValue: JSON.parse(fileContents || '{}').value });
     }

     if(JSON.parse(fileContents || '{}').countFilesDone) {
      this.setState({ countFilesDone: true });
    }  else {
      this.setState({ countFilesDone: false });
    }
   })
    .then(() => {
      this.loadSheets();
    })
    .catch(error => {
      console.log(error);
    });
}

export function loadSheets() {
  getFile("sheetscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       if(JSON.parse(fileContents).sheets) {
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets, filteredSheets: this.state.sheets });
       } else {
         this.setState({ sheets: [], filteredSheets: [] });
       }
     } else {
       this.setState({ sheets: [], filteredSheets: [] });
     }
   })
    .then(() => {
      this.loadContacts();
    })
    .catch(error => {
      console.log(error);
    });
}

export function loadContacts() {
  getFile("contact.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
     } else {
       this.setState({ contacts: [] });
     }
   })
    .then(() => {
      this.loadVault();
    })
    .catch(error => {
      console.log(error);
    });
}

export function loadVault() {
  getFile("uploads.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents){
       this.setState({ files: JSON.parse(fileContents || '{}'), filteredVault: JSON.parse(fileContents || '{}') });
     }else {
       this.setState({ files: [] });
       this.setState({filteredVault: []});
     }
   })
    .then(() => {
      this.loadIntegrations();
    })
    .catch(error => {
      console.log(error);
      this.setState({ files: [], filteredVault: [] });
    });
}

export function signInRedirect() {
  // this.setState({ loading: true });
  // handlePendingSignIn().then((userData) => {
  //   window.location = window.location.origin;
  //   this.setState({ loading: false });
  // });
}
