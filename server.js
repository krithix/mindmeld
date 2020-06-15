const express = require('express');
const app = express();
const path = require('path');
const socketio = require('socket.io');

const PORT = process.env.PORT || 5000;
var server = app.listen(PORT);
const io = socketio.listen(server);

app.use(express.static(path.join(__dirname, 'build')));
app.get('/:game', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const pairs = require('./data/pairs.json');

var currentRooms = [];
var roomData = {};

io.on('connection', (socket) => {
  function generatePair(playedGames) {
    var nextGame = Math.floor(Math.random() * 100);
    do {
      nextGame = Math.floor(Math.random() * pairs.length);
    } while (playedGames.indexOf(nextGame) > 0);
    return (nextGame);
  }

  function generateTarget() {
    var randNum = Math.floor(Math.random() * 100);
    return randNum;
  }

  function updateRoomData(socket, room) {
    if (currentRooms.indexOf(room) > -1) {
      var currentRoomData = roomData[room];
      io.in(room).emit('updatedRoomData', currentRoomData);
    } else {
      console.log('trying to update room data for a nonexistent room!');
    }
  }

  socket.on('join', function(room) {
    socket.join(room);
    console.log(socket.id + ' joined ' + room);
    if (currentRooms.indexOf(room) < 0) {
      console.log('initializing room ' + room + ' and adding ' + socket.id);
      var pair = generatePair([]);
      var currentRoomData = {
        pair: pairs[pair],
        teamTurn: 'blue',
        turnPoints: 0,
        bluePoints: 0,
        redPoints: 0,
        peek: false,
        target: generateTarget(),
        guess: null,
        playedGames: [pair],
        roomInit: true,
      };
      currentRooms.push(room);
      roomData[room] = currentRoomData; 
    } 
    updateRoomData(socket, room);   
  });

  socket.on('nextGame', function(room) {
    console.log(socket.id + ' requested a new game in ' + room);
    if (currentRooms.indexOf(room) > -1) {
      var currentRoomData = roomData[room];

      var playedGames = currentRoomData.playedGames;
      var pair = generatePair(playedGames);
      playedGames.push(pair);
      var nextTeamTurn = currentRoomData.teamTurn === 'blue' ? 'red' : 'blue';

      var updatedRoomData = {
        pair: pairs[pair],
        teamTurn: nextTeamTurn,
        turnPoints: 0,
        bluePoints: currentRoomData.bluePoints,
        redPoints: currentRoomData.redPoints,
        peek: false,
        target: generateTarget(),
        guess: null,
        playedGames: playedGames,
        roomInit: true,
      };

      roomData[room] = updatedRoomData;
      updateRoomData(socket, room);
    } else {
      console.log('trying to get next game in a nonexistent room!');
    }
  });

  socket.on('guess', function(room, color, guess) {
    console.log(socket.id + ' guessed ' + guess + ' in ' + room);
    if (currentRooms.indexOf(room) > -1) {
      var currentRoomData = roomData[room];
      var colorVar = color + 'Points';
      var delta = Math.abs(currentRoomData.target - guess);
      var turnPoints = 0;
      if (delta < 2) {
        turnPoints = 4;
      } else if (delta < 5) {
        turnPoints = 3;
      } else if (delta < 10) {
        turnPoints = 2;
      }
      roomData[room].turnPoints = turnPoints;
      roomData[room][colorVar] += turnPoints;
      roomData[room].guess = guess;
      roomData[room].peek = true;
      updateRoomData(socket, room);
    } else {
      console.log('trying to guess in nonexistent room');
    }
  });

  socket.on('disconnect', function() {
    console.log(socket.id + ' disconnected');
  });
});

