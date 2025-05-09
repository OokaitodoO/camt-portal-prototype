import './component/button.js';
import './component/popup.js';
import './component/card.js';
import './component/dropdown.js';
import axios from 'axios';
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/themes/material_blue.css";
import { Thai } from "flatpickr/dist/l10n/th.js";

// Make axios available globally
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

