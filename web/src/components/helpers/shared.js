export function handleTagChange(e) {
  this.setState({ tag: e.target.value});
}

export function handleKeyPress(e) {
  let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === '13') {
      if(this.state.tag !=="") {
        this.setState({ singleDocTags: [...this.state.singleDocTags, this.state.tag]}, () => {
          this.setState({ tag: "" });
        });
      }
    }
}

export function addTagManual(file, type) {
  if(this.state.tag !=="") {
    if(type === 'document') {
      this.setState({ singleDocTags: [...this.state.singleDocTags, this.state.tag]}, () => {
        let value = this.state.value;
        const thisDoc = value.find((document) => { return document.id.toString() === file.id.toString()});
        let index = thisDoc && thisDoc.id;
        function findObjectIndex(doc) {
            return doc.id === index; //this is comparing numbers
        }
        this.setState({tagIndex: value.findIndex(findObjectIndex), tag: "" });
      });
    } else if(type === 'sheet') {
      this.setState({ singleSheetTags: [...this.state.singleSheetTags, this.state.tag]}, () => {
        let sheets = this.state.sheets;
        const thisSheet = sheets.find((sheet) => { return sheet.id.toString() === file.id.toString()});
        let index = thisSheet && thisSheet.id;
        function findObjectIndex(sheet) {
            return sheet.id === index; //this is comparing numbers
        }
        this.setState({tagIndex: sheets.findIndex(findObjectIndex), tag: "" });
      });
    } else if(type === 'vault') {
      this.setState({ singleVaultTags: [...this.state.singleVaultTags, this.state.tag]}, () => {
        let files = this.state.files;
        const thisFile = files.find((a) => { return a.id.toString() === file.id.toString()});
        let index = thisFile && thisFile.id;
        function findObjectIndex(file) {
            return file.id === index; //this is comparing numbers
        }
        this.setState({tagIndex: files.findIndex(findObjectIndex), tag: "" });
      });
    } else if(type === 'contact') {
      this.setState({ singleContactTypes: [...this.state.singleContactTypes, this.state.tag]}, () => {
        let contacts = this.state.contacts;
        const thisContact = contacts.find((a) => { return a.id.toString() === file.id.toString()});
        let index = thisContact && thisContact.id;
        function findObjectIndex(contact) {
            return contact.id === index; //this is comparing numbers
        }
        this.setState({tagIndex: contacts.findIndex(findObjectIndex), tag: "" });
      });
    }
  }
}

export function deleteTag(tag, type) {
  if(type === 'document') {
    let singleDocTags = this.state.singleDocTags;
    const thisTag = singleDocTags.find((a) => { return a === tag});
    let tagIndex = thisTag;
    function findObjectIndex(a) {
        return a === tagIndex; //this is comparing numbers
    }
    this.setState({ tagIndex: singleDocTags.findIndex(findObjectIndex) }, () => {
      singleDocTags.splice(this.state.tagIndex, 1);
      this.setState({singleDocTags: singleDocTags});
    });
  } else if(type === 'sheet') {

  } else if(type === 'vault') {

  } else if(type === 'contact') {

  }


}
