const fs = require('fs')
const http = require('http')
const socketio = require('socket.io')

const readFile = file => new Promise((resolve, reject) =>
    fs.readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data)))

const delay = msecs => new Promise(resolve => setTimeout(resolve, msecs))

const server = http.createServer(async (request, response) =>
    response.end(await readFile(request.url.substr(1))))

const io = socketio(server)

io.sockets.on('connection', socket => {
    console.log('a client connected')
    socket.on('disconnect', () => console.log('a client disconnected'))
})

server.listen(8000)
