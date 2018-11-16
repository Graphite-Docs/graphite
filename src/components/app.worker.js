
export default () => {
    self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
        let data = JSON.parse(e.data);
        putFile("documentscollection.json", JSON.stringify(data), {encrypt:true})
          .then(() => {
            console.log("Saved Collection!");
            const file = data.tempDocId;
            const fullFile = '/documents/' + file + '.json'
            const singleDoc =
            putFile(fullFile, JSON.stringify(data.singleDoc), {encrypt:true})
              .then(() => {
                // if(window.location.href.includes('vault')) {
                //   window.location.replace('/documents');
                // } else if(!window.location.href.includes('google') && !window.location.href.includes('documents/doc/')) {
                //   console.log("finally redirecting")
                //   this.setState({ redirect: true });
                // } else if(window.location.href.includes('documents/doc/')) {
                //   window.location.replace(window.location.origin + '/documents/doc/' + this.state.tempDocId);
                // } else {
                //   // window.Materialize.toast(this.state.title + " added!", 4000);
                // }
                // if(this.state.importAll) {
                //   this.setState({ count: this.state.count + 1 });
                // }
                console.log("saved single")
              })
              // .then(() => {
              //   if(this.state.importAll) {
              //     this.importAllGDocs();
              //   }
              // })
              .catch(e => {
                console.log("e");
                console.log(e);
                this.setState({ loading: false })
                alert("Trouble saving")
              });
          })
          .catch(e => {
            console.log("e");
            console.log(e);
            this.setState({ loading: false })
            alert("Trouble saving");
          });
        postMessage(data);
    })
}
