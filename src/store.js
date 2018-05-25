import * as utils from './utils.js';

export class Store {
    constructor(initialState = {}) {
        this.state = utils.deepCopy(initialState);
        this.eventHandlers = {};
        this.effectHandlers = {};
        this.selectors = {};
        this.listeners = [];
    }

    getState() {
        return utils.deepCopy(this.state);
    }

    registerEvent(eventName, handler) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [ handler ];
        } else {
            this.eventHandlers[eventName].push(handler);
        }
    }

    registerEffect(effectName, handler) {
        if (!this.effectHandlers[effectName]) {
            this.effectHandlers[effectName] = [ handler ];
        } else {
            this.effectHandlers[effectName].push(handler);
        }
    }

    createSelector(selectorName, selectorFn) {
        if (this.selectors[selectorName]) {
            throw new Error(`Selector "${selectorName}" is already defined`);
        }

        this.selectors[selectorName] = utils.memoizeFunction(selectorFn);
    }

    /**
     * Set the stateChange event handler
     *
     * @param {Array<String>|Function<*>} arg1 Either a list of selector names or the onStateChange handler
     * @param {Function<*>} arg2 In case when arg1 is a list of selector names, this should be the onStateChange handler
     */
    onStateChanged(arg1, arg2) {
        if (utils.isFunction(arg1)) {
            this.listeners.push(utils.memoizeFunction(arg1));
        } else if (utils.isArray(arg1)) {
            const compoundFn = function () {
                const args = arg1.map(selectorName => this.selectors[selectorName]).map(fn => fn.apply(null, arguments));

                return arg2.apply(null, args);
            };

            this.listeners.push(utils.memoizeFunction(compoundFn));
        }
    }

    dispatch(event) {
        utils.setImmediate(() => {
            const currentState = utils.deepCopy(this.state);

            const effectDescriptors = utils.flatten(Object.entries(event).map(([eventName, eventParams]) => this._handleEvent(eventName, eventParams, currentState)));

            const newState = effectDescriptors.reduce((state, effects) => {
                return Object.entries(effects).reduce((acc, [effectName, effectParams]) => this._handleEffect(effectName, effectParams, acc), state);
            }, this.state);

            if (utils.deepEqual(newState, currentState)) {
                return;
            }

            this.state = newState;
            this.listeners.forEach(fn => fn.call(null, newState));
        });
    }

    _handleEvent(eventName, eventParams, currentState) {
        const eventHandlers = this.eventHandlers[eventName];

        if (!eventHandlers) {
            throw new Error(`Event "${eventName}" has no handlers registered`);
        }

        return eventHandlers.map(eventHandler => eventHandler.call(null, currentState, eventParams));
    }

    _handleEffect(effectName, effectParams, currentState) {
        const effectHandlers = this.effectHandlers[effectName];

        if (!effectHandlers) {
            throw new Error(`Effect "${effectName}" has no handlers registered`);
        }

        return effectHandlers.reduce((state, effectHandler) => effectHandler.call(null, state, effectParams), currentState);
    }
}
