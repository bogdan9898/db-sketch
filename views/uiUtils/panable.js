export function panable(node) {
	let prevCoords = {
		x: 0,
		y: 0,
	};

	function startPan(event) {
		if (event.target.id !== "main-svg") {
			return;
		}
		event.preventDefault();
		event.stopPropagation();

		prevCoords = {
			x: event.pageX,
			y: event.pageY,
		};
		document.body.addEventListener("mousemove", tickPan);
		document.body.addEventListener("mouseup", stopPan);
		document.body.style.cursor = "move";

		node.dispatchEvent(
			new CustomEvent("startPan", {
				detail: {
					prevCoords,
					currCoords: {
						x: event.pageX,
						y: event.pageY,
					},
				},
			})
		);
	}

	function tickPan(event) {
		event.preventDefault();
		event.stopPropagation();

		node.dispatchEvent(
			new CustomEvent("tickPan", {
				detail: {
					prevCoords,
					currCoords: {
						x: event.pageX,
						y: event.pageY,
					},
				},
			})
		);

		prevCoords = {
			x: event.pageX,
			y: event.pageY,
		};
	}

	function stopPan(event) {
		event.preventDefault();
		event.stopPropagation();

		// remove event listeners in order for other pan operations to work properly
		document.body.removeEventListener("mousemove", tickPan);
		document.body.removeEventListener("mouseup", stopPan);
		document.body.style.cursor = "default";

		node.dispatchEvent(
			new CustomEvent("stopPan", {
				detail: {
					prevCoords,
					currCoords: {
						x: event.pageX,
						y: event.pageY,
					},
				},
			})
		);
	}

	node.addEventListener("mousedown", startPan);

	return {
		destroy() {
			node.removeEventListener("mousedown", startPan);
		},
	};
}
