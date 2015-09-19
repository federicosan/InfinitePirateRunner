/*
  Phaser game state - the actual main game state - where everything is rendered and controlled
*/

var SeafarerGame = SeafarerGame || {};

SeafarerGame.Game = function() {};

SeafarerGame.Game.prototype = {
    preload: function() {
        this.game.time.advancedTiming = true;
    },
    create: function() {
        //load initial sprites
        this.game.world.setBounds(0, 0, 10000, this.game.height);
        this.bg_layer_one = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'bg_layer_one');
        this.bg_layer_two = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'bg_layer_two');
        this.bg_layer_three = this.add.tileSprite(0, 500, this.game.world.width, 100, 'bg_layer_three');
        this.hearts = this.game.add.sprite(680, 0, 'hearts');
        this.hearts.fixedToCamera = true;
        this.hearts.animations.add('pulse', [0, 1, 2, 3, 4, 5]);
        this.hearts.animations.play('pulse', 10, true);

        //connect to server
        var ipAddress = window.location.href;
        var socket = io.connect(ipAddress);
        socket.on('connect', function(data) {
            socket.emit('join', 'Client joined!');
        });
        socket.on('messageConnected', function(data) {
            console.log(data);
        });

        this.player = this.game.add.sprite(0, this.game.height - 100 - 200, 'pirate1');
        this.player.alive = true;
        this.player.hits = 3;
        this.player.animations.add('idle', [0]);
        this.player.animations.add('walk', [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        this.player.animations.add('crouch', [11]);
        this.player.animations.add('jump', [12, 13, 14, 15, 16, 17, 18, 19]);
        this.wraps = 0;

        //Text for lives (or hits)
        this.hitsText = "x" + this.player.hits;
        this.hitsTextStyle = {
            font: "20px Arial",
            fill: "#FFFFFF",
            align: "center"
        };
        this.hitsActualText = this.game.add.text(750, 40, this.hitsText, this.hitsTextStyle);
        this.hitsActualText.fixedToCamera = true;

        //Levels completed
        this.levelsCompletedText = "Levels Completed:" + this.wraps;
        this.levelsCompletedTextStyle = {
            font: "12px Arial",
            fill: "#FFFFFF",
            align: "center"
        };
        this.levelsCompletedActualText = this.game.add.text(665, 20, this.levelsCompletedText, this.levelsCompletedTextStyle);
        this.levelsCompletedActualText.fixedToCamera = true;

        //physics
        this.game.physics.arcade.enable(this.player);
        this.game.physics.arcade.enable(this.bg_layer_three);
        this.player.body.gravity.y = 1000;
        this.bg_layer_three.body.immovable = true;
        this.bg_layer_three.body.allowGravity = false;

        //follow camera
        this.game.camera.follow(this.player);

        //Variables used throughout rest of game
        this.wraps = 0;
        this.wrapping = true;
        this.swipe = this.game.input.activePointer;
        this.cursors = this.game.input.keyboard.createCursorKeys();
    },
    update: function() {
        //continually check for collision
        if (this.player != null) {
            if (this.player.alive != false) {
                //Player to ground
                this.game.physics.arcade.collide(this.player, this.bg_layer_three, this.playerLand, null, this);
                //Player to block platform
                this.game.physics.arcade.overlap(this.player, this.blockPlatforms, this.playerLand, null, this);

                if (!this.wrapping && this.player.x < this.game.width) {
                    this.wraps++;
                    this.wrapping = true;
                    this.bg_layer_one.x = 0;
                    this.levelsCompletedActualText.setText("Levels Completed:" + this.wraps);
                } else if (this.player.x >= this.game.width) {
                    this.wrapping = false;
                }

                if (this.cursors.up.isDown) {
                    this.playerJump();
                    this.player.body.setSize(100, 200, 0, 0);
                    if (this.player.body.velocity.x > 0) {
                        this.bg_layer_one.x += .3;
                    }
                } else if (this.cursors.down.isDown && this.player.body.touching.down) {
                    this.player.animations.play('crouch', 30, false);
                    this.player.body.velocity.x = 0;
                    this.player.body.setSize(100, 150, 0, 50);
                } else if (this.cursors.right.isDown) {
                    this.player.animations.play('walk', 10, true);
                    this.player.body.velocity.x = 300;
                    this.bg_layer_one.x += .3;
                    this.player.body.setSize(100, 200, 0, 0);
                } else {
                    this.player.body.velocity.x = 0;
                    this.player.animations.play('idle', 10, true);
                    this.player.body.setSize(100, 200, 0, 0);
                }
                //The game world is infinite in the x-direction, so we wrap around.
                //We subtract padding so the player will remain in the middle of the screen when
                //wrapping, rather than going to the end of the screen first
                this.game.world.wrap(this.player, 0, true);
            }

            //check death
            if (this.player.hits == 0) {
                //end game
            }
        }
    },
    render: function() {
        this.game.debug.text("FPS: " + this.game.time.fps || '--', 20, 30, "#00ff00", "15px Courier");
        this.game.world.bringToTop(this.player);
    },
    playerJump: function() {
        //when the ground is a sprite, we need to test for "touching" instead of "blocked"
        if (this.player.body.touching.down) {
            this.player.animations.play('jump', 7, false);
            this.player.body.velocity.y -= 500;
        }
    },
    playerLand: function() {
        this.player.animations.play('walk', 10, true);
    },
    throwItems: function() {

    }
};