(function () {
    // @ts-ignore
    if (typeof WGo === 'undefined') {
        console.error('WGo library not loaded');
        return;
    }

    function renderSgf() {
        const elements = document.getElementsByClassName('sgf-render');
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.getAttribute('data-rendered')) {
                continue;
            }
            const sgfContent = decodeURIComponent(element.getAttribute('data-sgf') || '');
            const showControls = element.getAttribute('data-show-controls') === 'true';
            const showCoordinates = element.getAttribute('data-show-coordinates') === 'true';
            const showNumbers = element.getAttribute('data-show-numbers') === 'true';

            element.innerHTML = ""; // Clear

            try {
                const config = {
                    sgf: sgfContent
                };
                
                if (!showControls) {
                    config.layout = {
                        top: [],
                        right: [],
                        left: [],
                        bottom: []
                    };
                }

                // @ts-ignore
                const player = new WGo.BasicPlayer(element, config);
                
                if (showCoordinates) {
                    player.setCoordinates(true);
                }
                
                // Start with the final position by default
                if (player.last) {
                    player.last();
                }

                if (showNumbers) {
                    let moveNumbers = [];
                    player.addEventListener("update", function(e) {
                        if (moveNumbers.length > 0) {
                            player.board.removeObject(moveNumbers);
                            moveNumbers = [];
                        }
                        if (e.path && e.path.m > 0) {
                            let node = player.kifuReader.node;
                            let count = e.path.m;
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
                
                element.setAttribute('data-rendered', 'true');
            } catch (e) {
                console.error(e);
                element.innerHTML = "Error rendering SGF";
            }
        }
    }

    window.addEventListener('load', renderSgf);
    renderSgf();

    // Observer for changes (e.g. typing in the editor updates the preview)
    const observer = new MutationObserver((mutations) => {
        renderSgf();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}());
