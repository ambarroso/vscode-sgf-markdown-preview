import * as vscode from 'vscode';

export default function (md: any) {
    const defaultFence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens: any, idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx];
        if (token.info.trim() === 'sgf') {
            const content = token.content.trim();
            const encodedContent = encodeURIComponent(content);
            // We use a unique ID or just class to identify.
            // data-sgf holds the content.
            return `<div class="sgf-render" data-sgf="${encodedContent}" style="width: 100%; max-width: 600px; aspect-ratio: 1;"></div>`;
        }
        return defaultFence(tokens, idx, options, env, self);
    };
    return md;
}
