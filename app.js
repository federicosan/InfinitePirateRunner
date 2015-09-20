//Start express to server up the static html index page
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//===== Socket io miltiplayer stuff =====
var allClients = {};
allClients['d'] = [];
io.sockets.on('connect', function(socket) {
    console.log('Client connected!');
    var Player = {
        s: socket.id,
        x: 0,
        y: 300
    };
    allClients['d'].push(Player);
    //Send client list to current connected player and all others
    socket.emit('all_playerConnected', allClients);
    socket.broadcast.emit('all_playerConnected', allClients);
    console.log(allClients);
    socket.on('disconnect', function() {
        console.log('Client disconnected!');
        for (var i = 0; i < allClients['d'].length; i++) {
            if (allClients['d'][i]['s'] == socket.id) {
                allClients['d'].splice(i, 1);
            }
        }
        console.log(allClients);
        socket.broadcast.emit('all_playerDisconnected', socket.id);
    });

});

//Use anything from this root folder
app.use(express.static('.'));
server.listen(8080, function() {
    var host = "localhost";
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});