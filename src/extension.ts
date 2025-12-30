import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    return {
        extendMarkdownIt(md: any) {
            return require('./markdown-it-plugin').default(md);
        }
    };
}
