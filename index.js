import gsap from 'gsap';

import EmberAnimationsModule from './modules/ember-animations-module';
import EmberEntrancesModule from './modules/ember-entrances-module';

class Ember {
    constructor() {
        this.gsap = gsap;

        this.defaults = {
            // The offset in pixels from the bottom of the viewport before an element is animated.
            rootMargin: '0px 0px -250px 0px',

            // The delay between each element in an entrance group.
            delayBetween: 150,

            // The default animations to use.
            defaultAnimations: {
                primary: 'fade',
            },

            // The default animation options.
            animationOptions: {
                // The default animation duration.
                duration: 0.5,

                // The default animation offset (X and Y).
                offset: 50,

                // The default animation stagger.
                stagger: 0.015,

                // The default animation easing for motion.
                easing: 'power2.out',
            },

            // Per animation options.
            perAnimationOptions: {
                entrance: {},
            },
        };

        this.entrances = new EmberEntrancesModule();
        this.animations = new EmberAnimationsModule();
    }

    /**
     * Set the default options.
     */
    setDefaults(defaults) {
        for (const key in defaults) {
            if (key === 'animationOptions') {
                for (const optionKey in defaults[key]) {
                    this.defaults[key][optionKey] = defaults[key][optionKey];
                }
            } else {
                this.defaults[key] = defaults[key];
            }
        }
    }

    /**
     * Register a list of animations of a given role.
     */
    registerAnimations(role, animations) {
        for (const animation of animations) {
            this.animations.registerAnimation(role, animation);
        }
    }

    /**
     * Register a list of entrances.
     */
    init() {
        this.entrances.init();
    }
}

export default Ember;