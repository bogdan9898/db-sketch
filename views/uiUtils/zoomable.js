export function zoombable(node) {
	let mousePos = { x: 0, y: 0 };

	function updateMousePos(event) {
		mousePos.x = event.pageX;
		mousePos.y = event.pageY;
	}

	function tickZoom(event) {
		event.preventDefault();
		event.stopPropagation();

		node.dispatchEvent(
			new CustomEvent("tickZoom", {
				detail: { mousePos, deltaY: event.deltaY },
			})
		);
	}

	node.addEventListener("wheel", tickZoom);
	window.addEventListener("mousemove", updateMousePos);

	return {
		destroy() {
			node.removeEventListener("wheel", tickZoom);
			window.removeEventListener("mousemove", updateMousePos);
		},
	};
}
