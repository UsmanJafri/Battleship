const socket = io()

const delay = secs => new Promise(resolve => setTimeout(resolve, 1000*secs))

const shipsize = {
    'aircraft_carrier': 5,
    'battleship': 4,
    'cruiser': 3,
    'destroyer': 2,
    'submarine': 1
}
const state = {}

const gridInit = (isGuess) => {
    grid = []
    if (isGuess) {
        for (r = 0;r < 10;r++) {
            row = []
            for (c = 0;c < 10;c++) {
                row.push(React.createElement('div',{className: 'box',onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': r,'data-c': c,'data-occupied': false}))
            }
            grid.push(React.createElement('div',null,row))
        }
    } else {
        for (r = 0;r < 10;r++) {
            row = []
            for (c = 0;c < 10;c++) {
                row.push(React.createElement('div',{className: 'box',onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': r,'data-c': c,'data-occupied': false}))
            }
            grid.push(React.createElement('div',null,row))
        }
    }
    return grid
}

const shipClick = event => {
    r = parseInt(event.target.dataset.r)
    c = parseInt(event.target.dataset.c)
    startPos = [r,c]
    ship = state.selectedShip
    shipSize = parseInt(shipsize[ship])
    shipClassname = 'box ship-'+ship
    shipStatus = state[ship]
    maxDim = 11 - shipSize
    if (event.type == 'contextmenu') {
        if (r < maxDim) {
            for (i = r;i < r + shipSize;i++) {
                if (state.grid[i].props.children[c].props['className'] === shipClassname) {
                    continue
                }
                else if (state.grid[i].props.children[c].props['data-occupied']) {
                    return
                }
            }
        }
        if (r < maxDim && !shipStatus) {
            for (i = r;i < r + shipSize;i++) {
                state.grid[i].props.children[c] = React.createElement('div',{className: shipClassname,onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': i,'data-c': c,'data-occupied': true})
            }
            setState({grid: state.grid,[ship]: true,[ship+"Coord"]: startPos,[ship+"Vertical"]: true})
        }
        else if (r < maxDim && shipStatus) {
            oldR = state[ship+"Coord"][0]
            oldC = state[ship+"Coord"][1]
            if (state[ship+"Vertical"]) {
                for (i = oldR;i < oldR + shipSize;i++) {
                    state.grid[i].props.children[oldC] = React.createElement('div',{className: 'box',onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': i,'data-c': oldC,'data-occupied': false})
                }
            }
            else {
                for (i = oldC;i < oldC + shipSize;i++) {
                    state.grid[oldR].props.children[i] = React.createElement('div',{className: 'box',onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': oldR,'data-c': i,'data-occupied': false})
                }
            }
            for (i = r;i < r + shipSize;i++) {
                state.grid[i].props.children[c] = React.createElement('div',{className: shipClassname,onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': i,'data-c': c,'data-occupied': true})
            }
            setState({grid: state.grid,[ship+"Coord"]: startPos,[ship+"Vertical"]: true})
        }
    }
    else {
        if (c < maxDim) {
            for (i = c;i < c + shipSize;i++) {
                if (state.grid[r].props.children[i].props['className'] === shipClassname) {
                    continue
                }
                else if (state.grid[r].props.children[i].props['data-occupied']) {
                    return
                }
            }
        }
        if (c < maxDim && !shipStatus) {
            for (i = c;i < c + shipSize;i++) {
                state.grid[r].props.children[i] = React.createElement('div',{className: shipClassname,onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': r,'data-c': i,'data-occupied': true})
            }
            setState({grid: state.grid,[ship]: true,[ship+"Coord"]: startPos,[ship+"Vertical"]: false})
        }
        else if (c < maxDim && shipStatus) {
            oldR = state[ship+"Coord"][0]
            oldC = state[ship+"Coord"][1]
            if (state[ship+"Vertical"]) {
                for (i = oldR;i < oldR + shipSize;i++) {
                    state.grid[i].props.children[oldC] = React.createElement('div',{className: 'box',onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': i,'data-c': oldC,'data-occupied': false})
                }
            }
            else {
                for (i = oldC;i < oldC + shipSize;i++) {
                    state.grid[oldR].props.children[i] = React.createElement('div',{className: 'box',onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': oldR,'data-c': i,'data-occupied': false})
                }
            }
            for (i = c;i < c + shipSize;i++) {
                state.grid[r].props.children[i] = React.createElement('div',{className: shipClassname,onClick: ev => shipClick(ev),onContextMenu: ev => shipClick(ev),'data-r': r,'data-c': i,'data-occupied': true})
            }
            setState({grid: state.grid,[ship+"Coord"]: startPos,[ship+"Vertical"]: false})
        }
    }
}

const shipClickGuess = event => {
    r = parseInt(event.target.dataset.r)
    c = parseInt(event.target.dataset.c)
    startPos = [r,c]
    ship = state.guessSelectedShip
    shipSize = parseInt(shipsize[ship])
    shipClassname = 'box ship-'+ship
    shipStatus = state[ship+"Guess"]
    maxDim = 11 - shipSize
    if (event.type == 'contextmenu') {
        if (r < maxDim) {
            for (i = r;i < r + shipSize;i++) {
                if (state.guessGrid[i].props.children[c].props['className'] === shipClassname) {
                    continue
                }
                else if (state.guessGrid[i].props.children[c].props['data-occupied']) {
                    return
                }
            }
        }
        if (r < maxDim && !shipStatus) {
            for (i = r;i < r + shipSize;i++) {
                state.guessGrid[i].props.children[c] = React.createElement('div',{className: shipClassname,onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': i,'data-c': c,'data-occupied': true})
            }
            setState({guessGrid: state.guessGrid,[ship+"Guess"]: true,[ship+"GuessCoord"]: startPos,[ship+"GuessVertical"]: true})
        }
        else if (r < maxDim && shipStatus) {
            oldR = state[ship+"GuessCoord"][0]
            oldC = state[ship+"GuessCoord"][1]
            if (state[ship+"GuessVertical"]) {
                for (i = oldR;i < oldR + shipSize;i++) {
                    state.guessGrid[i].props.children[oldC] = React.createElement('div',{className: 'box',onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': i,'data-c': oldC,'data-occupied': false})
                }
            }
            else {
                for (i = oldC;i < oldC + shipSize;i++) {
                    state.guessGrid[oldR].props.children[i] = React.createElement('div',{className: 'box',onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': oldR,'data-c': i,'data-occupied': false})
                }
            }
            for (i = r;i < r + shipSize;i++) {
                state.guessGrid[i].props.children[c] = React.createElement('div',{className: shipClassname,onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': i,'data-c': c,'data-occupied': true})
            }
            setState({guessGrid: state.guessGrid,[ship+"GuessCoord"]: startPos,[ship+"GuessVertical"]: true})
        }
    }
    else {
        if (c < maxDim) {
            for (i = c;i < c + shipSize;i++) {
                if (state.guessGrid[r].props.children[i].props['className'] === shipClassname) {
                    continue
                }
                else if (state.guessGrid[r].props.children[i].props['data-occupied']) {
                    return
                }
            }
        }
        if (c < maxDim && !shipStatus) {
            for (i = c;i < c + shipSize;i++) {
                state.guessGrid[r].props.children[i] = React.createElement('div',{className: shipClassname,onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': r,'data-c': i,'data-occupied': true})
            }
            setState({guessGrid: state.guessGrid,[ship+"Guess"]: true,[ship+"GuessCoord"]: startPos,[ship+"GuessVertical"]: false})
        }
        else if (c < maxDim && shipStatus) {
            oldR = state[ship+"GuessCoord"][0]
            oldC = state[ship+"GuessCoord"][1]
            if (state[ship+"GuessVertical"]) {
                for (i = oldR;i < oldR + shipSize;i++) {
                    state.guessGrid[i].props.children[oldC] = React.createElement('div',{className: 'box',onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': i,'data-c': oldC,'data-occupied': false})
                }
            }
            else {
                for (i = oldC;i < oldC + shipSize;i++) {
                    state.guessGrid[oldR].props.children[i] = React.createElement('div',{className: 'box',onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': oldR,'data-c': i,'data-occupied': false})
                }
            }
            for (i = c;i < c + shipSize;i++) {
                state.guessGrid[r].props.children[i] = React.createElement('div',{className: shipClassname,onClick: ev => shipClickGuess(ev),onContextMenu: ev => shipClickGuess(ev),'data-r': r,'data-c': i,'data-occupied': true})
            }
            setState({guessGrid: state.guessGrid,[ship+"GuessCoord"]: startPos,[ship+"GuessVertical"]: false})
        }
    }
}

const setState = updates => {
    Object.assign(state, updates)
    ReactDOM.render(React.createElement('div', null, state.msg,
        React.createElement('div',null,state.grid),
        React.createElement('select',{onChange: ev => setState({selectedShip: ev.target.value})},
            React.createElement('option',{},'aircraft_carrier'),
            React.createElement('option',{},'battleship'),
            React.createElement('option',{},'cruiser'),
            React.createElement('option',{},'destroyer'),
            React.createElement('option',{},'submarine')
        ),React.createElement('div',null,state.guessGrid),
        React.createElement('select',{onChange: ev => setState({guessSelectedShip: ev.target.value})},
            React.createElement('option',{},'aircraft_carrier'),
            React.createElement('option',{},'battleship'),
            React.createElement('option',{},'cruiser'),
            React.createElement('option',{},'destroyer'),
            React.createElement('option',{},'submarine')
        ),React.createElement('button',{onClick: ev => socket.emit("clientState",state)},"Start Game")
    ),document.getElementById('root'))
    // console.log(state)
}

setState({msg: 'Hello World',grid: gridInit(false),guessGrid: gridInit(true),aircraft_carrier: false,battleship: false,cruiser: false,destroyer: false,submarine: false,selectedShip: 'aircraft_carrier',guessSelectedShip: 'aircraft_carrier'})
