/** Calls `callback` with the elements matching `selector`, now and whenever GitHub renders new ones, until `signal` aborts. */
export function observe(
	selector: string,
	callback: (elements: Element[]) => void,
	{signal}: {signal: AbortSignal},
): void {
	// A navigation during the caller's await aborts the signal before we listen to it
	if (signal.aborted) {
		return;
	}

	const seen = new WeakSet<Element>();
	const check = (): void => {
		// After an update or a reload of the extension, this script lives on in open tabs without the extension's APIs:
		// the callbacks would fail on them until the tab reloads
		if (!chrome.runtime?.id) {
			observer.disconnect();
			return;
		}

		const added = [...document.querySelectorAll(selector)].filter((element) => !seen.has(element));
		for (const element of added) {
			seen.add(element);
		}

		if (added.length > 0) {
			callback(added);
		}
	};

	const observer = new MutationObserver(check);
	observer.observe(document.body, {childList: true, subtree: true});
	signal.addEventListener('abort', () => observer.disconnect(), {once: true});
	check();
}
