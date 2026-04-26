const md = require('markdown-it')();
const plugin = require('./out/markdown-it-plugin.js').default;
md.use(plugin);
const text = "```sgf\n(;GM[1])\n```\n";
const tokens = md.parse(text, {});
console.log(tokens[0].map);
