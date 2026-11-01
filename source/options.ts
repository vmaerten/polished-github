import {mount} from 'svelte';

import {t} from './helpers/i18n.js';
import Options from './options/Options.svelte';

// options.html is static: its language and title follow the browser here
document.documentElement.lang = chrome.i18n.getUILanguage();
document.title = t('options_title');

mount(Options, {target: document.body});
