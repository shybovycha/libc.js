import { createApplication } from './application.js';

if (typeof window !== 'undefined') {
  window.createApplication = createApplication;
} else if (typeof module === 'object' && module != null && module.exports) {
  module.exports = { createApplication };
}
