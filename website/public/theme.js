// Loaded in <head> so a stored choice applies before the first paint.
const root = document.documentElement;
function readChoice() {
	try {
		return localStorage.getItem('theme');
	} catch {
		return null;
	}
}
function applyChoice(choice) {
	if (choice === 'light' || choice === 'dark') root.dataset.theme = choice;
	else delete root.dataset.theme;
}
applyChoice(readChoice());

document.addEventListener('DOMContentLoaded', () => {
	const buttons = document.querySelectorAll('[data-theme-choice]');
	function press(choice) {
		buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === choice)));
	}
	press(root.dataset.theme ?? 'auto');
	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			const choice = button.dataset.themeChoice;
			applyChoice(choice);
			press(choice);
			try {
				if (choice === 'auto') localStorage.removeItem('theme');
				else localStorage.setItem('theme', choice);
			} catch {}
		});
	});
});
