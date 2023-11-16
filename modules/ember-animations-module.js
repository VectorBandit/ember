export default class EmberAnimationsModule {
    constructor() {
        this.animations = {
            entrance: {},
        };
    }

    /**
     * Returns an animation handler.
     * @param role
     * @param name
     * @returns {*|boolean}
     * @private
     */
    _getAnimationHandler(role, name) {
        if (typeof this.animations[role] === 'undefined') {
            return false;
        }

        if (typeof this.animations[role][name] === 'undefined') {
            return false;
        }

        return this.animations[role][name];
    }

    /**
     * Remove the entrance attributes from an element.
     * @param element
     * @private
     */
    _removeEntranceAttributes(element) {
        for (const attrName in element.node.getAttributeNames()) {
            if (!attrName.startsWith('data-entrance-')) continue;
            element.node.removeAttribute(attrName);
        }
    }

    /**
     * Replace the placeholders with the default values.
     * @param currentState
     * @param options
     * @param animation
     * @returns {*}
     * @private
     */
    _replaceStatePlaceholders(currentState, options, animation) {
        const newState = {};

        for (let key in currentState) {
            let value = currentState[key];

            // Replace key placeholders.
            if (key.startsWith('{') && key.endsWith('}')) {
                key = key.replace('{', '').replace('}', '');
                key = options[key] || null;

                if (!key) {
                    // The key placeholder could not be replaced. Skip this property.
                    continue;
                }
            }

            // Replace value placeholders.
            if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                value = value.replace('{', '').replace('}', '');
                value = options[value] || null;

                if (value === null) {
                    // The value placeholder could not be replaced. Skip this property.
                    continue;
                }
            }

            newState[key] = value;
        }

        return newState;
    }

    /**
     * Get the animation options provided in the element.
     * @param element
     * @param animation
     * @private
     */
    _getAnimationOptions(element, animation) {
        const options = {
            animationName: element.anim,
        };

        // Attempt: From the element attributes.
        for (const dataKey in element.node.dataset) {
            if (!dataKey.startsWith('entranceAnim') || dataKey === 'entranceAnim') continue;

            let optionKey = dataKey.replace('entranceAnim', '');
            optionKey = optionKey.charAt(0).toLowerCase() + optionKey.slice(1);

            options[optionKey] = element.node.dataset[dataKey];
        }

        // Attempt: From the global defaults for this animation.
        if (
            typeof ember.defaults.perAnimationOptions[animation.role] !== 'undefined' &&
            typeof ember.defaults.perAnimationOptions[animation.role][animation.name] !== 'undefined'
        ) {
            for (const key in ember.defaults.perAnimationOptions[animation.role][animation.name]) {
                if (typeof options[key] !== 'undefined') continue;

                options[key] = ember.defaults.perAnimationOptions[animation.role][animation.name][key];
            }
        }

        // Attempt: From the animation defaults.
        if (typeof animation.defaultOptions === 'object') {
            for (const key in animation.defaultOptions) {
                if (typeof options[key] !== 'undefined') continue;

                options[key] = animation.defaultOptions[key];
            }
        }

        // Attempt: From the global defaults for all animations.
        for (const key in ember.defaults.animationOptions) {
            if (typeof options[key] !== 'undefined') continue;

            options[key] = ember.defaults.animationOptions[key];
        }

        if (typeof animation.onParseOptions === 'function') {
            animation.onParseOptions({element, options});
        }

        return options;
    }

    _getAnimationPhaseState(animation, element, phase, animationOptions) {
        let gsapState = typeof animation[phase] === 'function' ?
            animation[phase]({element, options: animationOptions}) :
            animation[phase];

        // Apply the persistent state.
        const persistentState = typeof animation.always === 'function' ?
            animation.always({element, options: animationOptions}) :
            animation.always;

        if (typeof persistentState === 'object') {
            for (const key in persistentState) {
                if (persistentState[key] === null) {
                    continue;
                }

                gsapState[key] = persistentState[key];
            }
        }

        // Replace the placeholders.
        gsapState = this._replaceStatePlaceholders(gsapState, animationOptions, animation);

        return gsapState;
    }

    /**
     * Process an animation phase.
     * @param role
     * @param element
     * @param phase
     */
    processAnimationPhase(role, element, phase) {
        const animation = this._getAnimationHandler(role, element.anim);

        if (!animation) {
            // The animation does not exist.
            return;
        }

        // Get the animation options.
        const animationOptions = this._getAnimationOptions(element, animation);

        // Run the setup before setting the initial state.
        if (phase === 'initial' && typeof animation.onSetup === 'function') {
            animation.onSetup({element, options: animationOptions});
        }

        // Get the nodes that will be animated.
        let gsapNodes = element.node;

        if (typeof animation.onGetNodes === 'function') {
            gsapNodes = animation.onGetNodes({element, options: animationOptions});
        }

        // Get the appropriate state.
        const gsapState = this._getAnimationPhaseState(animation, element, phase, animationOptions);

        // Apply the initial state.
        if (phase === 'initial') {
            ember.gsap.set(gsapNodes, gsapState);
        }

        // Apply the completed state.
        if (phase === 'completed') {
            element.node.classList.add(`ember-${role}--started`);

            setTimeout(() => {
                ember.gsap.to(gsapNodes, {
                    // These are options that always have some value, either from the user or the defaults.
                    // For this reason, it's safe to add them directly.
                    duration: animationOptions.duration,
                    ease: animationOptions.easing,
                    stagger: animationOptions.stagger,

                    // Spread the state.
                    ...gsapState,

                    // Add the onComplete callback.
                    onComplete: () => {
                        if (typeof animation.onComplete === 'function') {
                            animation.onComplete({
                                element,
                                options: animationOptions,
                            });
                        }

                        element.node.classList.remove(`ember-${role}--started`);
                        element.node.classList.add(`ember-${role}--completed`);
                    },
                });
            }, element.delay + 100);
        }
    }

    /**
     * Registers a new animation.
     * @param role
     * @param animation
     */
    registerAnimation(role, animation) {
        if (typeof this.animations[role] === 'undefined') {
            console.error(`Invalid animation role: ${role}`);
        }

        if (typeof animation.name !== 'string') {
            console.error('The animation name must be a string.', animation);
        }

        if (typeof this.animations[role][animation.name] !== 'undefined') {
            console.error(`The animation ${animation.name} is already registered.`, animation);
        }

        if (typeof animation.initial === 'undefined') {
            console.error(`The animation ${animation.name} is missing the initial state.`, animation);
        }

        if (typeof animation.completed === 'undefined') {
            console.error(`The animation ${animation.name} is missing the completed state.`, animation);
        }

        animation.role = role;

        this.animations[role][animation.name] = animation;
    }
}