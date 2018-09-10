import {
  getFile,
  putFile
} from 'blockstack';

export function initialDeleteLoad() {
  getFile('uploads.json', {decrypt: true})
    .then((file) => {
      this.setState({files: JSON.parse(file || '{}') });
      let files = this.state.files;
      const thisFile = files.find((file) => {return file.id.toString() === window.location.href.split('delete/')[1]}); //this is comparing strings
      let index = thisFile && thisFile.id;
      console.log("DeleteVaultFile - componentDidMount - index is: ", index);
      function findObjectIndex(file) {
        return file.id === index; //this is comparing numbers
      }
      this.setState({index: files.findIndex(findObjectIndex)});
    })
    .catch(error => {
      console.log(error);
    })
  const file = window.location.href.split('delete/')[1];
  getFile(file + '.json', {decrypt: true})
   .then((fileContents) => {
     this.setState({ singleFile: JSON.parse(fileContents || '{}') });
     this.setState({ name: JSON.parse(fileContents || '{}').name })
   })
    .catch(error => {
      console.log(error);
    });
}

export function handleDeleteVaultItem() {
  const object = {};
  object.title = this.state.textvalue;
  object.content = this.state.test;
  object.id = parseInt(window.location.href.split('delete/')[1], 10);
  this.setState({ singleFile: {} })
  this.setState({ files: [...this.state.files, this.state.files.splice(this.state.index, 1)]})
  this.setState({ loading: "show", save: "hide" });
  this.saveVaultDelete();
};

export function saveVaultDelete() {
  this.setState({ loading: "show" });
  this.setState({ save: "hide"});
  putFile("uploads.json", JSON.stringify(this.state.files), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      this.saveVaultDeleteTwo();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
      alert(e.message);
    });
}

export function saveVaultDeleteTwo() {
  const file = window.location.href.split('delete/')[1];
  putFile(file + '.json', JSON.stringify(this.state.singleFile), {encrypt:true})
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
