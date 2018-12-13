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

export function handleDeleteVaultItem(file) {
  let files = this.state.files;
  const thisFile = files.find((a) => {return a.id.toString() === file.id.toString()}); //this is comparing strings
  let index = thisFile && thisFile.id;
  function findObjectIndex(a) {
    return a.id === index; //this is comparing numbers
  }
  this.setState({index: files.findIndex(findObjectIndex)}, () => {
    if(this.state.index > -1) {
      files.splice(this.state.index,1);
    } else {
      console.log("Error with index")
    }
    this.setState({ singleFile: {}, files: files, loading: true }, () => {
      this.saveVaultDelete(file);
    })
  });

};

export function saveVaultDelete(file) {
  putFile("uploads.json", JSON.stringify(this.state.files), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      this.saveVaultDeleteTwo(file);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveVaultDeleteTwo(file) {
  const fileID = file.id;
  putFile(fileID + '.json', JSON.stringify(this.state.singleFile), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      this.setState({loading: false});
      this.loadVault();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
      alert(e.message);
    });
}
