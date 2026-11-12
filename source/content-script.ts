import {start} from './feature-manager.js';
import {features} from './features/index.js';
import {announceUpdate} from './whats-new.js';

// First, so it reads the storage before a feature writes to it on a fresh install
void announceUpdate();
void start(features);
