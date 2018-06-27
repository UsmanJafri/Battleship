const fs = require('fs')
const http = require('http')
const socketio = require('socket.io')

let state = {waiting: {},player1: {},player2: {}}

const readFile = file => new Promise((resolve, reject) =>
    fs.readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data)))

const delay = msecs => new Promise(resolve => setTimeout(resolve, msecs))

const server = http.createServer(async (request, response) =>
    response.end(await readFile(request.url.substr(1))))

const io = socketio(server)

io.sockets.on('connection', socket => {
    console.log('a client connected')
    socket.on('disconnect', () => console.log('a client disconnected'))
    socket.on('/startGame',data => {
        if (!(data.aircraft_carrier && data.battleship && data.cruiser && data.destroyer && data.submarine)) {
            socket.emit('/notAllShips')
        } else {
            ships = ['aircraft_carrier','battleship','cruiser','destroyer','submarine']
            shipSizes = [5,4,3,2,1]
            let valid = true
            for (i = 0;i < 5;i++) {
                shipName = 'box ship-' + ships[i]
                shipCoord = data[ships[i] + 'Coord']
                if (data[ships[i] + 'Vertical']) {
                    c = shipCoord[1]
                    for (r = shipCoord[0];r < shipCoord[0] + shipSizes[i];r++) {
                        if (data.grid[r] === undefined || data.grid[r].props.children[c] === undefined || shipName != data.grid[r].props.children[c].props.className) {
                            valid = false
                            break
                        }
                    }
                } else {
                    r = shipCoord[0]
                    for (c = shipCoord[1];c < shipCoord[1] + shipSizes[i];c++) {
                        if (data.grid[r] === undefined || data.grid[r].props.children[c] === undefined || shipName != data.grid[r].props.children[c].props.className) {
                            valid = false
                            break
                        }
                    }
                }
                if (!valid) {
                    socket.emit('/verificationFail',ships[i],data[ships[i] + 'Vertical'])
                    break
                }
            }
            if (valid) {
                socket.emit('/verificationSuccess')
                if (Object.keys(state.waiting).length === 0) {
                    socket.emit('/msg','You are Player 1, Waiting for Player 2 to connect...')
                    state.waiting = socket
                    state.player1 = socket
                }
                else {
                    socket.emit('/msg','You are Player 2, Waiting for Player 1 Turn')
                    state.player1.emit('/msg','You are Player 1, Your Turn')
                }
            }
        }
    })
})

server.listen(8000)
