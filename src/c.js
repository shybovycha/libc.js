import { c } from './vdom.js';
import { createApplication } from './application.js';

if (typeof window !== 'undefined') {
  window.c = c;
  window.createApplication = createApplication;
} else if (typeof module === 'object' && module != null && module.exports) {
  module.exports = { c, createApplication };
}
