import { c, connectToStore as connectComponentToStore } from './component.js';
import { Store } from './store.js';
import * as utils from './utils.js';

// create the default store
const store = new Store();

// register the default 'db' event and effect, which is intended to set the state of a store
store.registerEvent('db', (_, msg) => ({ db: msg }));

store.registerEffect('db', (_, msg) => msg);

const registerEvent = store.registerEvent.bind(store);
const registerEffect = store.registerEffect.bind(store);
const createSelector = store.createSelector.bind(store);
const dispatch = store.dispatch.bind(store);

const connectToStore = (arg1, arg2) => {
    if (utils.isArray(arg1)) {
        return connectComponentToStore(arg1, arg2, store);
    } else {
        return connectComponentToStore(arg1, store);
    }
};

export { c };

export {
    registerEvent,
    registerEffect,
    createSelector,
    connectToStore,
    dispatch
};
