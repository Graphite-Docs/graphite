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

export function handleDeleteDoc(props) {
  let value = this.state.value;
  const thisDoc = value.find((doc) => { return doc.id.toString() === props.id.toString()});
  let index = thisDoc && thisDoc.id;
  function findObjectIndex(doc) {
      return doc.id === index; //comparing numbers
  }
  this.setState({ content: thisDoc && thisDoc.content, title: thisDoc && thisDoc.title, index: value.findIndex(findObjectIndex) }, () => {
    if(this.state.index > -1) {
      value.splice(this.state.index,1);
    } else {
      console.log("Error with index")
    }

    this.setState({ value: value, singleDoc: {}, deleteDoc: true, loading: "show", save: "hide", action: "Deleted document: " +  props.id}, () => {
      this.saveNewDocFile(props);
    })
  })

};

export function saveNewDocFile(props) {
  putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      this.saveDocFileTwo(props);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveDocFileTwo(props) {
  const file = props.id;
  const fullFile = '/documents/' + file + '.json';
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
    .then(() => {
      window.location.href = '/documents';
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}
