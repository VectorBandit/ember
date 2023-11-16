export default {
    name: 'fade-words',

    always: ({options}) => ({
        position: ['top', 'right', 'bottom', 'left'].includes(options.direction) ? 'relative' : null,
    }),

    initial: {
        opacity: 0,
        '{direction}': '{offset}',
    },

    completed: {
        opacity: 1,
        '{direction}': 0,
    },

    defaultOptions: {
        direction: 'top',
        stagger: 0.05,
        offset: 100,
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
