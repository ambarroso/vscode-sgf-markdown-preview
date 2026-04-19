# SGF Markdown Preview

**SGF Markdown Preview** is a Visual Studio Code extension that renders Smart Game Format (SGF) code blocks as interactive Go boards directly within the Markdown preview. It uses [WGo.js](http://wgo.waltheri.net/) for rendering and playback.

## Features

- **Interactive Go Boards**: Renders SGF content as playable boards.
- **Markdown Integration**: Seamlessly integrates with standard Markdown previews using the `sgf` language identifier.
- **Syntax Highlighting**: Provides standard VS Code TextMate syntax highlighting for `.sgf` files mapping properties and parameters.
- **Snippets**: Auto-generates Markdown SGF block structure when you type `sgf` and hit tab.
- **Playback Controls**: Navigate through moves using the built-in player controls.

## Usage

To render a Go board, simply create a code block in your Markdown file using the `sgf` language identifier and paste your SGF content inside.

### Example

    ```sgf
    (;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]
    RU[Japanese]SZ[19]KM[0.00]
    PW[White]PB[Black]
    ;B[pd];W[dd];B[pq];W[dp];B[qk];W[mp];B[no];W[mo];B[nn];W[mn]
    ;B[nm];W[mm];B[nl];W[ml];B[nk];W[mk];B[nj];W[mj];B[ni];W[mi]
    ;B[nh];W[mh];B[ng];W[mg];B[nf];W[mf];B[ne];W[me];B[nd];W[md]
    ;B[nc];W[mc];B[nb];W[mb];B[na];W[ma];B[oa];W[la];B[ob];W[lb]
    ;B[pc];W[kc];B[qc];W[jc];B[rc];W[ic];B[sc];W[hc];B[tc];W[gc]
    )
    ```

## Requirements

- Visual Studio Code 1.96.0 or newer.

## Extension Settings

Currently, this extension contributes the following settings:
* `sgf-markdown-preview.boardMaxWidth`: Maximum width of the Go board in the Markdown preview (default: `600px`).
* `sgf-markdown-preview.showPlayerControls`: Show navigation controls under the Go board (default: `false`).
* `sgf-markdown-preview.showCoordinates`: Show grid coordinates around the Go board (default: `false`).

## Known Issues

- Large SGF files may impact preview performance.

## Release Notes

### 0.0.2

- Added Syntax Highlighting inside editor via `source.sgf` grammar
- Added VS Code customizable settings for board layout (`boardMaxWidth`, `showPlayerControls`, `showCoordinates`)
- Added quick markdown snippet (`sgf`) for creating new SGF fences
- Explicit injection of text highlighting into `.md` preview windows to fix standard highlighting bugs

### 0.0.1

- Initial release.
- Basic SGF rendering support in Markdown preview.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This extension bundles **WGo.js**, which is also licensed under the MIT License. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for details.

