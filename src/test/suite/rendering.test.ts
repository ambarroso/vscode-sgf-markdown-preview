import * as assert from 'assert';
import * as vscode from 'vscode';
import * as markdownIt from 'markdown-it';
import sgfPlugin from '../../markdown-it-plugin';

suite('SGF Rendering Test Suite', () => {
    test('Should render SGF code block to div', () => {
        const md = markdownIt();
        sgfPlugin(md);

        const sgfContent = '(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]PW[White]PB[Black])';
        const markdown = '```sgf\n' + sgfContent + '\n```';

        const result = md.render(markdown);

        const encodedContent = encodeURIComponent(sgfContent);
        const expected = `<div class="sgf-render" data-sgf="${encodedContent}" style="width: 100%; max-width: 600px; aspect-ratio: 1;"></div>`;

        assert.ok(result.includes('class="sgf-render"'), 'Result should contain sgf-render class');
        assert.ok(result.includes(`data-sgf="${encodedContent}"`), 'Result should contain encoded SGF content');
    });
});
