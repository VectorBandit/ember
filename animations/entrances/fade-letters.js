export default {
    name: 'fade-letters',

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
    },

    onSetup: ({element}) => {
        // Split each word into letters.
        element.node.innerHTML = element.node.innerText
            .split(' ').map(word => {
                const letters = word.split('').map(letter => `<span class="l">${letter}</span>`).join('');
                return `<span class="w">${letters}</span>`;
            }).join(' ');
    },

    onGetNodes: ({element}) => {
        // GSAP should animate the letters, not the entire element.
        return element.node.querySelectorAll('span.l');
    },

    onComplete: ({element}) => {
        // Reset the HTML to only contain the text.
        element.node.innerHTML = element.node.innerText;
    },
};
