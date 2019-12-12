socket = io('http://108.162.166.200:50001/');

let canvas1 = document.getElementById("canvas1");
let canvas2 = document.getElementById("canvas2");

var board = {
    goals: {},
    goalCount: 0,
    players: {},
    size: 0,
    winnerScore: 0,
    winnerName: ''
}

socket.on('relay', function(data) {
    board = JSON.parse(data);
    //console.log(board);
    drawcanvas1();
    updateLeaderboard();
});




function drawcanvas1() {
    const context = canvas1.getContext("2d");

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas1.width, canvas1.height); //erase canvas1

    //Grid
    context.fillStyle = "black";
    for (var x = 0; x < board.size+1; x++) {
        context.beginPath();
        context.moveTo(canvas1.width/board.size*x, 0);
        context.lineTo(canvas1.width/board.size*x,canvas1.height);
        context.stroke();
    }
    for (var y = 0; y < board.size+1; y++) {
        context.beginPath();
        context.moveTo(0, canvas1.height/board.size*y);
        context.lineTo(canvas1.width, canvas1.height/board.size*y);
        context.stroke();
    }

    //Players
    Object.keys(board.players).forEach(function (id) {
        context.fillStyle = board.players[id].color;;
        context.fillRect(board.players[id].x*canvas1.height/board.size,board.players[id].y*canvas1.height/board.size,canvas1.width/board.size,canvas1.height/board.size);
        context.fillStyle = "red";
    });

    //Goals
    for(var i = 0; i < board.goalCount; i++) {
        context.fillStyle = "blue";
        context.beginPath();
        context.arc(
            board.goals[i].x*canvas1.height/board.size + canvas1.height/board.size/2, 
            board.goals[i].y*canvas1.height/board.size + canvas1.height/board.size/2, 
            canvas1.width/board.size/2,
            canvas1.height/board.size/2, 
            Math.PI*2, true);
        context.closePath();
        context.fill();
    }
}

function updateLeaderboard() {
    var context = canvas2.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas2.width, canvas2.height); //erase canvas2
    context.fillStyle = "black";
    context.font = "30px Arial";
    context.fillText("Avg Moves per Point:", 10, 50);
    var indent = 40;
    var border = 10;
    var playerCount = 0;
    Object.keys(board.players).forEach(function (id) {
        context.fillStyle = board.players[id].color;
        if (board.players[id].points == 0) {
            context.fillText(board.players[id].wins + " " + board.players[id].name + ": No Points", indent, playerCount*30+border+80);
        } else {
            context.fillText(board.players[id].wins + " " + board.players[id].name + ": " + (board.players[id].moves/board.players[id].points).toFixed(2), indent, playerCount*30+border+80);
        }
        playerCount++;
    });

    //Previous winner
    context.fillStyle = "black";
    context.fillText("Previous Winner", 400, 50);
    if (board.winnerScore > 0) {
        context.fillStyle = board.winnerColor;
        context.fillText(board.winnerName + ": " + Number(board.winnerScore).toFixed(2), 400+indent, border+80);
    } else {
        context.fillText("No Winner", 400+indent, border+80);
    }
    context.fillStyle = "black";
}
