import * as vscode from 'vscode';
import { SgfParser, SgfGameTree, SgfNode } from './sgf-parser';

export class SgfFormatter implements vscode.DocumentFormattingEditProvider {
    public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const text = document.getText();
        const parser = new SgfParser(text);
        const result = parser.parse();

        if (result.errors.length > 0 || result.trees.length === 0) {
            return []; // Do not format if there are syntax errors
        }

        let formatted = '';
        for (const tree of result.trees) {
            formatted += this.formatTree(tree, 0) + '\n';
        }

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        );

        return [vscode.TextEdit.replace(fullRange, formatted.trim())];
    }

    private formatTree(tree: SgfGameTree, indentLevel: number): string {
        let result = '('.padStart(indentLevel + 1, ' ');
        
        let nodeCount = 0;
        for (const node of tree.nodes) {
            if (nodeCount > 0 && nodeCount % 10 === 0) {
                // Wrap every 10 nodes for readability
                result += '\n' + ''.padStart(indentLevel + 1, ' ');
            }
            result += this.formatNode(node);
            nodeCount++;
        }

        for (const child of tree.children) {
            result += '\n' + this.formatTree(child, indentLevel + 2);
        }

        if (tree.children.length > 0) {
            result += '\n' + ')'.padStart(indentLevel + 1, ' ');
        } else {
            result += ')';
        }

        return result;
    }

    private formatNode(node: SgfNode): string {
        let result = ';';
        for (const prop of node.properties) {
            result += prop.identifier;
            for (const val of prop.values) {
                // Escape ] and \ if needed
                let escapedVal = val.replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
                result += `[${escapedVal}]`;
            }
        }
        return result;
    }
}
