import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('undefined_publisher.sgf-markdown-preview'));
    });

    test('Markdown-it plugin should be active', async () => {
        const ext = vscode.extensions.getExtension('undefined_publisher.sgf-markdown-preview');
        if (ext) {
            await ext.activate();
            assert.ok(ext.isActive);
        } else {
            assert.fail('Extension not found');
        }
    });
});
