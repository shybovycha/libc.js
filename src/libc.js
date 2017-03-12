import { createComponent } from './component.js';

if (typeof window !== 'undefined') {
  window.createComponent = createComponent;
} else if (typeof module === 'object' && module != null && module.exports) {
  module.exports = { createComponent };
}
