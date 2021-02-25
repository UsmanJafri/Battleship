Battleship
============================
*A React + NodeJS implementation of the 2-player guessing game: Battleship. Features online multiplayer.*

<img src="/battleship-sample.png">

## Requirements

1. Node.js (Tested on `v14.16.0`)
2. JavaScript-capable browser (Tested on Google Chrome)	2. JavaScript-capable browser (Tested on Google Chrome `v88.0.4324.150`)

## Instructions (Client)
1. To play the Battleship game, browse to `/client.html` of the host URL. (e.g: http://localhost:8000/client.html)
2. Two grids will be presented:
	1. **Ship Grid:** This is where the player positions their ships for the opponent to guess and attack
	2. **Guess Grid:** This is where the player guesses and tries to attack the opponent's ships
3. Use the drop-down list to select the type of ship to place

	| Ship Name | Length | Color |
	|---|---|---|
	| Aircraft Carrier | 5 | Red |
	| Battleship | 4 | Black |
	| Cruiser | 3 | Grey |
	| Destroyer | 2 | Yellow |
	| Submarine | 1 | Green |

4. Left-click to place the ship horizontally or right-click to place the ship vertically
5. If a ship needs repositioning, repeat steps 3 - 4
6. Once all ships have been placed, press Start Game
7. If an opponent is not available, please wait for an opponent
8. Once an opponent is available, use the guess grid to attack enemy positions, a cross represents a successful hit whereas a nought represents a miss
9. The first person to sink all ships wins

## Instructions (Server)
1. Open a Terminal window in the directory containing `server.js` and run:
> npm install
2. Run the Battleship Server using the command:
> npm start
3. The server console window will display connection logs

## Features
- Server-side verification of ship placement and turns to prevent cheating
- Realtime grid update and message notification of every turn's outcome
- Multiple parallel game instances
- Player notified if opponent leaves