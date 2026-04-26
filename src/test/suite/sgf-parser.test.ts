import * as assert from 'assert';
import { SgfParser } from '../../sgf-parser';

suite('SgfParser Test Suite', () => {
    test('Parses a simple GameTree', () => {
        const text = '(;GM[1]FF[4];B[pd];W[dp])';
        const parser = new SgfParser(text);
        const result = parser.parse();

        assert.strictEqual(result.errors.length, 0);
        assert.strictEqual(result.trees.length, 1);
        
        const tree = result.trees[0];
        assert.strictEqual(tree.nodes.length, 3);
        
        const node1 = tree.nodes[0];
        assert.strictEqual(node1.properties.length, 2);
        assert.strictEqual(node1.properties[0].identifier, 'GM');
        assert.strictEqual(node1.properties[0].values[0], '1');
        assert.strictEqual(node1.properties[1].identifier, 'FF');
        assert.strictEqual(node1.properties[1].values[0], '4');

        const node2 = tree.nodes[1];
        assert.strictEqual(node2.properties[0].identifier, 'B');
        assert.strictEqual(node2.properties[0].values[0], 'pd');
    });

    test('Parses variations', () => {
        const text = '(;B[pd](;W[dp])(;W[cd]))';
        const parser = new SgfParser(text);
        const result = parser.parse();

        assert.strictEqual(result.errors.length, 0);
        assert.strictEqual(result.trees.length, 1);
        
        const tree = result.trees[0];
        assert.strictEqual(tree.nodes.length, 1);
        assert.strictEqual(tree.children.length, 2);
        
        assert.strictEqual(tree.children[0].nodes[0].properties[0].values[0], 'dp');
        assert.strictEqual(tree.children[1].nodes[0].properties[0].values[0], 'cd');
    });

    test('Detects missing closing bracket', () => {
        const text = '(;B[pd';
        const parser = new SgfParser(text);
        const result = parser.parse();

        assert.strictEqual(result.errors.length, 1);
        assert.strictEqual(result.errors[0].message, "Property 'B' requires at least one value");
    });
});
