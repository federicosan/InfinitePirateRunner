//Start the Sefarers
var SeafarerGame = SeafarerGame || {};

//Initiate the game object and the specified resolution
SeafarerGame.game = new Phaser.Game(800, 600, Phaser.CANVAS, '');

//Add all the game states
SeafarerGame.game.state.add('Boot', SeafarerGame.Boot);
SeafarerGame.game.state.add('Preload', SeafarerGame.Preload);
SeafarerGame.game.state.add('Game', SeafarerGame.Game);

//Start the boot state
SeafarerGame.game.state.start('Boot');