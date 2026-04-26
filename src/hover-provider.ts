import * as vscode from 'vscode';
import { SgfParser, SgfNode, SgfGameTree } from './sgf-parser';

export class SgfHoverProvider implements vscode.HoverProvider {
    public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        let textToParse = document.getText();
        let offsetLine = 0;

        if (document.languageId === 'markdown') {
            const sgfBlocks = this.extractSgfBlocks(textToParse);
            let inBlock = false;
            for (const block of sgfBlocks) {
                if (position.line >= block.startLine && position.line < block.endLine) {
                    textToParse = block.text;
                    offsetLine = block.startLine;
                    inBlock = true;
                    break;
                }
            }
            if (!inBlock) return null;
        }

        const parser = new SgfParser(textToParse);
        const result = parser.parse();
        
        if (result.trees.length === 0) return null;

        const targetPos = new vscode.Position(position.line - offsetLine, position.character);
        
        // Find the node
        const { node, moveNumber } = this.findNodeAtPosition(result.trees[0], targetPos, 0);
        
        if (node) {
            for (const prop of node.properties) {
                // Check if position is within property
                if (targetPos.line === prop.range.start.line && targetPos.line === prop.range.end.line) {
                    if (targetPos.character >= prop.range.start.character && targetPos.character <= prop.range.end.character) {
                        if (prop.identifier === 'B' || prop.identifier === 'W') {
                            const color = prop.identifier === 'B' ? 'Black' : 'White';
                            const coord = this.sgfToCoordinate(prop.values[0]);
                            const markdown = new vscode.MarkdownString();
                            markdown.appendMarkdown(`**${color}** plays at **${coord}** *(Move ${moveNumber})*`);
                            return new vscode.Hover(markdown);
                        }
                    }
                }
            }
        }

        return null;
    }

    private findNodeAtPosition(tree: SgfGameTree, pos: vscode.Position, currentMoveNumber: number): { node: SgfNode | null, moveNumber: number } {
        let moveNum = currentMoveNumber;
        for (const node of tree.nodes) {
            if (node.properties.some(p => p.identifier === 'B' || p.identifier === 'W')) {
                moveNum++;
            }
            
            // Check if pos intersects node
            if (pos.line >= node.range.start.line && pos.line <= node.range.end.line) {
                return { node, moveNumber: moveNum };
            }
        }
        
        for (const child of tree.children) {
            const result = this.findNodeAtPosition(child, pos, moveNum);
            if (result.node) return result;
        }

        return { node: null, moveNumber: 0 };
    }

    private sgfToCoordinate(sgfCoord: string): string {
        if (!sgfCoord || sgfCoord.length !== 2) return 'Pass';
        
        const x = sgfCoord.charCodeAt(0) - 'a'.charCodeAt(0);
        const y = sgfCoord.charCodeAt(1) - 'a'.charCodeAt(0);
        
        if (x < 0 || x >= 19 || y < 0 || y >= 19) return 'Pass';

        const columns = 'ABCDEFGHJKLMNOPQRST'; // Note: 'I' is skipped
        const col = columns[x];
        const row = 19 - y;
        
        return `${col}${row}`;
    }

    private extractSgfBlocks(text: string): {text: string, startLine: number, endLine: number}[] {
        const blocks: {text: string, startLine: number, endLine: number}[] = [];
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
                blocks.push({ text: currentBlock, startLine, endLine: i });
            } else if (inBlock) {
                currentBlock += line + '\n';
            }
        }
        return blocks;
    }
}
