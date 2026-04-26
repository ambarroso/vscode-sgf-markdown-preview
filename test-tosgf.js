const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM('<!DOCTYPE html><div id="board"></div>', { runScripts: "dangerously" });
const window = dom.window;
global.window = window;
global.document = window.document;
global.navigator = window.navigator;

const wgoCode = fs.readFileSync('media/wgo.min.js', 'utf8');
window.eval(wgoCode);
const playerCode = fs.readFileSync('media/wgo.player.min.js', 'utf8');
window.eval(playerCode);

const player = new window.WGo.BasicPlayer(window.document.getElementById('board'), {
    sgf: "(;GM[1]FF[4]CA[UTF-8]PW[White]PB[Black];B[pd];W[dd])"
});

console.log("Player created");
console.log(typeof player.kifu.toSgf);
if (typeof player.kifu.toSgf === 'function') {
    console.log(player.kifu.toSgf());
}
