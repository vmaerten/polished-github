import {getOptions, getToken} from './options-storage.js';

export type Feature = {
	id: string;
	description: string;
	/** Run only on pages where one of these matches. Defaults to every page. */
	include?: Array<() => boolean>;
	exclude?: Array<() => boolean>;
	requiresToken?: boolean;
	/** Called again after every in-app navigation, so it must not inject twice. `signal` aborts on the next one. */
	init: (signal: AbortSignal) => void | Promise<void>;
};

type RunContext = {
	disabled: ReadonlySet<string>;
	hasToken: boolean;
};

export function shouldRun(feature: Feature, {disabled, hasToken}: RunContext): boolean {
	if (disabled.has(feature.id) || (feature.requiresToken && !hasToken)) {
		return false;
	}

	if (feature.include && !feature.include.some(matches => matches())) {
		return false;
	}

	return !feature.exclude?.some(matches => matches());
}

// GitHub swaps pages without a full load: Turbo on most pages, React soft navigation on newer ones
const navigationEvents = ['turbo:render', 'soft-nav:react-done'];

export async function start(features: readonly Feature[]): Promise<void> {
	const [{disabledFeatures}, token] = await Promise.all([getOptions(), getToken()]);
	const context: RunContext = {disabled: new Set(disabledFeatures), hasToken: token !== ''};
	let controller = new AbortController();

	const run = (): void => {
		controller.abort();
		controller = new AbortController();
		for (const feature of features) {
			if (shouldRun(feature, context)) {
				void runFeature(feature, controller.signal);
			}
		}
	};

	for (const event of navigationEvents) {
		document.addEventListener(event, run);
	}

	run();
}

// One failing feature must not take the others down
async function runFeature(feature: Feature, signal: AbortSignal): Promise<void> {
	try {
		await feature.init(signal);
	} catch (error) {
		console.error(`github-power: ${feature.id} failed`, error);
	}
}
