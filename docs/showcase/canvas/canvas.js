// Pan and zoom canvas: every mockup is an iframe laid out at its real size, like the design canvas.
(() => {
	const {boards, notes} = window.CANVAS;
	const viewport = document.getElementById('viewport');
	const world = document.getElementById('world');
	const zoomOut = document.getElementById('zoom-out');
	const zoomIn = document.getElementById('zoom-in');
	const zoomFit = document.getElementById('zoom-fit');
	const zoomValue = document.getElementById('zoom-value');

	for (const note of notes) {
		const el = document.createElement('div');
		el.className = 'note';
		el.style.left = `${note.x}px`;
		el.style.top = `${note.y}px`;
		el.textContent = note.text;
		world.append(el);
	}

	for (const board of boards) {
		const el = document.createElement('section');
		el.className = 'board';
		el.style.left = `${board.x}px`;
		el.style.top = `${board.y}px`;
		el.style.width = `${board.w}px`;
		el.dataset.index = boards.indexOf(board);

		const label = document.createElement('a');
		label.className = 'board-label';
		label.href = board.src;
		label.target = '_blank';
		label.rel = 'noopener';
		label.textContent = board.title;
		label.title = 'Ouvrir en pleine page';

		const frame = document.createElement('iframe');
		frame.src = board.src;
		frame.title = board.title;
		frame.width = board.w;
		frame.height = board.h;
		frame.tabIndex = -1;

		el.append(label, frame);
		world.append(el);
	}

	let x = 0;
	let y = 0;
	let scale = 1;

	function apply() {
		world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
		world.style.setProperty('--s', scale);
		zoomValue.textContent = `${Math.round(scale * 100)} %`;
	}

	function zoomAt(factor, cx, cy) {
		const next = Math.min(2, Math.max(0.02, scale * factor));
		x = cx - (cx - x) * (next / scale);
		y = cy - (cy - y) * (next / scale);
		scale = next;
		apply();
	}

	function zoomCenter(factor) {
		const r = viewport.getBoundingClientRect();
		zoomAt(factor, r.width / 2, r.height / 2);
	}

	function fit() {
		const r = viewport.getBoundingClientRect();
		const minX = Math.min(...boards.map((b) => b.x), ...notes.map((n) => n.x));
		const minY = Math.min(...boards.map((b) => b.y), ...notes.map((n) => n.y));
		const maxX = Math.max(...boards.map((b) => b.x + b.w));
		const maxY = Math.max(...boards.map((b) => b.y + b.h));
		const pad = 40;
		scale = Math.min((r.width - pad * 2) / (maxX - minX), (r.height - pad * 2) / (maxY - minY), 1);
		x = pad - minX * scale + (r.width - pad * 2 - (maxX - minX) * scale) / 2;
		y = pad - minY * scale;
		apply();
	}

	function focusBoard(board) {
		const r = viewport.getBoundingClientRect();
		scale = Math.min((r.width - 80) / board.w, 1);
		x = (r.width - board.w * scale) / 2 - board.x * scale;
		y = 64 - board.y * scale;
		apply();
	}

	viewport.addEventListener(
		'wheel',
		(event) => {
			event.preventDefault();
			const r = viewport.getBoundingClientRect();
			if (event.ctrlKey || event.metaKey) {
				zoomAt(Math.exp(-event.deltaY * 0.01), event.clientX - r.left, event.clientY - r.top);
			} else {
				x -= event.deltaX;
				y -= event.deltaY;
				apply();
			}
		},
		{passive: false},
	);

	let drag = null;
	let moved = false;
	viewport.addEventListener('pointerdown', (event) => {
		if (event.button !== 0) return;
		drag = {px: event.clientX, py: event.clientY, x, y};
		moved = false;
		viewport.setPointerCapture(event.pointerId);
	});
	viewport.addEventListener('pointermove', (event) => {
		if (!drag) return;
		const dx = event.clientX - drag.px;
		const dy = event.clientY - drag.py;
		if (!moved && Math.hypot(dx, dy) < 4) return;
		moved = true;
		viewport.classList.add('dragging');
		x = drag.x + dx;
		y = drag.y + dy;
		apply();
	});
	function endDrag() {
		drag = null;
		viewport.classList.remove('dragging');
	}
	viewport.addEventListener('pointerup', endDrag);
	viewport.addEventListener('pointercancel', endDrag);
	// A drag that starts on a title must not open it.
	world.addEventListener('click', (event) => {
		if (moved && event.target.closest('.board-label')) event.preventDefault();
	});
	world.addEventListener('dblclick', (event) => {
		const el = event.target.closest('.board');
		if (el) focusBoard(boards[el.dataset.index]);
	});

	zoomIn.addEventListener('click', () => zoomCenter(1.25));
	zoomOut.addEventListener('click', () => zoomCenter(0.8));
	zoomFit.addEventListener('click', fit);
	window.addEventListener('keydown', (event) => {
		if (event.target.closest('input, textarea')) return;
		if (event.key === '+' || event.key === '=') zoomCenter(1.25);
		if (event.key === '-') zoomCenter(0.8);
		if (event.key === '0') fit();
	});

	fit();
})();
