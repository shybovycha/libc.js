import * as utils from './utils.js';

export class Store {
    constructor(initialState) {
        this.state = utils.deepCopy(initialState);
        this.listener = () => null;
        this.reducer = (state, _) => state;
    }

    static createStore(initialState) {
        return new Store(initialState);
    }

    getState() {
        return utils.deepCopy(this.state);
    }

    onAction(fn) {
        this.reducer = fn;
    }

    onStateChanged(fn) {
        this.listener = fn;
    }

    dispatch(action) {
        utils.setImmediate(_ => {
            let oldState = utils.deepCopy(this.state);
            let newState = this.reducer(this.state, action);

            if (utils.deepEqual(newState, oldState))
                return;

            this.state = newState;
            this.listener(newState, oldState);
        });
    }
}
