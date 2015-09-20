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

        this.player = this.game.add.sprite(0, this.game.height - 100 - 200, 'pirate1');
        this.player.alive = true;
        this.player.hits = 10;
        this.player.animations.add('idle', [0]);
        this.player.animations.add('walk', [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        this.player.animations.add('crouch', [11]);
        this.player.animations.add('jump', [12, 13, 14, 15, 16, 17]);
        this.wraps = 0;

        //connect to server
        this.playerList = [];
        this.playerSpriteList = {};
        this.playerSpriteList['d'] = [];

        var ipAddress = window.location.href;
        this.socket = io.connect(ipAddress);

        var self = this;
        this.socket.on('connect', function(data) {
            console.log("Connected!");
            self.mySocketId = self.socket.id;
        });
        this.socket.on('all_playerConnected', function(data) {
            console.log("Player joined!");
            self.playerList = data['d'];
            //Create a sprite for new player - making sure its not 'me'
            for (i = 0; i < self.playerList.length; i++) {
                if (self.playerList[i]['s'] != self.mySocketId) {
                    if (self.playerSpriteList['d'].length < 1) {
                        self.playerSpriteList['d'].push({
                            s: self.playerList[i]['s'],
                            sprite: SeafarerGame.game.add.sprite(self.playerList[i]['x'], self.playerList[i]['y'], 'pirate2')
                        });
                    } else {
                        for (j = 0; j < self.playerSpriteList['d'].length; j++) {
                            console.log(self.playerList[i]['s'] + " - " + self.playerSpriteList['d'][j]['s']);
                            if (self.playerList[i]['s'] == self.playerSpriteList['d'][j]['s']) {
                                break;
                            } else {
                                self.playerSpriteList['d'].push({
                                    s: self.playerList[i]['s'],
                                    sprite: SeafarerGame.game.add.sprite(self.playerList[i]['x'], self.playerList[i]['y'], 'pirate2')
                                });
                            }
                        }
                    }
                }
            }
        });
        this.socket.on('all_playerDisconnected', function(data) {
            console.log("Player left!");
            localSocketId = data;
            //Destroy the players corresponding sprite
            for (i = 0; i < self.playerSpriteList['d'].length; i++) {
                if (self.playerSpriteList['d'][i]['s'] == localSocketId) {
                    self.playerSpriteList['d'][i]['sprite'].kill();
                    for (s = 0; s < self.playerList.length; s++) {
                        if (self.playerList[i]['s'] == localSocketId) {
                            self.playerList.splice(s, 1);
                            break;
                        }
                    }
                    self.playerSpriteList['d'].splice(i, 1);
                    return;
                }
            }
        });
        //Player position update
        this.socket.on('all_PlayerPositionUpdate', function(data) {
            playerListUpdate = data;
            //Update player position
            for (i = 0; i < self.playerSpriteList['d'].length; i++) {
                if (self.playerSpriteList['d'][i]['s'] == playerListUpdate['s']) {
                    self.playerSpriteList['d'][i]['sprite'].x = playerListUpdate['x'];
                    self.playerSpriteList['d'][i]['sprite'].y = playerListUpdate['y'];
                    for (s = 0; s < self.playerList.length; s++) {
                        if (self.playerList[i]['s'] == playerListUpdate['s']) {
                            self.playerList[i]['x'] = playerListUpdate['x'];
                            self.playerList[i]['y'] = playerListUpdate['y'];
                            break;
                        }
                    }
                    return;
                }
            }
        });

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

        //Projectile group
        this.projectilesGroup = this.game.add.group();
        this.projectilesGroup.enableBody = true;

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
                //Player to projectiles
                this.game.physics.arcade.collide(this.player, this.projectilesGroup, this.playerHit, null, this);

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
                    this.player.body.setSize(90, 120, 0, 80);
                    if (this.player.body.velocity.x > 0) {
                        this.bg_layer_one.x += .3;
                    }
                } else if (this.cursors.down.isDown && this.player.body.touching.down) {
                    this.player.animations.play('crouch', 30, false);
                    this.player.body.velocity.x = 0;
                    this.player.body.setSize(80, 120, 0, 80);
                } else if (this.cursors.right.isDown) {
                    this.player.animations.play('walk', 10, true);
                    this.player.body.velocity.x = 400;
                    this.bg_layer_one.x += .3;
                    this.player.body.setSize(80, 155, 0, 45);
                } else if (this.cursors.left.isDown) {
                    this.player.animations.play('walk', 10, true);
                    this.player.body.velocity.x = -400;
                    this.bg_layer_one.x -= .3;
                    this.player.body.setSize(80, 155, 0, 45);
                } else {
                    this.player.body.velocity.x = 0;
                    this.player.animations.play('idle', 10, true);
                    this.player.body.setSize(80, 155, 0, 45);
                }
                //The game world is infinite in the x-direction, so we wrap around.
                //We subtract padding so the player will remain in the middle of the screen when
                //wrapping, rather than going to the end of the screen first
                if (this.player.x <= 0) {
                    this.player.x = 0;
                }

                //Update server with player position
                for (var i = 0; i < this.playerList.length; i++) {
                    if (this.playerList[i]['s'] == this.mySocketId) {
                        this.playerList[i]['x'] = this.player.x;
                        this.playerList[i]['y'] = this.player.y;
                        var coords = {
                            s: this.playerList[i]['s'],
                            x: this.playerList[i]['x'],
                            y: this.playerList[i]['y']
                        };
                        this.socket.emit('playerPositionUpdate', coords);
                    }
                }

                this.game.world.wrap(this.player, 0, true);
            }

            //generate projectiles based on probability and level
            var randomValueProjetile = this.game.rnd.integerInRange(0, 1000);
            //10% chance to generate projectile
            if (randomValueProjetile <= 3 + ((this.wraps + 1) * .05)) {
                var chooseProjectile = this.game.rnd.integerInRange(0, 2);
                var projectileHeight = this.game.rnd.integerInRange(0, 2);
                var actualProjHeight = 0;
                var proj;
                switch (projectileHeight) {
                    case 0:
                        actualProjHeight = 200;
                        break;
                    case 1:
                        actualProjHeight = 300;
                        break;
                    case 2:
                        actualProjHeight = 400;
                        break;
                }
                switch (chooseProjectile) {
                    case 0:
                        proj = this.projectilesGroup.create(this.game.world.width + 10, actualProjHeight, 'spinningbomb');
                        proj.animations.add('spin', [0, 1, 2, 3]);
                        proj.animations.play('spin', 10, true);
                        proj.body.setSize(33, 45, 32, 25);
                        break;
                    case 1:
                        proj = this.projectilesGroup.create(this.game.world.width + 10, actualProjHeight, 'seagull');
                        proj.animations.add('flap', [0, 1, 2, 3, 4, 5, 6, 7]);
                        proj.animations.play('flap', 10, true);
                        proj.body.setSize(50, 15, 30, 35);
                        break;
                    case 2:
                        proj = this.projectilesGroup.create(this.game.world.width + 10, actualProjHeight, 'crab');
                        proj.animations.add('crabwalk', [0, 1, 2, 3]);
                        proj.animations.play('crabwalk', 10, true);
                        proj.body.setSize(30, 35, 30, 30);
                        break;
                }
                //physics properties
                proj.body.velocity.x = -250;
                proj.body.immovable = true;
                proj.body.collideWorldBounds = false;
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
            this.player.animations.play('jump', 30, false);
            this.player.body.velocity.y -= 600;
        }
    },
    playerLand: function() {
        this.player.animations.play('walk', 10, true);
    },
    playerHit: function(sprite, projectileSprite) {
        projectileSprite.kill();
        this.player.hits--;
        this.hitsActualText.setText("x" + this.player.hits);
        //check death
        if (this.player.hits == 0) {
            //end game
            sprite.kill();
            //Levels completed
            var deadText = "Arrgh crap. You died."
            var deadTextStyle = {
                font: "40px Arial",
                fill: "#FFFFFF",
                align: "center"
            };
            var reloadText = "Refresh page to try again!"
            var reloadTextStyle = {
                font: "20px Arial",
                fill: "#FFFFFF",
                align: "center"
            };
            var actualDeadText = this.game.add.text(this.game.width / 2 - 175, this.game.height / 2 - 50, deadText, deadTextStyle);
            var actualReloadText = this.game.add.text(this.game.width / 2 - 100, this.game.height / 2 - 5, reloadText, reloadTextStyle);
            

            actualDeadText.fixedToCamera = true;
            actualReloadText.fixedToCamera = true;
            this.player.alive = false;
        }
    },
    actionOnClick: function() {
        console.log("couch");
    
    }
};