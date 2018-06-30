const fs = require('fs')
const http = require('http')
const socketio = require('socket.io')

let allStates = {lastAssignedId: 0,waiting: {}}

const readFile = file => new Promise((resolve, reject) =>
    fs.readFile(file, (err, data) => err ? reject(err) : resolve(data)))

const delay = msecs => new Promise(resolve => setTimeout(resolve, msecs))

const server = http.createServer(async (request, response) => response.end(await readFile(request.url.substr(1))))

const io = socketio(server)

io.sockets.on('connection', socket => {
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
                if (Object.keys(allStates.waiting).length === 0) {
                    let newState = {player1: {},player2: {},player1Data: {},player2Data: {}}
                    newState.player1Data = data
                    newState.player1 = socket
                    allStates.waiting = socket
                    allStates[allStates.lastAssignedId] = newState
                    socket.emit('/player',allStates.lastAssignedId,1)
                    socket.emit('/msg','You are Player 1, Waiting for Player 2 to connect...')
                    console.log('State:',allStates.lastAssignedId,'Player 1 Connected')
                } else {
                    allStates[allStates.lastAssignedId].player2Data = data
                    allStates[allStates.lastAssignedId].player2 = socket
                    allStates.waiting = {}
                    socket.emit('/player',allStates.lastAssignedId,2)
                    socket.emit('/msg','You are Player 2, Waiting for Player 1 Turn')
                    for (i = 0;i < ships.length;i++) {
                        allStates[allStates.lastAssignedId].player1Data[ships[i] + 'Length'] = shipSizes[i]
                        allStates[allStates.lastAssignedId].player2Data[ships[i] + 'Length'] = shipSizes[i]
                    }
                    allStates[allStates.lastAssignedId].player1.emit('/turn')
                    allStates[allStates.lastAssignedId].player1.emit('/msg','You are Player 1, Your Turn')
                    console.log('State:',allStates.lastAssignedId,'Player 2 Connected')
                    allStates.lastAssignedId += 1
                }
            }
        }
    })
    socket.on('/turnPlayed',(r,c,id,pId) => {
        let state = allStates[id]
        if (pId == 1) {
            socket.emit('/turnResult',r,c,state.player2Data.grid[r].props.children[c].props['data-occupied'])
            state.player2.emit('/enemyTurnResult',r,c)
            state.player2Data[state.player2Data.grid[r].props.children[c].props.className.substring(9,) + 'Length'] -= 1
            if (state.player2Data['aircraft_carrierLength'] === 0 && state.player2Data['battleshipLength'] === 0 && state.player2Data['cruiserLength'] === 0 && state.player2Data['destroyerLength'] === 0 && state.player2Data['submarineLength'] === 0) {
                state.player1.emit('/msg','YOU WIN!')
                state.player2.emit('/msg','YOU LOOSE!')
                state.player1.disconnect()
                state.player2.disconnect()
                state.waiting = {}
                state.player1 = {}
                state.player2 = {}
                state.player1Data = {}
                state.player2Data = {}
            } else if (state.player2Data[state.player2Data.grid[r].props.children[c].props.className.substring(9,) + 'Length'] === 0) {
                shipKillMsg = "You destroyed your enemy's " + state.player2Data.grid[r].props.children[c].props.className.substring(9,) + '!'
                shipKillMsg2 = "Your " + state.player2Data.grid[r].props.children[c].props.className.substring(9,) + " was destroyed!"
                state.player1.emit('/msg',shipKillMsg)
                state.player2.emit('/msg',shipKillMsg2)
            }
        } else {
            socket.emit('/turnResult',r,c,state.player1Data.grid[r].props.children[c].props['data-occupied'])
            state.player1.emit('/enemyTurnResult',r,c)
            state.player1Data[state.player1Data.grid[r].props.children[c].props.className.substring(9,) + 'Length'] -= 1
            if (state.player1Data['aircraft_carrierLength'] === 0 && state.player1Data['battleshipLength'] === 0 && state.player1Data['cruiserLength'] === 0 && state.player1Data['destroyerLength'] === 0 && state.player1Data['submarineLength'] === 0) {
                state.player2.emit('/msg','YOU WIN!')
                state.player1.emit('/msg','YOU LOOSE!')
                state.player1.disconnect()
                state.player2.disconnect()
                state.waiting = {}
                state.player1 = {}
                state.player2 = {}
                state.player1Data = {}
                state.player2Data = {}
            } else if (state.player1Data[state.player1Data.grid[r].props.children[c].props.className.substring(9,) + 'Length'] === 0) {
                shipKillMsg = "You destroyed your enemy's " + state.player1Data.grid[r].props.children[c].props.className.substring(9,) + '!'
                shipKillMsg2 = "Your " + state.player1Data.grid[r].props.children[c].props.className.substring(9,) + " was destroyed!"
                state.player1.emit('/msg',shipKillMsg2)
                state.player2.emit('/msg',shipKillMsg)
            }
        }
    })
})

server.listen(8000,() => console.log('Battleship Server Running'))
