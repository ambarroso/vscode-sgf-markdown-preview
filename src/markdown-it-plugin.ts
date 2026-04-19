import * as vscode from 'vscode';

export default function (md: any) {
    const defaultFence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens: any, idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx];
        if (token.info.trim() === 'sgf') {
            const config = vscode.workspace.getConfiguration('sgf-markdown-preview');
            const maxWidth = config.get<string>('boardMaxWidth', '600px');
            const showControls = config.get<boolean>('showPlayerControls', false);
            const showCoordinates = config.get<boolean>('showCoordinates', false);

            const content = token.content.trim();
            const encodedContent = encodeURIComponent(content);
            // We use a unique ID or just class to identify.
            // data-sgf holds the content.
            return `<div class="sgf-render" data-sgf="${encodedContent}" data-max-width="${maxWidth}" data-show-controls="${showControls}" data-show-coordinates="${showCoordinates}" style="width: 100%; max-width: ${maxWidth}; aspect-ratio: 1;"></div>`;
        }
        return defaultFence(tokens, idx, options, env, self);
    };
    return md;
}
