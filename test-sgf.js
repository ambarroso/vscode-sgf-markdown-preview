const wgo = require('fs').readFileSync('media/wgo.min.js', 'utf8');
const player = require('fs').readFileSync('media/wgo.player.min.js', 'utf8');
// Just check if toSgf exists
console.log(wgo.includes("toSgf") || player.includes("toSgf"));
