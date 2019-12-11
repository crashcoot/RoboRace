//server.js
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var io2 = require('socket.io-client');
var socket2 = io2.connect('http://localhost:8080', {reconnect: true});

var board = {
    goals: {}, 
    goalCount: 5,
    players: {},
    size: 25,
    winnerScore: "",
    winnerName: 0,
    winnerColor: 'red',
}

//initialize goals
for (var i = 0; i < board.goalCount; i++) {
    board.goals[i] = {x:0, y:0};
    NewGoal(i);
}

//Send an update to all connected sockets every 10ms
setInterval(function(){ 
    io.sockets.emit('update', JSON.stringify(board));
    socket2.emit('update', JSON.stringify(board));
 }, 20);

setInterval(function() {
    NewGame();
}, 60000*.15); //Set multiplier to desired game minutes

io.on('connection', function (socket){
   console.log('connection');
   board.players[socket.id] = {
       x: Math.floor(Math.random()*board.size),
       y: Math.floor(Math.random()*board.size),
       playerId: socket.id,
       points: 0,
       moves: 0,
       color: "red",
   }
    //Set name of player to desired name
    socket.on("rename", function (name) {
        board.players[socket.id].name = name.replace(/ /g, '_'); //removes spaces
    });
    socket.on("recolor", function (color) {
        board.players[socket.id].color = color;
    });

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete board.players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });

    

    socket.on('move', function (e) {
        var move = JSON.parse(e);
        //console.log(move);
        var col = false;
        Object.keys(board.players).forEach(function (id) {
            if (board.players[socket.id].x+move.dx == board.players[id].x && board.players[socket.id].y+move.dy == board.players[id].y) {
                col = true;
            }
        });
        if (!col) {
            board.players[socket.id].x += move.dx;
            board.players[socket.id].y += move.dy;
        }
        board.players[socket.id].moves += 1;
        CheckGoalCollision();
    });

});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

function CheckGoalCollision() {
    Object.keys(board.players).forEach(function (id) {
        for (var i = 0; i < board.goalCount; i++) {
            if (board.players[id].x == board.goals[i].x && board.players[id].y == board.goals[i].y) {
                board.players[id].points += 1;
                NewGoal(i);
            }
        }
        
    });
}

function NewGoal(i) {
    board.goals[i].x = Math.floor(Math.random()*board.size)
    board.goals[i].y = Math.floor(Math.random()*board.size)
}

function NewGame() {
    board.winnerName = "";
    Object.keys(board.players).forEach(function (id) { 
        if (board.winnerName == "") {
            board.winnerName = board.players[id].name;
            board.winnerScore = board.players[id].moves/board.players[id].points;
        }
        if (board.players[id].moves/board.players[id].points < board.winnerScore || board.winnerScore == null) {
            console.log("new winner");
            board.winnerName = board.players[id].name;
            board.winnerScore = board.players[id].moves/board.players[id].points;
        }
    });
    for (var i = 0; i < board.goalCount; i++) {
        board.goals[i] = {x:0, y:0};
        NewGoal(i);
    }
    Object.keys(board.players).forEach(function (id) { 
        board.players[id].moves = 0;
        board.players[id].points = 0;
        board.players[id].x = Math.floor(Math.random()*board.size);
        board.players[id].y = Math.floor(Math.random()*board.size);
    });
}