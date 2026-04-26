import * as vscode from 'vscode';
import { SgfParser, SgfGameTree, SgfNode } from './sgf-parser';

export class SgfLinkProvider implements vscode.DocumentLinkProvider {
    public provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];
        let textToParse = document.getText();
        let blocks: {text: string, startLine: number}[] = [];

        if (document.languageId === 'markdown') {
            blocks = this.extractSgfBlocks(textToParse);
        } else if (document.languageId === 'sgf') {
            blocks = [{ text: textToParse, startLine: 0 }];
        }

        for (const block of blocks) {
            const parser = new SgfParser(block.text);
            const result = parser.parse();
            
            for (const tree of result.trees) {
                this.extractLinksFromTree(tree, block.startLine, links);
            }
        }

        return links;
    }

    private extractLinksFromTree(tree: SgfGameTree, offsetLine: number, links: vscode.DocumentLink[], currentMoveNumber = 0): number {
        let moveNum = currentMoveNumber;
        
        for (const node of tree.nodes) {
            let isMove = false;
            for (const prop of node.properties) {
                if (prop.identifier === 'B' || prop.identifier === 'W') {
                    isMove = true;
                    moveNum++;
                    
                    const color = prop.identifier === 'B' ? 'Black' : 'White';
                    const coord = this.sgfToCoordinate(prop.values[0]);
                    
                    const start = new vscode.Position(offsetLine + prop.range.start.line, prop.range.start.character);
                    const end = new vscode.Position(offsetLine + prop.range.end.line, prop.range.end.character);
                    
                    const link = new vscode.DocumentLink(new vscode.Range(start, end));
                    
                    // We'll create a command URI that shows an information message
                    const title = `${color} plays at ${coord} (Move ${moveNum})`;
                    link.target = vscode.Uri.parse(`command:sgf-markdown-preview.showMoveInfo?${encodeURIComponent(JSON.stringify([title]))}`);
                    link.tooltip = title;
                    
                    links.push(link);
                }
            }
        }

        for (const child of tree.children) {
            this.extractLinksFromTree(child, offsetLine, links, moveNum);
        }

        return moveNum;
    }

    private sgfToCoordinate(sgfCoord: string): string {
        if (!sgfCoord || sgfCoord.length !== 2) return 'Pass';
        const x = sgfCoord.charCodeAt(0) - 'a'.charCodeAt(0);
        const y = sgfCoord.charCodeAt(1) - 'a'.charCodeAt(0);
        if (x < 0 || x >= 19 || y < 0 || y >= 19) return 'Pass';
        const columns = 'ABCDEFGHJKLMNOPQRST';
        return `${columns[x]}${19 - y}`;
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
                startLine = i + 1;
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
