export default {
    name: 'roll',

    initial: ({options}) => {
        switch (options.direction) {
            case 'left':
                return {
                    clipPath: 'inset(0% 0% 0% 100%)',
                };

            case 'right':
                return {
                    clipPath: 'inset(0% 100% 0% 0%)',
                };

            case 'top':
                return {
                    clipPath: 'inset(100% 0% 0% 0%)',
                };

            case 'bottom':
                return {
                    clipPath: 'inset(0% 0% 100% 0%)',
                };
        }
    },

    completed: {
        clipPath: 'inset(0% 0% 0% 0%)',
    },

    defaultOptions: {
        direction: 'top',
    },
};