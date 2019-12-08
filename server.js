//server.js
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var board = {
    goals: {}, 
    goalCount: 5,
    players: {},
    size: 25
}

//initialize goals
for (var i = 0; i < board.goalCount; i++) {
    board.goals[i] = {x:0, y:0};
    NewGoal(i);
}

for (var i = 0; i < board.goalCount; i++) {
    console.log(board.goals[i])
}

setInterval(function(){ 
    io.sockets.emit('update', JSON.stringify(board)); 
 }, 50);

io.on('connection', function (socket){
   console.log('connection');
   board.players[socket.id] = {
       x: Math.floor(Math.random()*board.size),
       y: Math.floor(Math.random()*board.size),
       playerId: socket.id,
       points: 0
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