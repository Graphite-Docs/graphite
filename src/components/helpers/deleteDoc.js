import {
  getFile,
  putFile
} from 'blockstack';

export function loadDocToDelete() {
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
      this.setState({ value: JSON.parse(fileContents || '{}').value })
      console.log("loaded");
   }).then(() =>{
     let value = this.state.value;
     const thisDoc = value.find((doc) => { return doc.id.toString() === window.location.href.split('/documents/doc/delete/')[1]}); //comparing strings
     let index = thisDoc && thisDoc.id;
     console.log('index is ' + index)
     function findObjectIndex(doc) {
         return doc.id === index; //comparing numbers
     }
     this.setState({ content: thisDoc && thisDoc.content, title: thisDoc && thisDoc.title, index: value.findIndex(findObjectIndex) })
   })
    .catch(error => {
      console.log(error);
    });
    const file = window.location.href.split('/documents/doc/delete/')[1];
    const fullFile = '/documents/' + file + '.json';
    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log(fileContents);
        this.setState({
          singleDoc: JSON.parse(fileContents || '{}')
       })
     })
      .catch(error => {
        console.log(error);
      });
}

export function handleDeleteDoc() {
  const object = {};
  object.title = this.state.title;
  object.content = this.state.content;
  object.id = parseInt(window.location.href.split('/documents/doc/delete/')[1], 10);
  let updatedArray = this.state.value.splice(this.state.index, 1)
  this.setState({ value: updatedArray})
  this.setState({ singleDoc: {}, deleteDoc: true });
  this.setState({ loading: "show", save: "hide", action: "Deleted document: " +  window.location.href.split('/documents/doc/delete/')[1]});
  this.saveNewDocFile();
};

export function saveNewDocFile() {
  this.setState({ loading: "show" });
  this.setState({ save: "hide"});
  putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})

    .then(() => {
      this.saveDocFileTwo();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveDocFileTwo() {
  const file = window.location.href.split('/documents/doc/delete/')[1];
  const fullFile = '/documents/' + file + '.json';
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
    .then(() => {
      this.setState({ loading: "hide" });
      window.location.href = '/documents';
    })
    .catch(e => {
      console.log("e");
      console.log(e);
      alert(e.message);
    });
}
