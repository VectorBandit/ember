export default {
    name: 'slide-words',

    always: {
        position: 'relative',
    },

    initial: ({options, element}) => {
        // We need to use width and height in the clipPath and offset because they need to be
        // the same, but we can't rely on a generic offset because the element may be a different
        // size than the offset.
        const width = element.node.offsetWidth;
        const height = element.node.offsetHeight;

        let clipPath, offset;

        switch (options.direction) {
            case 'left':
                clipPath = `inset(0 ${width}px 0 0)`;
                offset = width;
                break;

            case 'right':
                clipPath = `inset(0 0 0 ${width}px)`;
                offset = width;
                break;

            case 'top':
                clipPath = `inset(0 0 ${height}px 0)`;
                offset = height;
                break;

            case 'bottom':
                clipPath = `inset(${height}px 0 0 0)`;
                offset = height;
                break;
        }

        return {
            clipPath,
            '{direction}': offset,
        };
    },

    completed: {
        clipPath: 'inset(0px 0px 0px 0px)',
        '{direction}': 0,
    },

    defaultOptions: {
        direction: 'top',
        stagger: 0.05,
        offset: 150,
    },

    onSetup: ({element}) => {
        // Split each word into letters.
        element.node.innerHTML = element.node.innerText
            .split(' ').map(word => `<span class="w">${word}</span>`).join(' ');
    },

    onGetNodes: ({element}) => {
        // GSAP should animate the letters, not the entire element.
        return element.node.querySelectorAll('span.w');
    },

    onComplete: ({element}) => {
        // Reset the HTML to only contain the text.
        element.node.innerHTML = element.node.innerText;
    },
};
