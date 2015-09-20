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
var allClients = [];
io.sockets.on('connection', function(socket) {
   allClients.push(socket);
   var i1 = allClients.indexOf(socket);
   console.log("Client " + i1 + " connected!");
   socket.on('disconnect', function() {
   	  var i2 = allClients.indexOf(socket);
      console.log("Client " + i2 + " disconnected!");
      allClients.splice(i2, 1);
   });
});

//Use anything from this root folder
app.use(express.static('.'));
server.listen(8080, function() {
    var host = "localhost";
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});