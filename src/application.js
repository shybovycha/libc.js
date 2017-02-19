import { Store } from './store.js';

export class Application {
    constructor(initialState, updateFn, viewFn) {
        this.store = new Store(initialState);

        this.updateFn = updateFn;
        this.viewFn = viewFn;

        this.view = null;

        this.store.onAction(this._onAction.bind(this));
        this.store.onStateChanged(this._onStateChanged.bind(this));
    }

    mount(placeholder) {
        this.view = this.viewFn.call(null, this.store.getState(), this.dispatch.bind(this));
        this.view.materialize(placeholder);
    }

    dispatch(message) {
        this.store.dispatch(message);
    }

    _onAction(state, message) {
        return this.updateFn.call(null, state, message);
    }

    _onStateChanged(state) {
        let newView = this.viewFn.call(null, state, this.dispatch.bind(this));
        this.view.applyChanges(newView);
    }
}

export let createApplication = (initialState, updateFn, viewFn) => new Application(initialState, updateFn, viewFn);
