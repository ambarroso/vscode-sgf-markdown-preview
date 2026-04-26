import * as vscode from 'vscode';
import { SgfParser } from './sgf-parser';

export class SgfValidator {
    constructor(private diagnosticCollection: vscode.DiagnosticCollection) {}

    public validateDocument(document: vscode.TextDocument) {
        if (document.languageId === 'sgf') {
            this.validateText(document, document.getText(), 0);
        } else if (document.languageId === 'markdown') {
            const text = document.getText();
            const sgfBlocks = this.extractSgfBlocks(text);
            
            const diagnostics: vscode.Diagnostic[] = [];
            for (const block of sgfBlocks) {
                const blockDiagnostics = this.getDiagnostics(document, block.text, block.startLine);
                diagnostics.push(...blockDiagnostics);
            }
            this.diagnosticCollection.set(document.uri, diagnostics);
        }
    }

    private validateText(document: vscode.TextDocument, text: string, offsetLine: number) {
        const diagnostics = this.getDiagnostics(document, text, offsetLine);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private getDiagnostics(document: vscode.TextDocument, text: string, offsetLine: number): vscode.Diagnostic[] {
        const parser = new SgfParser(text);
        const result = parser.parse();
        
        return result.errors.map(err => {
            const start = new vscode.Position(offsetLine + err.range.start.line, err.range.start.character);
            const end = new vscode.Position(offsetLine + err.range.end.line, err.range.end.character);
            const range = new vscode.Range(start, end);
            return new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
        });
    }

    private extractSgfBlocks(text: string): {text: string, startLine: number}[] {
        const blocks: {text: string, startLine: number}[] = [];
        const lines = text.split('\n');
        let inBlock = false;
        let currentBlock = '';
        let startLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().startsWith('```sgf')) {
                inBlock = true;
                startLine = i + 1; // Content starts next line
                currentBlock = '';
            } else if (inBlock && line.trim() === '```') {
                inBlock = false;
                blocks.push({ text: currentBlock, startLine });
            } else if (inBlock) {
                currentBlock += line + '\n';
            }
        }
        return blocks;
    }
}
