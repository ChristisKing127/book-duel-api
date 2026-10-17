// What the Library Game Hub shows about YOUR game (Hub Contract, rule 1).
// Lab Step 6: replace every CHANGE_ME value with your own.
const pkg = require('../../package.json');

module.exports = {
  slug: 'book-duel',            // your group's game, lower case with hyphens, for example shelf-climb
  name: 'Book Duel',            // the name players will see
  team: 'Group1 CS3-1',            // your group's name and section, for example Bookworms (3-1)
  developer: 'ChristisKing127',       // YOUR GitHub username: this build is yours
  description: 'A strategic book duel game where players compete to answer trivia questions about their favorite books.',     // one sentence about how the game is played
  min_players: 2,               // change to the limits your game is designed for
  max_players: 30,
  version: pkg.version,         // read from package.json, do not edit here
};
