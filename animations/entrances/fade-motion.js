export default {
    name: 'fade-motion',

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
};
