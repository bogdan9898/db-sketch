export function movable(node) {
	let prevCoords = {
		x: 0,
		y: 0,
	};

	function startMove(event) {
		event.preventDefault(); // THIS HAS TO BE COMMENTED! otherwise the pointer might not change to "grabbed"
		event.stopPropagation();

		prevCoords = {
			x: event.pageX,
			y: event.pageY,
		};
		document.body.addEventListener("mousemove", tickMove);
		document.body.addEventListener("mouseup", stopMove);

		node.dispatchEvent(
			new CustomEvent("startMove", {
				detail: {
					prevCoords,
					event,
				},
			})
		);
	}

	function tickMove(event) {
		event.preventDefault();
		event.stopPropagation();

		node.dispatchEvent(
			new CustomEvent("tickMove", {
				detail: {
					prevCoords,
					event,
				},
			})
		);

		prevCoords = {
			x: event.pageX,
			y: event.pageY,
		};
	}

	function stopMove(event) {
		event.preventDefault();
		event.stopPropagation();

		// remove event listeners in order for other tables to be dragged properly
		document.body.removeEventListener("mousemove", tickMove);
		document.body.removeEventListener("mouseup", stopMove);

		node.dispatchEvent(
			new CustomEvent("stopMove", {
				detail: {
					prevCoords,
					event,
				},
			})
		);
	}

	node.addEventListener("mousedown", startMove);

	return {
		destroy() {
			node.removeEventListener("mousedown", startMove);
		},
	};
}
