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
const { generateKeyPair } = require('crypto');
var currentRooms = [];

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
    var index = currentRooms.findIndex(el => el.room === room);
    if (index > -1) {
      var roomData = currentRooms[index].roomData;
      //io.in(room).emit('updatedRoomData', roomData);
      //io.to(socket.id).emit('updatedRoomData', roomData);
      
      currentRooms[index].users.map(user => {
        io.to(user.id).emit('updatedRoomData', roomData);
      });
      
    } else {
      console.log('trying to update room data for a nonexistent room!');
    }
  }

  socket.on('join', function(room) {
    var roomExists = currentRooms.some(el => el.room === room);
    if (!roomExists) {
      console.log('initializing room ' + room + ' and adding ' + socket.id);
      var pair = generatePair([]);
      var roomData = {
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
      currentRooms.push({room: room, users: [socket], roomData: roomData});
    } else {
      // get index of room in currentRooms array
      var index = currentRooms.findIndex(el => el.room === room);
      if (currentRooms[index].users.indexOf(socket) < 0) {
        console.log('adding ' + socket.id + ' to ' + room);
        currentRooms[index].users.push(socket);
      }
    }
    currentRooms.map((r, index) => {
      if (r.room !== room && r.users.findIndex(u => u.id === socket.id) > 0) {
        currentRooms[index].users.splice(r.users.findIndex(u => u.id === socket.id), 1);
        console.log('removed ' + socket.id + ' from ' + r.room);
      }
    });
    updateRoomData(socket, room);   
  });

  socket.on('nextGame', function(room) {
    console.log(socket.id + ' requested a new game in ' + room);
    var index = currentRooms.findIndex(el => el.room === room);
    if (index > -1) {
      var roomData = currentRooms[index].roomData;

      var playedGames = roomData.playedGames;
      var pair = generatePair(playedGames);
      playedGames.push(pair);
      var nextTeamTurn = roomData.teamTurn === 'blue' ? 'red' : 'blue';

      var updatedRoomData = {
        pair: pairs[pair],
        teamTurn: nextTeamTurn,
        turnPoints: 0,
        bluePoints: roomData.bluePoints,
        redPoints: roomData.redPoints,
        peek: false,
        target: generateTarget(),
        guess: null,
        playedGames: playedGames,
        roomInit: true,
      };

      currentRooms[index].roomData = updatedRoomData;
      updateRoomData(socket, room);
    } else {
      console.log('trying to get next game in a nonexistent room!');
    }
  });

  socket.on('guess', function(room, color, guess) {
    console.log(socket.id + ' guessed ' + guess + ' in ' + room);
    var index = currentRooms.findIndex(el => el.room === room);
    if (index > -1) {
      var roomData = currentRooms[index].roomData;
      var colorVar = color + 'Points';
      var delta = Math.abs(roomData.target - guess);
      var turnPoints = 0;
      if (delta < 2) {
        turnPoints = 4;
      } else if (delta < 5) {
        turnPoints = 3;
      } else if (delta < 10) {
        turnPoints = 2;
      }
      currentRooms[index].roomData.turnPoints = turnPoints;
      currentRooms[index].roomData[colorVar] += turnPoints;
      currentRooms[index].roomData.guess = guess;
      currentRooms[index].roomData.peek = true;
      updateRoomData(socket, room);
    } else {
      console.log('trying to guess in nonexistent room');
    }
  });
});

