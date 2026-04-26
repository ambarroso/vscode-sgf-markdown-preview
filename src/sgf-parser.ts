export interface Position {
    line: number;
    character: number;
    offset: number;
}

export interface Range {
    start: Position;
    end: Position;
}

export interface SgfProperty {
    identifier: string;
    values: string[];
    range: Range;
}

export interface SgfNode {
    properties: SgfProperty[];
    range: Range;
}

export interface SgfGameTree {
    nodes: SgfNode[];
    children: SgfGameTree[];
    range: Range;
}

export interface SgfError {
    message: string;
    range: Range;
}

export interface ParseResult {
    trees: SgfGameTree[];
    errors: SgfError[];
}

export class SgfParser {
    private pos = 0;
    private line = 0;
    private character = 0;
    private errors: SgfError[] = [];

    constructor(private readonly text: string) {}

    private advance(): string {
        const char = this.text[this.pos];
        if (char === '\n') {
            this.line++;
            this.character = 0;
        } else {
            this.character++;
        }
        this.pos++;
        return char;
    }

    private peek(): string | undefined {
        return this.text[this.pos];
    }

    private getPosition(): Position {
        return { line: this.line, character: this.character, offset: this.pos };
    }

    private skipWhitespace() {
        while (this.pos < this.text.length && /\s/.test(this.text[this.pos])) {
            this.advance();
        }
    }

    private addError(message: string, startPos: Position) {
        this.errors.push({
            message,
            range: { start: startPos, end: this.getPosition() }
        });
    }

    public parse(): ParseResult {
        this.pos = 0;
        this.line = 0;
        this.character = 0;
        this.errors = [];
        const trees: SgfGameTree[] = [];

        this.skipWhitespace();
        while (this.pos < this.text.length) {
            if (this.peek() === '(') {
                const tree = this.parseGameTree();
                if (tree) trees.push(tree);
            } else {
                const startPos = this.getPosition();
                this.advance(); // Skip unexpected character
                this.addError("Expected '(' to start a game tree", startPos);
            }
            this.skipWhitespace();
        }

        return { trees, errors: this.errors };
    }

    private parseGameTree(): SgfGameTree | null {
        const startPos = this.getPosition();
        this.advance(); // Consume '('
        
        const nodes: SgfNode[] = [];
        const children: SgfGameTree[] = [];

        this.skipWhitespace();

        // Parse Sequence
        while (this.pos < this.text.length && this.peek() === ';') {
            const node = this.parseNode();
            if (node) nodes.push(node);
            this.skipWhitespace();
        }

        if (nodes.length === 0) {
            this.addError("Game tree sequence must contain at least one node", startPos);
        }

        // Parse Child GameTrees
        while (this.pos < this.text.length && this.peek() === '(') {
            const childTree = this.parseGameTree();
            if (childTree) children.push(childTree);
            this.skipWhitespace();
        }

        if (this.peek() === ')') {
            this.advance();
        } else {
            this.addError("Expected ')' to end game tree", this.getPosition());
        }

        return { nodes, children, range: { start: startPos, end: this.getPosition() } };
    }

    private parseNode(): SgfNode | null {
        const startPos = this.getPosition();
        this.advance(); // Consume ';'
        
        const properties: SgfProperty[] = [];
        this.skipWhitespace();

        while (this.pos < this.text.length && /[A-Z]/.test(this.peek() || '')) {
            const prop = this.parseProperty();
            if (prop) properties.push(prop);
            this.skipWhitespace();
        }

        return { properties, range: { start: startPos, end: this.getPosition() } };
    }

    private parseProperty(): SgfProperty | null {
        const startPos = this.getPosition();
        let identifier = '';
        
        while (this.pos < this.text.length && /[A-Z]/.test(this.peek() || '')) {
            identifier += this.advance();
        }

        const values: string[] = [];
        this.skipWhitespace();

        while (this.pos < this.text.length && this.peek() === '[') {
            this.advance(); // Consume '['
            let value = '';
            let escaping = false;

            while (this.pos < this.text.length) {
                const char = this.advance();
                if (escaping) {
                    value += char; // Keep escaped character
                    escaping = false;
                } else if (char === '\\') {
                    escaping = true;
                } else if (char === ']') {
                    break;
                } else {
                    value += char;
                }
            }

            values.push(value);
            this.skipWhitespace();
        }

        if (values.length === 0) {
            this.addError(`Property '${identifier}' requires at least one value`, startPos);
        }

        return { identifier, values, range: { start: startPos, end: this.getPosition() } };
    }
}
