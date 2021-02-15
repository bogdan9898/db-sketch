function listenMove(el, callbacks) {
	el.addEventListener("mousedown", (event) => startMove(event, callbacks));
}

function listenResize(corners, callbacks) {
	for (let cornerName in corners) {
		corners[cornerName].addEventListener("mousedown", (event) => startResize(event, callbacks, { cornerName }));
	}
}

let mousePos = [0, 0];
function listenZoom(el, callbacks) {
	el.addEventListener("wheel", (event) => tickZoom(event, callbacks, { mousePos }));
	window.addEventListener("mousemove", (event) => {
		mousePos = [event.pageX, event.pageY];
	});
}

function listenPan(el, callbacks) {}

function startMove(event, callbacks) {
	// event.preventDefault(); // THIS HAS TO BE COMMENTED! otherwise the pointer doesnt change to "grabbed"
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
		cornerName: tmpData.cornerName,
		// keep refs to handlers so they can be removed as event listeners
		tickResizeHandler: (event) => tickResize(event, callbacks, tmpData),
		stopResizeHandler: (event) => stopResize(event, callbacks, tmpData),
	};
	document.body.addEventListener("mousemove", tmpData.tickResizeHandler);
	document.body.addEventListener("mouseup", tmpData.stopResizeHandler);

	callbacks.start && callbacks.start(event, { prevCoords: tmpData.prevCoords, cornerName: tmpData.cornerName });
}

function tickResize(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	callbacks.tick && callbacks.tick(event, { prevCoords: tmpData.prevCoords, cornerName: tmpData.cornerName });

	// prevCords are updated inside callbacks
	// tmpData.prevCoords.x = event.pageX;
	// tmpData.prevCoords.y = event.pageY;
}

function stopResize(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	// remove event listeners in order for other tables to be dragged properly
	document.body.removeEventListener("mousemove", tmpData.tickResizeHandler);
	document.body.removeEventListener("mouseup", tmpData.stopResizeHandler);

	callbacks.stop && callbacks.stop(event, { prevCoords: tmpData.prevCoords, cornerName: tmpData.cornerName });
}

function tickZoom(event, callbacks, tmpData) {
	event.preventDefault();
	event.stopPropagation();

	callbacks.tick && callbacks.tick(event, { mousePos: tmpData.mousePos });
}

export default {
	listenMove,
	listenResize,
	listenPan,
	listenZoom,
};
