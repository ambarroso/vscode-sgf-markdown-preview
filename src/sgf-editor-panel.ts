import * as vscode from 'vscode';
import * as path from 'path';

export class SgfEditorPanel {
    public static currentPanel: SgfEditorPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _documentUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, documentUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._documentUri = documentUri;

        // Set the webview's initial html content
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.type) {
                    case 'updateSgf':
                        this._handleUpdateSgf(message.sgf, message.lineStart);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri, documentUri: vscode.Uri, sgfContent: string, lineStart: number, showCoordinates: boolean, showNumbers: boolean = false) {
        const column = vscode.window.activeTextEditor
            ? vscode.ViewColumn.Beside
            : vscode.ViewColumn.One;

        // If we already have a panel, show it.
        if (SgfEditorPanel.currentPanel) {
            SgfEditorPanel.currentPanel._panel.reveal(column);
            SgfEditorPanel.currentPanel.initEditor(sgfContent, lineStart, showCoordinates, showNumbers);
            // Ensure documentUri is updated if the same panel is re-used for a different doc (though our implementation assumes one panel per extension)
            SgfEditorPanel.currentPanel._documentUri = documentUri;
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            'sgfEditor',
            'Interactive SGF Editor',
            column,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
                retainContextWhenHidden: true // Keep WGo.js alive when hidden
            }
        );

        SgfEditorPanel.currentPanel = new SgfEditorPanel(panel, extensionUri, documentUri);
        
        // Wait a brief moment for the webview to load its HTML and scripts before sending the init message
        setTimeout(() => {
            SgfEditorPanel.currentPanel?.initEditor(sgfContent, lineStart, showCoordinates, showNumbers);
        }, 500);
    }

    public initEditor(sgfContent: string, lineStart: number, showCoordinates: boolean, showNumbers: boolean) {
        this._panel.webview.postMessage({
            type: 'init',
            sgf: sgfContent,
            lineStart: lineStart,
            showCoordinates: showCoordinates,
            showNumbers: showNumbers
        });
    }

    private async _handleUpdateSgf(newSgf: string, lineStart: number) {
        let doc: vscode.TextDocument | undefined;
        try {
            doc = await vscode.workspace.openTextDocument(this._documentUri);
        } catch (e) {
            console.error("Failed to open document for SGF update", e);
        }

        if (!doc) {
            vscode.window.showErrorMessage("Could not find the original document to update. It might have been closed or moved.");
            return;
        }

        const edit = new vscode.WorkspaceEdit();

        if (doc.languageId === 'sgf') {
            // Replace the entire file content for SGF files
            const fullRange = new vscode.Range(
                doc.positionAt(0),
                doc.positionAt(doc.getText().length)
            );
            edit.replace(doc.uri, fullRange, newSgf);
        } else {
            // Assume Markdown, find the fenced block
            const startPos = new vscode.Position(lineStart + 1, 0);
            
            // Find the end of the block
            let endLine = lineStart + 1;
            while (endLine < doc.lineCount) {
                if (doc.lineAt(endLine).text.trim() === '```') {
                    break;
                }
                endLine++;
            }

            const range = new vscode.Range(startPos, new vscode.Position(endLine, 0));
            edit.replace(doc.uri, range, newSgf + '\n');
        }

        await vscode.workspace.applyEdit(edit);
    }

    public dispose() {
        SgfEditorPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const wgoUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'wgo.min.js'));
        const wgoPlayerUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'wgo.player.min.js'));
        const editorScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'editor.js'));
        const wgoCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'wgo.player.css'));
        const customCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'custom.css'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Interactive SGF Editor</title>
                <link rel="stylesheet" href="${wgoCssUri}">
                <link rel="stylesheet" href="${customCssUri}">
                <script src="${wgoUri}"></script>
                <script src="${wgoPlayerUri}"></script>
                <style>
                    body {
                        padding: 0;
                        margin: 0;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        font-family: var(--vscode-font-family);
                    }
                    .header {
                        padding: 10px 20px;
                        background: var(--vscode-editorGroupHeader-tabsBackground);
                        border-bottom: 1px solid var(--vscode-panel-border);
                        font-size: 13px;
                    }
                    .editor-content {
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                        overflow: hidden;
                    }
                    #board-container {
                        width: 100%;
                        max-width: 800px;
                        aspect-ratio: 1;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <b>Interactive Edit Mode</b><br>
                    <span style="opacity: 0.8">Use the board's control panel to enter Edit Mode. Any stones placed will automatically sync back to your Markdown file.</span>
                </div>
                <div class="editor-content">
                    <div id="board-container">Loading...</div>
                </div>
                <script src="${editorScriptUri}"></script>
            </body>
            </html>`;
    }
}
