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
