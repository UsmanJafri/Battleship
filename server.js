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
    socket.on('clientState',data => {
        if (!(data.aircraft_carrier && data.battleship && data.cruiser && data.destroyer && data.submarine)) {
            console.log("Not all ships placed.")
        } else {
            ships = ['aircraft_carrier','battleship','cruiser','destroyer','submarine']
            shipSizes = [5,4,3,2,1]
            for (i = 0;i < 5;i++) {
                shipName = 'box ship-' + ships[i]
                shipCoord = data[ships[i] + 'Coord']
                let valid = true
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
                    console.log('INVALID:',ships[i],'VERTICAL:',data[ships[i] + 'Vertical'])
                } else {
                    console.log(ships[i],'verified.')
                }
            }
        }
    })
})

server.listen(8000)
