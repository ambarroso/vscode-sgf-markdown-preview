import * as vscode from 'vscode';

export default function (md: any) {
    const defaultFence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens: any, idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx];
        const info = token.info.trim();
        if (info.startsWith('sgf')) {
            const config = vscode.workspace.getConfiguration('sgf-markdown-preview');
            const maxWidth = config.get<string>('boardMaxWidth', '600px');
            const showControls = config.get<boolean>('showPlayerControls', false);
            const showCoordinates = config.get<boolean>('showCoordinates', false);
            const showNumbers = info.includes('showNumbers');

            const content = token.content.trim();
            const encodedContent = encodeURIComponent(content);
            const lineStart = token.map ? token.map[0] : 0;
            
            // Clean, pure HTML for rendering.
            return `<div class="sgf-render" data-sgf="${encodedContent}" data-line-start="${lineStart}" data-max-width="${maxWidth}" data-show-controls="${showControls}" data-show-coordinates="${showCoordinates}" data-show-numbers="${showNumbers}" style="width: 100%; max-width: ${maxWidth}; aspect-ratio: 1;"></div>\n`;
        }
        return defaultFence(tokens, idx, options, env, self);
    };

    return md;
}
