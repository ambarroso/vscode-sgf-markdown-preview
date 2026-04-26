import * as vscode from 'vscode';
import { SgfValidator } from './validator';
import { SgfHoverProvider } from './hover-provider';
import { SgfFormatter } from './formatter';
import { SgfLinkProvider } from './link-provider';

export function activate(context: vscode.ExtensionContext) {
    // 1. Diagnostics (Validation)
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('sgf');
    context.subscriptions.push(diagnosticCollection);
    const validator = new SgfValidator(diagnosticCollection);

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId === 'sgf' || e.document.languageId === 'markdown') {
            validator.validateDocument(e.document);
        }
    }));

    // Initial validation
    if (vscode.window.activeTextEditor) {
        validator.validateDocument(vscode.window.activeTextEditor.document);
    }

    // 2. Hover Provider
    context.subscriptions.push(vscode.languages.registerHoverProvider(['sgf', 'markdown'], new SgfHoverProvider()));

    // 3. Formatter
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('sgf', new SgfFormatter()));

    // 4. Document Link Provider
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(['sgf', 'markdown'], new SgfLinkProvider()));

    // 5. Commands
    context.subscriptions.push(vscode.commands.registerCommand('sgf-markdown-preview.openInteractiveBoard', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Please open a markdown file with an SGF block first.");
            return;
        }

        const doc = editor.document;
        if (doc.languageId !== 'markdown' && doc.languageId !== 'sgf') {
            vscode.window.showErrorMessage("This command only works in Markdown or SGF files.");
            return;
        }

        let sgfContent = "";
        let lineStart = 0;
        let showNumbers = false;

        if (doc.languageId === 'sgf') {
            sgfContent = doc.getText();
            lineStart = 0; // whole file
        } else {
            // Find the SGF block at or above the cursor
            const cursorLine = editor.selection.active.line;
            let foundStart = -1;
            
            // Search upwards for the start of the block
            for (let i = cursorLine; i >= 0; i--) {
                const line = doc.lineAt(i).text.trim();
                if (line.startsWith('```sgf')) {
                    foundStart = i;
                    showNumbers = line.includes('showNumbers');
                    break;
                } else if (line.startsWith('```') && i !== cursorLine) {
                    // Reached the end of a previous block
                    break;
                }
            }

            if (foundStart === -1) {
                vscode.window.showErrorMessage("Please place your cursor inside an SGF code block.");
                return;
            }

            lineStart = foundStart;
            let foundEnd = -1;
            for (let i = foundStart + 1; i < doc.lineCount; i++) {
                if (doc.lineAt(i).text.trim() === '```') {
                    foundEnd = i;
                    break;
                }
            }

            if (foundEnd === -1) {
                vscode.window.showErrorMessage("Could not find the end of the SGF block.");
                return;
            }

            sgfContent = doc.getText(new vscode.Range(new vscode.Position(foundStart + 1, 0), new vscode.Position(foundEnd, 0)));
        }

        const config = vscode.workspace.getConfiguration('sgf-markdown-preview');
        const showCoordinates = config.get<boolean>('showCoordinates', false);

        // Open the Webview Panel
        const { SgfEditorPanel } = require('./sgf-editor-panel');
        SgfEditorPanel.createOrShow(context.extensionUri, sgfContent, lineStart, showCoordinates, showNumbers);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('sgf-markdown-preview.showMoveInfo', (info: string) => {
        vscode.window.showInformationMessage(info);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('sgf-markdown-preview.formatMarkdownBlocks', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'markdown') return;

        const doc = editor.document;
        // Simple implementation: trigger standard format which won't do much for embedded blocks unless we register a range formatter
        // A full implementation would find all blocks and apply edits.
        vscode.window.showInformationMessage("Markdown formatting is not fully implemented yet.");
    }));

    // 6. Markdown-it Plugin
    return {
        extendMarkdownIt(md: any) {
            return require('./markdown-it-plugin').default(md);
        }
    };
}
