import {
  putFile
} from 'blockstack';
import {
  getMonthDayYear
} from './getMonthDayYear';
import XLSX from 'xlsx';
const str2ab = require('string-to-arraybuffer');

export function handleVaultDrop(files) {
  var file = files[0]
  const reader = new FileReader();
  reader.onload = (event) => {
     const object = {};
     object.file = file;
     object.uploaded = getMonthDayYear();
     object.link = event.target.result;
     object.name = file.name;
     object.size = file.size;
     object.type = file.type;
     object.tags = this.state.tags;
     object.sharedWithSingle = this.state.sharedWithSingle;
     object.lastModified = file.lastModified;
     object.lastModifiedDate = file.lastModifiedDate;
     object.id = Date.now();
     object.vault = "vault";
     const objectTwo = {};
     objectTwo.uploaded = getMonthDayYear();
     objectTwo.id = object.id;
     objectTwo.name = object.name;
     objectTwo.type = object.type;
     objectTwo.tags = this.state.tags;
     objectTwo.sharedWithSingle = this.state.sharedWithSingle;
     objectTwo.lastModifiedDate = object.lastModifiedDate;
     objectTwo.fileType = "vault";

     this.setState({id: objectTwo.id, name: objectTwo.name});
     if(object.type.includes('sheet')) {
       var abuf4 = str2ab(object.link)
        var wb = XLSX.read(abuf4, {type:'buffer'});
        this.setState({ grid: wb.Strings })
        console.log(this.state.grid);
        object.grid = this.state.grid;
     } else {
       console.log("not a spreadsheet");
     }
     if(object.size > 111048576) {
       this.handleDropRejected();
     }else {
       this.setState({singleFile: object});
       this.setState({files: [...this.state.files, objectTwo] });
       this.setState({ loading: "", show: "hide"})
       setTimeout(this.saveNewVaultFile, 700)
     }
 };
 reader.readAsDataURL(file);
}

export function handleDropRejected(files) {
 console.log("Error file too large");
 // Materialize.toast('Sorry, your file is larger than 1mb', 4000) // 4000 is the duration of the toast
}

export function saveNewVaultFile() {
    console.log(this.state.files);
    console.log(this.state.singleFile);
    const file = this.state.id + '.json';
    putFile(file, JSON.stringify(this.state.singleFile), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        this.saveNewVaultFileTwo();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });

  }

  export function saveNewVaultFileTwo() {
    putFile("uploads.json", JSON.stringify(this.state.files), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/vault");
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });
  }
