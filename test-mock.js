const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
    if (request === 'vscode') {
        return {
            workspace: {
                getConfiguration: () => ({ get: () => '100px' })
            }
        };
    }
    return originalRequire.apply(this, arguments);
};

const md = require('markdown-it')();
const plugin = require('./out/markdown-it-plugin.js').default;
md.use(plugin);

const result = md.render("```sgf\n(;GM[1])\n```");
console.log(result);
