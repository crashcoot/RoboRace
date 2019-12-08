//server.js
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var g = {x:5, y:5}

var board = {
    goal: g, 
    players: {},
    size: 25
}

setInterval(function(){ 
    io.sockets.emit('update', JSON.stringify(board)); 
 }, 50);

io.on('connection', function (socket){
   console.log('connection');
   board.players[socket.id] = {
       x: Math.floor(Math.random()*board.size),
       y: Math.floor(Math.random()*board.size),
       playerId: socket.id
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
        var move = JSON.parse(e);
        console.log(move);
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
        CheckGoalCollision();
    });

});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

function CheckGoalCollision() {
    Object.keys(board.players).forEach(function (id) {
        if (board.players[id].x == board.goal.x && board.players[id].y == board.goal.y) {
            NewGoal();
        }
    });
}

function NewGoal() {
    board.goal.x = Math.floor(Math.random()*board.size)
    board.goal.y = Math.floor(Math.random()*board.size)
}