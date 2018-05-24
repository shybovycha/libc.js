import * as utils from './utils.js';

export class Store {
    constructor(initialState) {
        this.state = utils.deepCopy(initialState);
        this.listeners = [];
        this.reducers = [];
    }

    static createStore(initialState) {
        return new Store(initialState);
    }

    getState() {
        return utils.deepCopy(this.state);
    }

    onAction(fn) {
        this.reducers.push(fn);
    }

    onStateChanged(fn) {
        this.listeners.push(fn);
    }

    dispatch(action) {
        utils.setImmediate(() => {
            let oldState = utils.deepCopy(this.state);
            let newState = this.reducers.reduce((acc, fn) => fn.call(null, acc, action), this.state);

            if (utils.deepEqual(newState, oldState))
                return;

            this.state = newState;
            this.listeners.forEach(fn => fn.call(null, newState, oldState));
        });
    }
}
