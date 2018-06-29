const fs = require('fs')
const http = require('http')
const socketio = require('socket.io')

let state = {waiting: {},player1: {},player2: {},player1Data: {},player2Data: {}}

const readFile = file => new Promise((resolve, reject) =>
    fs.readFile(file, (err, data) => err ? reject(err) : resolve(data)))

const delay = msecs => new Promise(resolve => setTimeout(resolve, msecs))

const server = http.createServer(async (request, response) => response.end(await readFile(request.url.substr(1))))

const io = socketio(server)

io.sockets.on('connection', socket => {
    console.log('A Player Connected')
    socket.on('disconnect', () => console.log('A Player Disconnected'))
    socket.on('/startGame',data => {
        ships = ['aircraft_carrier','battleship','cruiser','destroyer','submarine']
        shipSizes = [5,4,3,2,1]
        if (!(data.aircraft_carrier && data.battleship && data.cruiser && data.destroyer && data.submarine)) {
            socket.emit('/notAllShips')
        } else {
            let valid = true
            for (i = 0;i < ships.length;i++) {
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
                    state.player1Data = data
                    socket.emit('/player',1)
                    socket.emit('/msg','You are Player 1, Waiting for Player 2 to connect...')
                    state.waiting = socket
                    state.player1 = socket
                }
                else {
                    state.player2Data = data
                    socket.emit('/player',2)
                    socket.emit('/msg','You are Player 2, Waiting for Player 1 Turn')
                    state.waiting = {}
                    for (i = 0;i < ships.length;i++) {
                        state.player1Data[ships[i] + 'Length'] = shipSizes[i]
                        state.player2Data[ships[i] + 'Length'] = shipSizes[i]
                    }
                    state.player2 = socket
                    state.player1.emit('/msg','You are Player 1, Your Turn')
                    state.player1.emit('/turn')
                }
            }
        }
    })
    socket.on('/turnPlayed',(r,c,id) => {
        if (id == 1) {
            socket.emit('/turnResult',r,c,state.player2Data.grid[r].props.children[c].props['data-occupied'])
            state.player2.emit('/enemyTurnResult',r,c)
            state.player2Data[state.player2Data.grid[r].props.children[c].props.className.substring(9,) + 'Length'] -= 1
            if (state.player2Data[state.player2Data.grid[r].props.children[c].props.className.substring(9,) + 'Length'] === 0) {
                shipKillMsg = "You destroyed your enemy's " + state.player2Data.grid[r].props.children[c].props.className.substring(9,) + '!'
                shipKillMsg2 = "Your " + state.player2Data.grid[r].props.children[c].props.className.substring(9,) + " was destroyed!"
                state.player1.emit('/msg',shipKillMsg)
                state.player2.emit('/msg',shipKillMsg2)
            }
        } else {
            socket.emit('/turnResult',r,c,state.player1Data.grid[r].props.children[c].props['data-occupied'])
            state.player1.emit('/enemyTurnResult',r,c)
            state.player1Data[state.player1Data.grid[r].props.children[c].props.className.substring(9,) + 'Length'] -= 1
            if (state.player1Data[state.player1Data.grid[r].props.children[c].props.className.substring(9,) + 'Length'] === 0) {
                shipKillMsg = "You destroyed your enemy's " + state.player1Data.grid[r].props.children[c].props.className.substring(9,) + '!'
                shipKillMsg2 = "Your " + state.player1Data.grid[r].props.children[c].props.className.substring(9,) + " was destroyed!"
                state.player1.emit('/msg',shipKillMsg2)
                state.player2.emit('/msg',shipKillMsg)
            }
        }
    })
})

server.listen(8000,() => console.log('Battleship Server Running'))
