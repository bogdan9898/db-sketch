<script>
	import { onMount } from "svelte";
	import uiUtils from "../uiUtils";
	import { resizeIndicatorDataStore } from "../store.js";
	import { dimSpecs } from "../constants.js";
	import { createEventDispatcher } from "svelte";

	export let side;
	export let attrWidth;
	export let attrHeight;
	export let attributesCount;
	export let tableGroup;

	let corner;
	const dispatch = createEventDispatcher();

	let resizeIndicatorData = {};
	resizeIndicatorDataStore.subscribe((data) => {
		resizeIndicatorData = { ...data };
	});

	onMount(() => {
		uiUtils.listenResize(corner, side, {
			start: async (_, data) => {
				document.body.style.cursor = data.cornerSide + "-resize";
				const ctm = tableGroup.getCTM();
				resizeIndicatorDataStore.set({
					isVisible: true,
					x: ctm.e,
					y: ctm.f,
					width: attrWidth * ctm.a,
					height: attrHeight * (attributesCount + 1) * ctm.d,
				});
			},
			tick: async (event, data) => {
				const ctm = tableGroup.getCTM();
				// draw resize indicator
				switch (data.cornerSide) {
					case "nw": {
						const offsetX = event.pageX - data.prevCoords.x;
						const offsetY = event.pageY - data.prevCoords.y;
						let newWidth = parseFloat(resizeIndicatorData.width) - offsetX;
						let newHeight = parseFloat(resizeIndicatorData.height) - offsetY;
						let newX = parseFloat(resizeIndicatorData.x) + offsetX;
						let newY = parseFloat(resizeIndicatorData.y) + offsetY;
						const constrainedWidth = dimSpecs["min-attr-width"] * ctm.a;
						if (newWidth < constrainedWidth) {
							newX += newWidth - constrainedWidth;
							newWidth = constrainedWidth;
						} else {
							data.prevCoords.x = event.pageX;
						}
						const constrainedHeight = dimSpecs["min-attr-height"] * ctm.d;
						if (newHeight < constrainedHeight) {
							newY += newHeight - constrainedHeight;
							newHeight = constrainedHeight;
						} else {
							data.prevCoords.y = event.pageY;
						}
						resizeIndicatorDataStore.set({
							isVisible: true,
							x: newX,
							y: newY,
							width: newWidth,
							height: newHeight,
						});
						break;
					}
					case "ne": {
						const offsetY = event.pageY - data.prevCoords.y;
						let newWidth = parseFloat(resizeIndicatorData.width) + event.pageX - data.prevCoords.x;
						let newHeight = parseFloat(resizeIndicatorData.height) - offsetY;
						let newY = parseFloat(resizeIndicatorData.y) + offsetY;
						const constrainedWidth = dimSpecs["min-attr-width"] * ctm.a;
						if (newWidth < constrainedWidth) {
							newWidth = constrainedWidth;
						} else {
							data.prevCoords.x = event.pageX;
						}
						const constrainedHeight = dimSpecs["min-attr-height"] * ctm.d;
						if (newHeight < constrainedHeight) {
							newY += newHeight - constrainedHeight;
							newHeight = constrainedHeight;
						} else {
							data.prevCoords.y = event.pageY;
						}
						resizeIndicatorDataStore.update((state) => {
							state.y = newY;
							state.width = newWidth;
							state.height = newHeight;
							return state;
						});
						break;
					}
					case "se": {
						let newWidth = parseFloat(resizeIndicatorData.width) + event.pageX - data.prevCoords.x;
						let newHeight = parseFloat(resizeIndicatorData.height) + event.pageY - data.prevCoords.y;
						if (newWidth < dimSpecs["min-attr-width"] * ctm.a) {
							newWidth = dimSpecs["min-attr-width"] * ctm.a;
						} else {
							// when the width goes bellow the minimum value allowed, stop storing the mouse X so the user can come back to the corner where the resize started without changing the width of indicator rect
							data.prevCoords.x = event.pageX;
						}
						if (newHeight < dimSpecs["min-attr-height"] * ctm.d) {
							newHeight = dimSpecs["min-attr-height"] * ctm.d;
						} else {
							// when the height goes bellow the minimum value allowed, stop storing the mouse Y so the user can come back to the corner where the resize started without changing the height of indicator rect
							data.prevCoords.y = event.pageY;
						}
						resizeIndicatorDataStore.update((state) => {
							state.width = newWidth;
							state.height = newHeight;
							return state;
						});
						break;
					}
					case "sw": {
						const offsetX = event.pageX - data.prevCoords.x;
						let newWidth = parseFloat(resizeIndicatorData.width) - offsetX;
						let newHeight = parseFloat(resizeIndicatorData.height) + event.pageY - data.prevCoords.y;
						let newX = parseFloat(resizeIndicatorData.x) + offsetX;
						const constrainedWidth = dimSpecs["min-attr-width"] * ctm.a;
						if (newWidth < constrainedWidth) {
							newX += newWidth - constrainedWidth;
							newWidth = constrainedWidth;
						} else {
							data.prevCoords.x = event.pageX;
						}
						const constrainedHeight = dimSpecs["min-attr-height"] * ctm.d;
						if (newHeight < constrainedHeight) {
							newHeight = constrainedHeight;
						} else {
							data.prevCoords.y = event.pageY;
						}
						resizeIndicatorDataStore.update((state) => {
							state.x = newX;
							state.width = newWidth;
							state.height = newHeight;
							return state;
						});
						break;
					}
				}
			},
			stop: async (_, data) => {
				resizeIndicatorDataStore.update((state) => {
					state.isVisible = false;
					return state;
				});
				document.body.style.cursor = "default";
				dispatch("resize", {
					side,
				});
			},
		});
	});
</script>

<circle
	r="15"
	fill="#000"
	cx={["nw", "sw"].includes(side) ? 0 : attrWidth}
	cy={["nw", "ne"].includes(side) ? 0 : attrHeight * (attributesCount + 1)}
	class="{side}-resizer"
	bind:this={corner}
/>

<!-- todo: add fill="transparent" to circle -->
<style>
	.nw-resizer {
		cursor: nw-resize;
	}
	.ne-resizer {
		cursor: ne-resize;
	}
	.se-resizer {
		cursor: se-resize;
	}
	.sw-resizer {
		cursor: sw-resize;
	}
</style>
