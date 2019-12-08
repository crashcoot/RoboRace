//client.js
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});
var myId;

var board = {};

var move = {
    dx: 0,
    dy: 0
}

var players = {};

var goal = {};

var myPlayer = {

}

var id;

// Add a connect listener
socket.on('connect', function () {
    console.log('Connected!');
    myId = socket.id;
});




socket.on('update', function(data) {
    //console.log(JSON.parse(data));
    players = JSON.parse(data).players
    goal = JSON.parse(data).goal
    board.size = JSON.parse(data).size
    Object.keys(players).forEach(function (id) {
        if (players[id].playerId === myId) {
          myPlayer = players[id]
        }
    });
    console.clear();
    PrintBoard();
    MakeMove(myPlayer, goal);
});


function MakeMove(p, g) {
    //console.log(p.x);
    if (p.x < g.x) {
        move.dx = 1;
    }
    if (p.x > g.x) {
        move.dx = -1;
    }
    if (p.y < g.y) {
        move.dy = 1;
    }
    if (p.y > g.y) {
        move.dy = -1;
    }
    socket.emit('move', JSON.stringify(move));
    move.dx = 0;
    move.dy = 0;
}


function PrintBoard() {
    size = board.size;
    boardString = "";
    var printed = false;
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            Object.keys(players).forEach(function (id) {
                if (players[id].x == x && players[id].y == y && !printed) {
                    boardString += "X";
                    printed = true;
                }
            });
            if (goal.x == x && goal.y == y && !printed) {
                boardString += "O";
                printed = true;
            }
            if (!printed) {
                boardString += "-"
            }
            printed = false;
        }
        boardString += '\n';
        
    }
    console.log(boardString);
}     