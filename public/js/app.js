import './component/button.js';
import './component/popup.js';
import './component/card.js';
import './component/dropdown.js';
import axios from 'axios';

// Make axios available globally
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

