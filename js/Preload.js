/*
  Phaser preload state - using the assets loaded in boot, load the actual assets for the game
*/

var SeafarerGame = SeafarerGame || {};

//loading the game assets
SeafarerGame.Preload = function(){};

SeafarerGame.Preload.prototype = {
  preload: function() {
    var preloadBar = this.game.add.sprite(350, 250, 'preloadbar');
     var load = preloadBar.animations.add('open');
    // 5 frames per second and loop
    preloadBar.animations.play('open', 5, true);
    //Load the assets here
  },
  create: function() {
    //On create, state the game state
    this.state.start('Game');
  }
};