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

            element.innerHTML = ""; // Clear

            try {
                // @ts-ignore
                new WGo.BasicPlayer(element, {
                    sgf: sgfContent,
                    layout: {
                        top: [],
                        right: [],
                        left: [],
                        bottom: []
                    } // Minimal layout or default
                });
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
