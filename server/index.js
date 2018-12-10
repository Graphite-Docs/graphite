const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

// our localhost port
const port = 4001

const app = express()

// our server instance
const server = http.createServer(app)

// This creates our socket using the instance of the server
const io = socketIO(server)
let roomName;

// This is what the socket.io syntax is like, we will work this later
io.on('connection', socket => {
  console.log('User connected')
  socket.on('room', (room) => {
    socket.leave(socket.room)
    socket.join(room);
    // roomName = room;
    socket.on('update content', content => {
      // once we get a 'update content' event from one of our clients, we will send it to the rest of the clients
      // we make use of the socket.emit method again with the argument given to use from the callback function above
      console.log('Updating content...')
      try {
          io.sockets.in(room).emit('update content', content)
      } catch(e) {
          console.log(e);
      }

    })
  })

  // console.log(io.nsps['/'].adapter.rooms)



  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(port, () => console.log(`Listening on port ${port}`))
