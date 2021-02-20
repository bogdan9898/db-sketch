function listenMove(el, callbacks) {
	el.addEventListener("mousedown", (event) => startMove(event, callbacks));
}

function listenResize(corner, side, callbacks) {
	corner.addEventListener("mousedown", (event) => startResize(event, callbacks, { cornerSide: side }));
}

let mousePos = { x: 0, y: 0 };
function listenZoom(el, callbacks) {
	el.addEventListener("wheel", (event) => tickZoom(event, callbacks, { mousePos }));
	window.addEventListener("mousemove", (event) => {
		mousePos.x = event.pageX;
		mousePos.y = event.pageY;
	});
}

function listenPan(el, callbacks) {
	el.addEventListener("mousedown", (event) => startPan(event, callbacks));
}

function startMove(event, callbacks) {
	event.preventDefault(); // THIS HAS TO BE COMMENTED! otherwise the pointer might not change to "grabbed"
	event.stopPropagation();

	let tmpData = {
		prevCoords: {
			x: event.pageX,
			y: event.pageY,
		},
		// keep refs to handlers so they can be removed as event listeners
		tickMoveHandler: (event) => tickMove(event, callbacks, tmpData),
		stopMoveHandler: (event) => stopMove(event, callbacks, tmpData),
	};
	document.body.addEventListener("mousemove", tmpData.tickMoveHandler);
	document.body.addEventListener("mouseup", tmpData.stopMoveHandler);

	callbacks.start && callbacks.start(event);
}

function tickMove(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	callbacks.tick && callbacks.tick(event, { prevCoords: tmpData.prevCoords });

	tmpData.prevCoords.x = event.pageX;
	tmpData.prevCoords.y = event.pageY;
}

function stopMove(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	// remove event listeners in order for other tables to be dragged properly
	document.body.removeEventListener("mousemove", tmpData.tickMoveHandler);
	document.body.removeEventListener("mouseup", tmpData.stopMoveHandler);

	callbacks.stop && callbacks.stop(event);
}

function startResize(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	tmpData = {
		prevCoords: {
			x: event.pageX,
			y: event.pageY,
		},
		cornerSide: tmpData.cornerSide,
		// keep refs to handlers so they can be removed as event listeners
		tickResizeHandler: (event) => tickResize(event, callbacks, tmpData),
		stopResizeHandler: (event) => stopResize(event, callbacks, tmpData),
	};
	document.body.addEventListener("mousemove", tmpData.tickResizeHandler);
	document.body.addEventListener("mouseup", tmpData.stopResizeHandler);

	callbacks.start && callbacks.start(event, { prevCoords: tmpData.prevCoords, cornerSide: tmpData.cornerSide });
}

function tickResize(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	callbacks.tick && callbacks.tick(event, { prevCoords: tmpData.prevCoords, cornerSide: tmpData.cornerSide });

	// prevCords are updated inside callbacks for control over width/height constraints
	// tmpData.prevCoords.x = event.pageX;
	// tmpData.prevCoords.y = event.pageY;
}

function stopResize(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	// remove event listeners in order for other tables to be resized properly
	document.body.removeEventListener("mousemove", tmpData.tickResizeHandler);
	document.body.removeEventListener("mouseup", tmpData.stopResizeHandler);

	callbacks.stop && callbacks.stop(event, { prevCoords: tmpData.prevCoords, cornerSide: tmpData.cornerSide });
}

function tickZoom(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	callbacks.tick && callbacks.tick(event, { mousePos: tmpData.mousePos });
}

function startPan(event, callbacks) {
	if (event.target.id !== "main-svg") {
		return;
	}
	event.preventDefault();
	event.stopPropagation();

	let tmpData = {
		prevCoords: {
			x: event.pageX,
			y: event.pageY,
		},
		// keep refs to handlers so they can be removed as event listeners
		tickPanHandler: (event) => tickPan(event, callbacks, tmpData),
		stopPanHandler: (event) => stopPan(event, callbacks, tmpData),
	};
	document.body.addEventListener("mousemove", tmpData.tickPanHandler);
	document.body.addEventListener("mouseup", tmpData.stopPanHandler);

	callbacks.start && callbacks.start(event, { prevCoords: tmpData.prevCoords });
}

function tickPan(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	callbacks.tick && callbacks.tick(event, { prevCoords: tmpData.prevCoords });

	tmpData.prevCoords.x = event.pageX;
	tmpData.prevCoords.y = event.pageY;
}

function stopPan(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	// remove event listeners in order for other 'pans' to work properly
	document.body.removeEventListener("mousemove", tmpData.tickPanHandler);
	document.body.removeEventListener("mouseup", tmpData.stopPanHandler);

	callbacks.stop && callbacks.stop(event, { prevCoords: tmpData.prevCoords });
}

export default {
	listenMove,
	listenResize,
	listenPan,
	listenZoom,
};
