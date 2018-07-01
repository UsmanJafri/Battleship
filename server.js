const fs = require('fs')
const http = require('http')
const socketio = require('socket.io')

let states = {}
let lastAssignedId = 0
let waiting = {}

const readFile = file => new Promise((resolve, reject) =>
    fs.readFile(file, (err, data) => err ? reject(err) : resolve(data)))

const delay = msecs => new Promise(resolve => setTimeout(resolve, msecs))

const server = http.createServer(async (request, response) => response.end(await readFile(request.url.substr(1))))

const io = socketio(server)

io.sockets.on('connection', socket => {
    socket.on('disconnect', () => {
        for (var [k,v] of Object.entries(states)) {
            if (states[k].player1.socket === socket) {
                console.log('State',k,'Player 1 Left')
                if (Object.keys(states[k].player2).length !== 0) {
                    states[k].player2.socket.emit('/msg','Your opponent has left. Please refresh page for a new opponent.')
                    states[k].player2.socket.disconnect()
                } else {
                    waiting = {}
                    lastAssignedId += 1
                }
                delete states[k]
                break
            } else if (states[k].player2.socket === socket) {
                console.log('State',k,'Player 2 Left')
                if (Object.keys(states[k].player1) !== 0) {
                    states[k].player1.socket.emit('/msg','Your opponent has left. Please refresh page for a new opponent.')
                    states[k].player1.socket.disconnect()
                }
                delete states[k]
                break
            }
        }
    })
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
                if (Object.keys(waiting).length === 0) {
                    let newState = {player1: {},player2: {}}
                    newState.player1 = data
                    newState.player1.socket = socket
                    waiting = socket
                    states[lastAssignedId] = newState
                    socket.emit('/player',lastAssignedId,1)
                    socket.emit('/msg','You are Player 1, Waiting for Player 2 to connect...')
                    console.log('State',lastAssignedId,'Player 1 Connected')
                } else {
                    states[lastAssignedId].player2 = data
                    states[lastAssignedId].player2.socket = socket
                    waiting = {}
                    socket.emit('/player',lastAssignedId,2)
                    socket.emit('/msg','You are Player 2, Waiting for Player 1 Turn')
                    for (i = 0;i < ships.length;i++) {
                        states[lastAssignedId].player1[ships[i] + 'Length'] = shipSizes[i]
                        states[lastAssignedId].player2[ships[i] + 'Length'] = shipSizes[i]
                    }
                    states[lastAssignedId].player1.socket.emit('/turn')
                    states[lastAssignedId].player1.socket.emit('/msg','You are Player 1, Your Turn')
                    console.log('State',lastAssignedId,'Player 2 Connected')
                    lastAssignedId += 1
                }
            }
        }
    })
    socket.on('/turnPlayed',(r,c,id,pId) => {
        let state = states[id]
        if (pId == 1) {
            socket.emit('/turnResult',r,c,state.player2.grid[r].props.children[c].props['data-occupied'])
            state.player2.socket.emit('/enemyTurnResult',r,c)
            state.player2[state.player2.grid[r].props.children[c].props.className.substring(9,) + 'Length'] -= 1
            if (state.player2['aircraft_carrierLength'] === 0 && state.player2['battleshipLength'] === 0 && state.player2['cruiserLength'] === 0 && state.player2['destroyerLength'] === 0 && state.player2['submarineLength'] === 0) {
                state.player1.socket.emit('/msg','YOU WIN!')
                state.player2.socket.emit('/msg','YOU LOOSE!')
                state.player1.socket.disconnect()
                state.player2.socket.disconnect()
            } else if (state.player2[state.player2.grid[r].props.children[c].props.className.substring(9,) + 'Length'] === 0) {
                shipKillMsg = "You destroyed your enemy's " + state.player2.grid[r].props.children[c].props.className.substring(9,) + '!'
                shipKillMsg2 = "Your " + state.player2.grid[r].props.children[c].props.className.substring(9,) + " was destroyed!"
                state.player1.socket.emit('/msg',shipKillMsg)
                state.player2.socket.emit('/msg',shipKillMsg2)
            }
        } else {
            socket.emit('/turnResult',r,c,state.player1.grid[r].props.children[c].props['data-occupied'])
            state.player1.socket.emit('/enemyTurnResult',r,c)
            state.player1[state.player1.grid[r].props.children[c].props.className.substring(9,) + 'Length'] -= 1
            if (state.player1['aircraft_carrierLength'] === 0 && state.player1['battleshipLength'] === 0 && state.player1['cruiserLength'] === 0 && state.player1['destroyerLength'] === 0 && state.player1['submarineLength'] === 0) {
                state.player2.socket.emit('/msg','YOU WIN!')
                state.player1.socket.emit('/msg','YOU LOOSE!')
                state.player1.socket.disconnect()
                state.player2.socket.disconnect()
            } else if (state.player1[state.player1.grid[r].props.children[c].props.className.substring(9,) + 'Length'] === 0) {
                shipKillMsg = "You destroyed your enemy's " + state.player1.grid[r].props.children[c].props.className.substring(9,) + '!'
                shipKillMsg2 = "Your " + state.player1.grid[r].props.children[c].props.className.substring(9,) + " was destroyed!"
                state.player1.socket.emit('/msg',shipKillMsg2)
                state.player2.socket.emit('/msg',shipKillMsg)
            }
        }
    })
})

server.listen(8000,() => console.log('Battleship Server Running'))
