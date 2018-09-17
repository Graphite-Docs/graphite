import {
  getFile,
} from "blockstack";

export function loadDocs() {
  this.setState({ loadingIndicator: true });
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(JSON.parse(fileContents || '{}').value) {
       this.setState({ value: JSON.parse(fileContents || '{}').value });
       this.setState({filteredValue: JSON.parse(fileContents || '{}').value})
       this.setState({ loading: "hide" });
     } else {
       console.log("No saved files");
       this.setState({ loading: "hide" });
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
       this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
       this.setState({filteredSheets: this.state.sheets})
       this.setState({ loading: "hide" });
     } else {
       console.log("Nothing to see here");
       this.setState({ loading: "hide" });
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
       this.setState({ files: JSON.parse(fileContents || '{}') });
       this.setState({filteredVault: this.state.files});
     }else {
       this.setState({ files: [] });
       this.setState({filteredVault: []});
     }
   })
    .then(() => {
      // this.loadAnalytics();
      setTimeout(this.loadIntegrations, 1000);
      // this.loadIntegrations();
    })
    .catch(error => {
      console.log(error);
      this.setState({ files: [], filteredVault: [] });
    });
}
