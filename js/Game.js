/*
  Phaser game state - the actual main game state - where everything is rendered and controlled
*/

var SeafarerGame = SeafarerGame || {};

SeafarerGame.Game = function(){};

SeafarerGame.Game.prototype = {
  preload: function() {
      this.game.time.advancedTiming = true;
    },
  create: function() {
    //load initial sprites
    this.game.world.setBounds(0, 0, 3500, this.game.height);
    this.bg_layer_one = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'bg_layer_one');
    this.bg_layer_two = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'bg_layer_two');
    this.bg_layer_three = this.add.tileSprite(0, 500, this.game.world.width, 100, 'bg_layer_three');
  
    //connect to server
    var ipAddress = window.location.href;
    var socket = io.connect(ipAddress);
    socket.on('connect', function(data) {
        socket.emit('join', 'Client joined!');
    });

  },
  update: function() {

  },
  render: function() {
        this.game.debug.text("FPS: " + this.game.time.fps || '--', 20, 30, "#00ff00", "15px Courier");   
    }
};