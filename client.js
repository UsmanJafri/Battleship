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
    if (c < 6 && !state.ac) {
        for (i = 0;i < 5;i++) {
            state.grid[r].props.children[c] = React.createElement('div',{className: 'box ship-aircraft_carrier',onClick: ev => shipClick(ev),'data-r': r,'data-c': c})
            c += 1
        }
        setState({grid: state.grid,ac: true,ac_coord: startPos})
    }
    else if (c < 6 && state.ac) {
        oldR = state.ac_coord[0]
        oldC = state.ac_coord[1]
        for (i = 0;i < 5;i++) {
            state.grid[oldR].props.children[oldC] = React.createElement('div',{className: 'box',onClick: ev => shipClick(ev),'data-r': oldR,'data-c': oldC})
            oldC += 1
        }
        for (i = 0;i < 5;i++) {
            state.grid[r].props.children[c] = React.createElement('div',{className: 'box ship-aircraft_carrier',onClick: ev => shipClick(ev),'data-r': r,'data-c': c})
            c += 1
        }
        setState({grid: state.grid,ac_coord: startPos})
    }
}

const setState = updates => {
    Object.assign(state, updates)
    ReactDOM.render(React.createElement('div', null, state.msg,
        React.createElement('div',null,state.grid),
        React.createElement('select',null,
            React.createElement('option',{},'aircraft_carrier'),
            React.createElement('option',{},'battleship'),
            React.createElement('option',{},'cruiser'),
            React.createElement('option',{},'destroyer'),
            React.createElement('option',{},'submarine')
        ),
    ),document.getElementById('root'))
}

setState({msg: 'Hello World',grid: gridInit(),ac: false})
