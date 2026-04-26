(function () {
    const vscode = acquireVsCodeApi();

    // The extension will post a message to initialize the editor
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'init') {
            initializeEditor(message.sgf, message.lineStart, message.showCoordinates, message.showNumbers);
        }
    });

    let player;
    let lastSyncedSgf = "";
    let currentLineStart = 0;

    function initializeEditor(sgfContent, lineStart, showCoordinates, showNumbers) {
        currentLineStart = lineStart;
        const container = document.getElementById('board-container');
        container.innerHTML = "";

        try {
            const config = {
                sgf: sgfContent,
                layout: {
                    top: ["Control"],
                    right: [],
                    left: [],
                    bottom: ["CommentBox"]
                }
            };

            // @ts-ignore
            player = new WGo.BasicPlayer(container, config);
            
            if (showCoordinates) {
                player.setCoordinates(true);
            }

            // Start with the final position by default
            if (player.last) {
                player.last();
            }

            // Immediately switch to Edit mode
            if (WGo.Player && WGo.Player.Editable) {
                player._editable = new WGo.Player.Editable(player, player.board);
                player._editable.set(true);
            }

            // Track initial SGF to avoid unnecessary syncs
            if (player.kifuReader && player.kifuReader.kifu) {
                try {
                    lastSyncedSgf = player.kifuReader.kifu.toSgf().replace(/\s/g, '');
                } catch (e) {
                    lastSyncedSgf = sgfContent.replace(/\s/g, '');
                }
            }

            player.addEventListener("update", function() {
                if (!player.kifuReader || !player.kifuReader.kifu) return;
                
                const newSgf = player.kifuReader.kifu.toSgf();
                const cleanNewSgf = newSgf.replace(/\s/g, '');
                
                if (cleanNewSgf !== lastSyncedSgf) {
                    lastSyncedSgf = cleanNewSgf;
                    
                    // Post the updated SGF back to the extension
                    vscode.postMessage({
                        type: 'updateSgf',
                        sgf: newSgf,
                        lineStart: currentLineStart
                    });
                }
            });

            if (showNumbers) {
                let moveNumbers = [];
                player.addEventListener("update", function(e) {
                    if (moveNumbers.length > 0) {
                        player.board.removeObject(moveNumbers);
                        moveNumbers = [];
                    }
                    if (player.kifuReader && player.kifuReader.path && player.kifuReader.path.m > 0) {
                        let node = player.kifuReader.node;
                        let count = player.kifuReader.path.m;
                        while (node && count > 0) {
                            if (node.move && !node.move.pass) {
                                const textColor = node.move.c === WGo.B ? "#ffffff" : "#000000";
                                moveNumbers.push({ x: node.move.x, y: node.move.y, text: count.toString(), type: "LB", c: textColor });
                            }
                            node = node.parent;
                            count--;
                        }
                        player.board.addObject(moveNumbers);
                    }
                });
            }

        } catch (e) {
            console.error("Failed to initialize WGo.js player", e);
            container.innerHTML = `<div style="color: red; padding: 20px;">Error rendering SGF: ${e.message}</div>`;
        }
    }
}());
