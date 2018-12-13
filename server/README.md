## Graphite Websockets Server

For users that choose to share files and collaborate in real-time, a websockets server is deployed and managed by Graphite. No data is ever stored and it is exclusively used to connect peers. Data is encrypted with wss encryption and in a future release, content will be encrypted client side before transport.

If you'd like to use your own webscokets server, this code can be deployed to the provider of your choosing, or it can be run locally.

To run the server locally, simply clone a copy to your computer, then `cd` into the server folder in your terminal. Run `node index.js` to run the server.

In the `web` folder of the main Graphite source code, you'll need to access `src` then `components` then `documents` then `editor`. In that folder, open `SocketEditor` and change the endpoint to `'http://localhost:5000'`.
