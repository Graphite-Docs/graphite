import {
  getFile,
  putFile,
  loadUserData,
  lookupProfile
} from 'blockstack';
import { getMonthDayYear } from './getMonthDayYear';
import XLSX from "xlsx";
const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('../vault/rtf-to-html.js');
const Papa = require('papaparse');

export function loadVaultContacts() {
  getFile("contact.json", {decrypt: true})
   .then((fileContents) => {
     let file = JSON.parse(fileContents || '{}');
     let contacts = file.contacts;
     if(contacts.length > 0) {
       this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
     } else {
       this.setState({ contacts: [] });
     }
   })
    .catch(error => {
      console.log(error);
    });
}

export function handleIDChangeVault(e) {
  this.setState({ senderID: e.target.value })
}

export function pullData() {
    this.fetchData();
    this.setState({ hideButton: "hide", loading: "" });
  }

export function loadSharedVault() {
  console.log("heyo")
  getFile("uploads.json", {decrypt: true})
   .then((fileContents) => {
     this.setState({ files: JSON.parse(fileContents || '{}') });
     this.setState({filteredValue: this.state.files});
     // this.merge();
   })
    .catch(error => {
      console.log(error);
    });
  this.setState({ user: window.location.href.split('shared/')[1] });
  console.log("did it")
  let fileID = loadUserData().username;
  console.log(fileID);
  let fileString = 'sharedvault.json'
  let file = fileID.slice(0, -3) + fileString;
  const directory = '/shared/' + file;
  const options = { username: window.location.href.split('shared/')[1], zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  const privateKey = loadUserData().appPrivateKey;
  getFile(directory, options)
   .then((fileContents) => {
     console.log("file contents: ")
     console.log(fileContents);
     lookupProfile(this.state.user, "https://core.blockstack.org/v1/names")
       .then((profile) => {
         let image = profile.image;
         console.log(profile);
         if(profile.image){
           this.setState({img: image[0].contentUrl})
         } else {
           this.setState({ img: avatarFallbackImage })
         }
       })
       .catch((error) => {
         console.log('could not resolve profile')
       })
      this.setState({ shareFileIndex: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
      console.log("loaded");
      this.saveVaultUser();
   })
    .catch(error => {
      console.log(error);
    });
}

export function saveVaultUser() {
  putFile("shareuser.json", JSON.stringify(this.state.user), {encrypt: true})
    .then(() => {
      console.log("saved");
    })
    .catch(e => {
      console.log(e);
    });
}

export function loadSingleSharedVault() {
  getFile("shareuser.json", {decrypt: true})
   .then((fileContents) => {
      this.setState({ user: JSON.parse(fileContents || '{}') });
   })
   .then(() => {
     let fileID = loadUserData().username;
     let fileString = 'sharedvault.json'
     let file = fileID.slice(0, -3) + fileString;
     const directory = '/shared/' + file;
     const options = { username: this.state.user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
     const privateKey = loadUserData().appPrivateKey;
     getFile(directory, options)
      .then((fileContents) => {
        lookupProfile(this.state.user, "https://core.blockstack.org/v1/names")
          .then((profile) => {
            let image = profile.image;
            console.log(profile);
            if(profile.image){
              this.setState({img: image[0].contentUrl})
            } else {
              this.setState({ img: avatarFallbackImage })
            }
          })
          .catch((error) => {
            console.log('could not resolve profile')
          })
         this.setState({ shareFileIndex: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
         console.log("loaded");
         let wholeFile = this.state.shareFileIndex;
         console.log(wholeFile)
         const thisFile = wholeFile.find((file) => {return file.id.toString() === this.props.match.params.id}); //this is comparing strings
         let index = thisFile && thisFile.id;
         console.log(index);
         function findObjectIndex(file) {
             return file.id === index; //this is comparing numbers
         }
         this.setState({
           name: thisFile && thisFile.name,
           link: thisFile && thisFile.link,
           type: thisFile && thisFile.type,
           index: wholeFile.findIndex(findObjectIndex)
         })
         console.log(this.state.name)
         console.log(this.state.link)
         console.log(this.state.type)
         if (this.state.type.includes("word")) {
           var abuf4 = str2ab(this.state.link);
           mammoth
             .convertToHtml({ arrayBuffer: abuf4 })
             .then(result => {
               var html = result.value; // The generated HTML
               this.setState({ content: html });
               console.log(this.state.content);
               this.setState({ loading: "hide", show: "" });
             })
             .done();
         }

         else if (this.state.type.includes("rtf")) {
           let base64 = this.state.link.split("data:text/rtf;base64,")[1];
           rtfToHTML.fromString(window.atob(base64), (err, html) => {
             console.log(window.atob(base64));
             console.log(html)
             let htmlFixed = html.replace("body", ".noclass");
             this.setState({ content:  htmlFixed});
             this.setState({ loading: "hide", show: "" });
           })
         }

         else if (this.state.type.includes("text/plain")) {
           let base64 = this.state.link.split("data:text/plain;base64,")[1];
           console.log(window.atob(base64));
           this.setState({ loading: "hide", show: "" });
           this.setState({ content: window.atob(base64) });
         }

         else if (this.state.type.includes("sheet")) {
           // var abuf4 = str2ab(this.state.link);
           var wb = XLSX.read(abuf4, { type: "buffer" });
           var first_worksheet = wb.Sheets[wb.SheetNames[0]];
           var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
           console.log(data);
           this.setState({ grid: data });
           this.setState({ loading: "hide", show: "" });
         }

         else if (this.state.type.includes("csv")) {
           let base64 = this.state.link.split("data:text/csv;base64,")[1];
           console.log(Papa.parse(window.atob(base64)).data);
           this.setState({ grid: Papa.parse(window.atob(base64)).data });
           this.setState({ loading: "hide", show: "" });
         }

         else {
           this.setState({ loading: "hide", show: "" });
         }
     })
   })
    .catch(error => {
      console.log(error);
    });
}

export function handleAddToVault() {
  getFile("uploads.json", { decrypt: true })
    .then(fileContents => {
      if (fileContents) {
        this.setState({ files: JSON.parse(fileContents || "{}") });
      } else {
        console.log("No files");
      }
    })
    .then(() => {
      this.handleAddToVaultTwo();
    })
    .catch(error => {
      console.log(error);
    });
}

export function handleAddToVaultTwo() {
  this.setState({ show: "hide" });
  this.setState({ hideButton: "hide", loading: "" });

  const object = {};
  object.link = this.state.link;
  object.name = this.state.name;
  object.size = this.state.size;
  object.type = this.state.type;
  object.uploaded = getMonthDayYear();
  object.id = this.props.match.params.id;

  this.setState({ files: [...this.state.files, object] });
  this.setState({ singleFile: object });
  this.setState({ loading: "" });
  setTimeout(this.saveVaultCollection, 300);
  setTimeout(this.saveNewVaultTwo, 600);
}

export function saveNewVaultTwo() {
  const file = window.location.href.split('shared/')[1] + '.json';
  putFile(file, JSON.stringify(this.state.singleFile), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      window.location.replace("/vault");
    })
    .catch(e => {
      console.log("e");
      console.log(e);

    });
}
