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

const gridInit = () => {
    grid = []
    for (r = 0;r < 10;r++) {
        row = []
        for (c = 0;c < 10;c++) {
            row.push(React.createElement('div',{className: 'box',onClick: ev => shipClick(ev),'data-r': r,'data-c': c}))
        }
        grid.push(React.createElement('div',null,row))
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
    maxCol = 11 - shipSize
    if (c < maxCol && !shipStatus) {
        for (i = 0;i < shipSize;i++) {
            state.grid[r].props.children[c] = React.createElement('div',{className: shipClassname,onClick: ev => shipClick(ev),'data-r': r,'data-c': c})
            c += 1
        }
        setState({grid: state.grid,[ship]: true,[ship+"Coord"]: startPos})
    }
    else if (c < maxCol && shipStatus) {
        oldR = state[ship+"Coord"][0]
        oldC = state[ship+"Coord"][1]
        for (i = 0;i < shipSize;i++) {
            state.grid[oldR].props.children[oldC] = React.createElement('div',{className: 'box',onClick: ev => shipClick(ev),'data-r': oldR,'data-c': oldC})
            oldC += 1
        }
        for (i = 0;i < shipSize;i++) {
            state.grid[r].props.children[c] = React.createElement('div',{className: shipClassname,onClick: ev => shipClick(ev),'data-r': r,'data-c': c})
            c += 1
        }
        setState({grid: state.grid,[ship+"Coord"]: startPos})
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
        ),
    ),document.getElementById('root'))
    // console.log(state)
}

setState({msg: 'Hello World',grid: gridInit(),aircraft_carrier: false,battleship: false,cruiser: false,destroyer: false,submarine: false,selectedShip: 'aircraft_carrier'})
