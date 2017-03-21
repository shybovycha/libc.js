import { createComponent, c, connectComponentToStore } from './component.js';
import { Store } from './store.js';

if (typeof window !== 'undefined') {
  window.createComponent = createComponent;
  window.createStore = Store.createStore;
  window.connectComponentToStore = connectComponentToStore;
  window.c = c;
} else if (typeof module === 'object' && module != null && module.exports) {
  module.exports = { createComponent, createStore: Store.createStore, c };
}
