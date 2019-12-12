var express = require('express');
var app = express();
var server = require('http').createServer(app).listen(50001);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.sockets.on('connection', function (socket) {
    console.log("Server connected");
    socket.on('update', function(data) {
        console.log(JSON.parse(data))
        io.sockets.emit('relay', data);
    });
});