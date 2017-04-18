import { c, connectToStore } from './component.js';
import { Store } from './store.js';

const exportsObj = { createStore: Store.createStore, c, connectToStore };

if (typeof module === 'object' && module != null && module.exports) {
  Object.assign(module, { exports: exportsObj });
} else if (typeof exports === 'object' && exports != null) {
  Object.assign(exports, { libc: exportsObj });
} else if (typeof window !== 'undefined') {
  Object.assign(window, exportsObj);
}
