const axios = require('axios');
const { encryptData } = require('./encryption');
const { URL, config } = require('./api');
export default function worker(self) {
  self.addEventListener('message', async (e) => { //eslint-disable-line
    const payload = JSON.parse(e.data);
    const { publicKey, document, token } = payload;

    const { title, id, content } = document;
    const encryptedData = encryptData(publicKey, content);
    
    const documentForServer = {
      id,
      title: title ? title : 'Untitled', 
      content: encryptedData
    }
    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;
    const res = await axios.put(
      `${URL}/v1/documents/${document.id}`,
      JSON.stringify(documentForServer),
      config
    );
    self.postMessage(res.data);
  });
}