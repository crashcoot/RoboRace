//server.js
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var io2 = require('socket.io-client');
var socket2 = io2.connect('http://localhost:50001', {reconnect: true});

var board = {
    goals: [5], 
    goalCount: 5,
    players: {},
    size: 25,
    winnerScore: "",
    winnerName: 0,
    winnerColor: 'red',
    winnerId: "",
}

var connections = {}

//initialize goals
for (var i = 0; i < board.goalCount; i++) {
    board.goals[i] = {x:0, y:0, id:i};
    NewGoal(i);
}

//Send an update to all connected sockets every 10ms
setInterval(function(){
    Object.keys(board.players).forEach(function (id) {
        board.players[id].moved = false;
    });
    io.sockets.emit('update', JSON.stringify(board));
    socket2.emit('update', JSON.stringify(board));
 }, 20);

setInterval(function() {
    NewGame();
}, 60000*.15); //Set multiplier to desired game minutes

io.on('connection', function (socket){
   console.log('connection');
   if (connections[socket.request.connection.remoteAddress] == null) {
    connections[socket.request.connection.remoteAddress] = {count: 1}
   } else {
    connections[socket.request.connection.remoteAddress].count += 1;
   }
   if (connections[socket.request.connection.remoteAddress].count < 10) {
    board.players[socket.id] = {
        x: Math.floor(Math.random()*board.size),
        y: Math.floor(Math.random()*board.size),
        playerId: socket.id,
        points: 0,
        moves: 0,
        color: "red",
        wins: 0,
        moved: false,
    }
     //Set name of player to desired name
     socket.on("rename", function (name) {
         board.players[socket.id].name = name.replace(/ /g, '_'); //removes spaces
     });
     socket.on("recolor", function (color) {
         board.players[socket.id].color = color;
     });
   }

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete board.players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });

    

    socket.on('move', function (e) {
        if (!board.players[socket.id].moved) {
            var move = JSON.parse(e);
            if (move.dx > 0 ) {
                move.dx = 1;
            }
            if (move.dx < 0) {
                move.dx = -1;
            }
            if (move.dy > 0 ) {
                move.dy = 1;
            }
            if (move.dy < 0) {
                move.dy = -1;
            }
            //console.log(move);
            board.players[socket.id].moved = true;
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
        }
    });

});

http.listen(50000, function () {
  console.log('listening on *:50000');
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
        
    });

    Object.keys(board.players).forEach(function (id) {
        if (board.winnerName == "") {
            board.winnerName = board.players[id].name;
            board.winnerScore = board.players[id].moves/board.players[id].points;
            board.winnerColor = board.players[id].color;
            board.winnerId = id;
        }
        if (board.players[id].moves/board.players[id].points < board.winnerScore || board.winnerScore == null) {
            board.winnerName = board.players[id].name;
            board.winnerScore = board.players[id].moves/board.players[id].points;
            board.winnerColor = board.players[id].color;
            board.winnerId = id
        }
    });
    if (board.players[board.winnerId] != null) {
        board.players[board.winnerId].wins++;
    }
    for (var i = 0; i < board.goalCount; i++) {
        board.goals[i] = {x:0, y:0, id:i};
        NewGoal(i);
    }
    Object.keys(board.players).forEach(function (id) { 
        board.players[id].moves = 0;
        board.players[id].points = 0;
        board.players[id].x = Math.floor(Math.random()*board.size);
        board.players[id].y = Math.floor(Math.random()*board.size);
    });
}