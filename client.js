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
    row = parseInt(event.target.dataset.r)
    col = parseInt(event.target.dataset.c)
    state.grid[row].props.children[col] = React.createElement('div',{className: 'box ship-aircraft_carrier',onClick: ev => shipClick(ev),'data-r': r,'data-c': c})
    setState({grid: state.grid})
}

const setState = updates => {
    Object.assign(state, updates)
    ReactDOM.render(React.createElement('div', null, state.msg,
        React.createElement('div',null,state.grid)
    ),document.getElementById('root'))
}

setState({msg: 'Hello World',grid: gridInit()})
