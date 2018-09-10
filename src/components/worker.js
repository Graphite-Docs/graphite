module.exports = function worker (self) {
    self.addEventListener('message', (event) => {
      let count = 0;
      let teammate = event.data[count].contact;
      let fileURL;
      fetch('https://gaia-gateway.com/' + teammate)
        .then(function(response) {
          return response.json();
        })
        .then(function(myJson) {
          fileURL = myJson['https://app.graphitedocs.com'];
        })
        .then(() => {
          this.loadFile();
        })

        this.loadFile = () => {
          fetch(fileURL + 'contact.json')
            .then(function(response) {
              return response.json();
            })
            .then(function(myJson) {
              self.postMessage(myJson);
            })
        }
        // const startNum = parseInt(event.data.length, 10); // ev.data=4 from main.js
        setInterval(() => {
            // const r = startNum / Math.random() - 1;
            // self.postMessage([ startNum, r, Math.floor(r) ]);
            // self.postMessage(file);
        }, 1000);
    });
};
