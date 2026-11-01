import {setToken} from './options-storage.js';

// Firefox only, as Chrome ignores background.scripts in Manifest V3. Users can withdraw their data consent in
// about:addons at any time, and the token goes to the API with page data, so it must stop being used.
chrome.permissions.onRemoved.addListener((removed) => {
	const {data_collection: dataCollection = []} = removed as {data_collection?: string[]};
	if (dataCollection.length > 0) {
		void setToken('');
	}
});
