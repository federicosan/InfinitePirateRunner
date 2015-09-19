/*
  Phaser preload state - using the assets loaded in boot, load the actual assets for the game
*/

var SeafarerGame = SeafarerGame || {};

//loading the game assets
SeafarerGame.Preload = function() {};

var timeCheck;
var timeWait = 5000;

SeafarerGame.Preload.prototype = {
    preload: function() {
        //Show the preload bar
        var preloadBar = this.game.add.sprite(350, 250, 'preloadbar');
        var load = preloadBar.animations.add('open');
        // 5 frames per second and loop
        preloadBar.animations.play('open', 5, true);
        //Loading text
        var text1 = "Loading...";
        var style1 = {
            font: "30px Arial",
            fill: "#ff0044",
            align: "center"
        };
        var t1 = this.game.add.text(this.game.world.centerX - 55, this.game.world.centerY + 60, text1, style1);

        var text2 = "Seafarer's Journey";
        var style2 = {
            font: "30px Arial",
            fill: "#46aaf3",
            align: "center"
        };
        var t2 = this.game.add.text(this.game.world.centerX - 120, this.game.world.centerY - 70, text2, style2);

        var text3 = "Written by David Kramer and Matt Hammel";
        var style3 = {
            font: "15px Arial",
            fill: "#46aaf3",
            align: "center"
        };
        var t3 = this.game.add.text(this.game.world.centerX - 135, this.game.world.centerY + 100, text3, style3);

        //===== LOAD ASSETS HERE =====
        //Layer 1 ocean
        this.load.image('bg_layer_one', 'Resources/Layer1_tree.png');
        //Layer 2 ship hull
        this.load.image('bg_layer_two', 'Resources/Layer2_Planks.png');
        //ground layer
        this.load.image('bg_layer_three', 'Resources/singleBlock.png')
        //1st pirate walk
        this.load.spritesheet('pirate1', 'Resources/PegLegFull.png', 100, 200, 20);
        //Hearts
        this.load.spritesheet('hearts', 'Resources/Heart.png', 100, 100, 6);

        //Simple delay - just so people can get to see Matthews beautiful artwork
        timeCheck = this.game.time.now;
    },
    render: function() {
        // On create, state the game state
        // 3 second delay
        if (this.game.time.now - timeCheck > timeWait) {
            this.state.start('Game');
        }
    }
};