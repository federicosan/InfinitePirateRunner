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
io.on('connection', function(client) {
    client.on('join', function(data) {
        console.log(data);
        //send a message back to the currently connected client
        client.emit('messageConnected', 'You connected successfully!');
    });
});

//Use anything from this root folder
app.use(express.static('.'));
server.listen(8080, function() {
    var host = "localhost";
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});