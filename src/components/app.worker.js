export default () => {
    self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
        let data = e.data;
        let i;
        for (i=0; i< e.data.contact.length; i++) {
          let url = 'https://gaia-gateway.com/ryan.id/publik.ykliao.com/statuses.json/' + e.data.contacts[i] + '/' + encodeURIComponent(window.location.host) + '/shared/shareddocs.json';
          fetch(url)
            .then(function(response) {
              return response.json();
            })
            .then(function(myJson) {
              console.log(JSON.stringify(myJson));
            });
        }
        if(i < data.contacts.length) {
          console.log("updating...")
        } else {
          postMessage(data);
        }
    })
}
