## Graphite's Analytics
In addition to total user counts, as obtained by indexing all Blockstack profiles that have Graphite as an app listed in the profile, Graphite also tracks total files created. No user data whatsoever is collected. In an effort to be transparent, this small write-up shows how the data is collected. It's a simple function that utilizes Webtask to post data to a Graphite Dropbox file. Here is the function:

```
export function analyticsRun(props) {
  if(!window.location.origin.includes('localhost') && !window.location.origin.includes('serene')) {
    let countObject = {};
    axios.get('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getCount')
      .then((res) => {
        let counts = JSON.parse(res.data);
        if(props === 'documents') {
          countObject.docs = counts.docs + 1;
          countObject.sheets = counts.sheets;
          countObject.vault = counts.vault;
        } else if(props === 'sheets') {
          countObject.docs = counts.docs;
          countObject.sheets = counts.sheets + 1;
          countObject.vault = counts.vault;
        } else if(props === 'vault') {
          countObject.docs = counts.docs;
          countObject.sheets = counts.sheets;
          countObject.vault = counts.vault + 1;
        } else if(props === 'main') {
          this.setState({ countFilesDone: true});
          countObject.docs = counts.docs + this.state.value.length;
          countObject.sheets = counts.sheets + this.state.sheets.length;
          countObject.vault = counts.vault + this.state.files.length;
        }
      })
      .then(() => {
        axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/postCount', JSON.stringify(countObject))
      })
      .then(() => {
        if(this.state.countFilesDone) {
          putFile('documentscollection.json', JSON.stringify(this.state.value), {encrypt: true})
        }
      })
      .catch(error => {
        console.log(error);
      })
  }
}
```

The Dropbox file is public and can be viewed here: [https://www.dropbox.com/s/bke6dnmj5ix8931/counts.txt?dl=0](https://www.dropbox.com/s/bke6dnmj5ix8931/counts.txt?dl=0)
