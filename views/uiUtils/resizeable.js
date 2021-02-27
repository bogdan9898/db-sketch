export function resizeable(node, side) {
	let prevCoords = {
		x: 0,
		y: 0,
	};

	function startResize(event) {
		event.preventDefault();
		event.stopPropagation();

		prevCoords = {
			x: event.pageX,
			y: event.pageY,
		};
		document.body.addEventListener("mousemove", tickResize);
		document.body.addEventListener("mouseup", stopResize);

		node.dispatchEvent(
			new CustomEvent("startResize", {
				detail: {
					prevCoords,
					event,
				},
			})
		);
	}

	function tickResize(event) {
		event.preventDefault();
		event.stopPropagation();

		node.dispatchEvent(
			new CustomEvent("tickResize", {
				detail: {
					prevCoords,
					event,
				},
			})
		);

		// prevCords are updated inside event handler of the parent for control over width/height constraints
		// tmpData.prevCoords.x = event.pageX;
		// tmpData.prevCoords.y = event.pageY;
	}

	function stopResize(event) {
		event.preventDefault();
		event.stopPropagation();

		// remove event listeners in order for other tables to be resized properly
		document.body.removeEventListener("mousemove", tickResize);
		document.body.removeEventListener("mouseup", stopResize);

		node.dispatchEvent(
			new CustomEvent("stopResize", {
				detail: {
					prevCoords,
					event,
				},
			})
		);
	}

	node.addEventListener("mousedown", startResize);

	return {
		destroy() {
			node.removeEventListener("mousedown", startResize);
		},
	};
}
