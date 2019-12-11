//client.js
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});

var name = "YOUR NAME HERE";

var myId;
var board = {};
var move = {
    dx: 0,
    dy: 0
}
var players = {};
var goals = {};
var myPlayer = {}
var leaderboard;

// Add a connect listener
socket.on('connect', function () {
    console.log('Connected!');
    myId = socket.id;
    socket.emit("rename", name);
});

socket.on('update', function(data) {
    //console.log(JSON.parse(data));
    board = JSON.parse(data);
    players = board.players;
    goals = board.goals;
    board.size = board.size;
    goalCount = board.goalCount;
    myPlayer = players[myId];
    leaderboard = board.leaderboard;
    console.clear();
    PrintBoard();
    PrintStats();
    MakeMove(myPlayer, GetClosestGoal());
});

function MakeMove(p, g) {
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
            for (var i = 0; i < goalCount; i++) {
                if (goals[i].x == x && goals[i].y == y && !printed) {
                    boardString += "O";
                    printed = true;
                }
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

function PrintStats() {
    console.log("Name: " + myPlayer.name);
    console.log("Points:" + myPlayer.points);
    console.log("Moves:" + myPlayer.moves);
    console.log(" ");
    console.log(board.leaderboard);
    console.log(" ");
    console.log("Previous Winner: " + board.winnerName + ": " + board.winnerScore);
}

function GetClosestGoal() {
    var closestGoal = goals[0];
    for (var i = 0; i < goalCount; i++) {
        //console.log("Distance to Goal " + i + ": " + GetDistance(myPlayer.x, myPlayer.y, goals[i].x, goals[i].y));
        if (GetDistance(myPlayer.x, myPlayer.y, goals[i].x, goals[i].y) < GetDistance(myPlayer.x, myPlayer.y, closestGoal.x, closestGoal.y)) {
            closestGoal = goals[i];
        }
    }
    return closestGoal;
}

function GetDistance(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}