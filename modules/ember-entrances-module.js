class EmberEntrancesModule {
    constructor() {
        this.SELECTOR = {
            GROUP: '.ember-entrance-group',
            SKIP: '.ember-entrance-skip',
            ELEMENT: '.ember-entrance, [class*=" ember-entrance--"]',
        };

        this._entranceGroups = [];
    }

    _buildEntranceGroup(groupNode) {
        if (groupNode.getBoundingClientRect().top < 0) {
            // This group is above the viewport. Skip it.
            return null;
        }

        const group = {
            /** The group node. */
            node: groupNode,

            /**
             * The elements in the group.
             * Each element will be animated individually.
             */
            elements: [],

            /**
             * The delay in milliseconds before the animation starts.
             * This will also delay the animation on each element in the group.
             */
            delay: 0,

            /**
             * The delay in milliseconds between each element animation.
             * This will be added to the delay of each element in the group.
             *
             * By default, this is set to 0.
             * You can activate the DEFAULT delay by adding an EMPTY [data-entrance-delay-between] attribute to the group.
             * You can also set a CUSTOM delay by adding a [data-entrance-delay-between] attribute to the group.
             *
             * Example:
             *      <div class="ember-entrance-group" data-entrance-delay-between> <-- Default delay, if one is configured.
             *      <div class="ember-entrance-group" data-entrance-delay-between="150"> <-- Custom delay.
             */
            delayBetween: ember.defaults.delayBetween,
        };

        // Get the delay attribute.
        if (groupNode.dataset.entranceDelay) {
            group.delay = parseInt(groupNode.dataset.entranceDelay);
        }

        // Get the delay-between attribute.
        if (groupNode.dataset.entranceDelayBetween) {
            group.delayBetween = parseInt(groupNode.dataset.entranceDelayBetween);
        }

        /**
         * The list of nested groups.
         * This is used to filter out elements that are nested in other groups.
         * @type {Element[]}
         */
        const nestedGroups = Array.from(groupNode.querySelectorAll(this.SELECTOR.GROUP));

        /**
         * The list of skipped areas.
         * This is used to filer out elements that are meant to be skipped.
         * Useful in tab systems or sliders where you only want to animate the first element.
         * @type {Element[]}
         */
        const skippedAreas = Array.from(groupNode.querySelectorAll(this.SELECTOR.SKIP));

        // Get the list of child elements.
        let currentDelayIndex = 0;

        groupNode.querySelectorAll(this.SELECTOR.ELEMENT).forEach(elementNode => {
            const parentGroup = elementNode.closest(this.SELECTOR.GROUP);
            if (parentGroup && nestedGroups.includes(parentGroup)) {
                // This element is nested in another group. Skip it.
                return;
            }

            const parentSkip = elementNode.closest(this.SELECTOR.SKIP);
            if (parentSkip && skippedAreas.includes(parentSkip)) {
                // This element is nested in a skipped area. Skip it.
                return;
            }

            const element = {
                /** The element node. */
                node: elementNode,

                /**
                 * The delay in milliseconds before the animation starts.
                 * There are a number of ways to override this value:
                 *
                 * - Add a [data-entrance-delay] attribute to the element (fixed value).
                 * - Add a [data-entrance-delay-add] attribute to the element (added to the delay value).
                 * - Add a [data-entrance-delay-index] attribute to the element (multiplied by the delay-between value).
                 * - Add a [data-entrance-delay-index-reset] attribute to the element (resets the delay index for this element and all following elements).
                 */
                delay: 0,
            };

            // Get the animation category.
            if (elementNode.dataset.entranceAnim) {
                element.anim = elementNode.dataset.entranceAnim;
            } else {
                const emberClass = Array.from(elementNode.classList).find(c => c.startsWith('ember-entrance--'));
                const animationCategory = emberClass ? emberClass.replace('ember-entrance--', '') : 'primary';

                element.anim = (
                    ember.defaults.defaultAnimations[animationCategory] ||
                    ember.defaults.defaultAnimations.primary
                );
            }

            // Apply the animation delay.
            let elementDelay = group.delayBetween * currentDelayIndex;

            switch (true) {
                case elementNode.hasAttribute('data-entrance-delay'):
                    elementDelay = parseInt(elementNode.dataset.entranceDelay);
                    break;

                case elementNode.hasAttribute('data-entrance-delay-add'):
                    elementDelay += parseInt(elementNode.dataset.entranceDelayAdd);
                    break;

                case elementNode.hasAttribute('data-entrance-delay-index'):
                    elementDelay = group.delayBetween * parseInt(elementNode.dataset.entranceDelayIndex);
                    break;

                case elementNode.hasAttribute('data-entrance-delay-index-reset'):
                    currentDelayIndex = 0;
                    elementDelay = group.delayBetween * currentDelayIndex;
                    break;
            }

            element.delay = elementDelay;

            // Add the animation type class.
            element.node.classList.add(`ember-entrance--${element.anim}`);

            // Apply the initial animation state.
            ember.animations.processAnimationPhase('entrance', element, 'initial');

            group.elements.push(element);

            // Increment the delay index.
            currentDelayIndex++;
        });

        return group;
    }

    _gatherEntranceElements() {
        this._entranceGroups = Array.from(document.querySelectorAll(this.SELECTOR.GROUP)).reduce((groups, groupNode) => {
            const group = this._buildEntranceGroup(groupNode);

            if (group) {
                groups.push(group);
            }

            return groups;
        }, []);
    }

    _observeEntranceElements() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const group = this._entranceGroups.find(g => g.node === entry.target);
                if (!group) return;

                if (entry.isIntersecting) {
                    // The group is in the viewport.
                    // Animate each element in the group.
                    group.elements.forEach(element => {
                        ember.animations.processAnimationPhase('entrance', element, 'completed');
                    });

                    // Stop observing the group.
                    observer.unobserve(group.node);
                }
            });
        }, {
            rootMargin: ember.defaults.rootMargin,
        });

        // Observe each group.
        this._entranceGroups.forEach(group => observer.observe(group.node));
    }

    init() {
        this._gatherEntranceElements();

        setTimeout(() => {
            this._observeEntranceElements();
        }, 300);
    }
}

export default EmberEntrancesModule;
