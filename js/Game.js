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
    socket.on('messageConnected', function(data) {
      console.log(data);
    });

    this.player = this.game.add.sprite(0, this.game.height-100-200, 'pirate1');
    this.player.alive = true;
    this.player.animations.add('walk');
    this.player.animations.play('walk', 10, true); 

    //physics
    this.game.physics.arcade.enable(this.player);
    this.game.physics.arcade.enable(this.bg_layer_three);
    this.player.body.gravity.y = 1000;
    this.bg_layer_three.body.immovable = true;
    this.bg_layer_three.body.allowGravity = false;

    //follow camera
    this.game.camera.follow(this.player);

    //Variables used throughout rest of game
    this.wrapping = true;
    this.swipe = this.game.input.activePointer;
    this.cursors = this.game.input.keyboard.createCursorKeys();
  },
  update: function() {
    //continually check for collision
    if(this.player != null)
    {
      if(this.player.alive != false){
        this.player.body.velocity.x = 300;
        this.bg_layer_one.x += .3;
        this.game.physics.arcade.collide(this.player, this.bg_layer_three, this.playerHit, null, this);
        if(!this.wrapping && this.player.x < this.game.width) {
          this.wraps++;
          //We only want to destroy and regenerate once per wrap, so we test with wrapping var
          this.wrapping = true;
          this.bg_layer_one.x = 0;
        }else if(this.player.x >= this.game.width) {
          this.wrapping = false;
        }
        if (this.swipe.isDown && (this.swipe.positionDown.y > this.swipe.position.y)) {
          this.playerJump();
        }
        else if (this.cursors.up.isDown) {
          this.playerJump();
        }
        //The game world is infinite in the x-direction, so we wrap around.
        //We subtract padding so the player will remain in the middle of the screen when
        //wrapping, rather than going to the end of the screen first
        this.game.world.wrap(this.player, 0, false, true, false);
      }
    }
  },
  render: function() {
        this.game.debug.text("FPS: " + this.game.time.fps || '--', 20, 30, "#00ff00", "15px Courier"); 
  },
  createPlayer: function() {

  },
  playerJump: function() {
    //when the ground is a sprite, we need to test for "touching" instead of "blocked"
    if(this.player.body.touching.down) {
      this.player.body.velocity.y -= 500;
    }    
  },
  playerHit: function(){

  }
};