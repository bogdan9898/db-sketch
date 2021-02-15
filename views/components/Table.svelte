<script>
	import { onMount } from "svelte";
	import uiUtils from "../uiUtils";
	import { resizeIndicatorDataStore } from "../store.js";
	import { printCTM } from "../debugging.js";
	import Header from "./Header.svelte";
	import Attribute from "./Attribute.svelte";
	import { dimSpecs } from "../constants.js";

	export let tableData;
	export let rootGroup;
	const config = dimSpecs; // TO BE DELETED!

	const attributesCount = Object.entries(tableData["attributes"]).length;

	$: origin = tableData["table-metadata"].translate;
	let container;
	let corners = {};
	let elements = {
		header: undefined,
		tableName: undefined,
		attributes: Array.from({ length: attributesCount }, () => {
			return {};
		}),
	};

	$: attrWidth = dimSpecs["attr-width"];
	$: attrHeight = dimSpecs["attr-height"];
	$: fontSize = dimSpecs["font-size"];
	$: headerFontScale = dimSpecs["header-font-scale"];
	$: attrPadding = dimSpecs["attr-padding"];

	let dimensions = {
		// TO BE DELETED!
		attrWidth: config["attr-width"],
		attrHeight: config["attr-height"],
		totalHeight: config["attr-height"] * (attributesCount + 1),
		headerFontSize: config["attr-height"] * config["header-font-scale"],
		fontSize: config["attr-height"] * config["font-scale"],
	};

	let constraints = {
		minAttrWidth: dimSpecs["min-attr-width"],
		minAttrHeight: dimSpecs["min-attr-height"],
	};

	let resizeIndicatorData = {};
	resizeIndicatorDataStore.subscribe((data) => {
		resizeIndicatorData = { ...data };
	});

	onMount(() => {
		// uiUtils.listenResize(corners, {
		// 	start: async (_, data) => {
		// 		document.body.style.cursor = data.cornerName + "-resize";
		// 		const ctm = container.getCTM();
		// 		resizeIndicatorDataStore.set({
		// 			isVisible: true,
		// 			x: ctm.e,
		// 			y: ctm.f,
		// 			width: dimensions.attrWidth * ctm.a,
		// 			height: dimensions.totalHeight * ctm.d,
		// 		});
		// 	},
		// 	tick: async (event, data) => {
		// 		const ctm = container.getCTM();
		// 		// draw resize indicator
		// 		switch (data.cornerName) {
		// 			case "nw": {
		// 				const offsetX = event.pageX - data.prevCoords.x;
		// 				const offsetY = event.pageY - data.prevCoords.y;
		// 				let newWidth = parseFloat(resizeIndicatorData.width) - offsetX;
		// 				let newHeight = parseFloat(resizeIndicatorData.height) - offsetY;
		// 				let newX = parseFloat(resizeIndicatorData.x) + offsetX;
		// 				let newY = parseFloat(resizeIndicatorData.y) + offsetY;
		// 				const constrainedWidth = constraints.minAttrWidth * ctm.a;
		// 				if (newWidth < constrainedWidth) {
		// 					newX += newWidth - constrainedWidth;
		// 					newWidth = constrainedWidth;
		// 				} else {
		// 					data.prevCoords.x = event.pageX;
		// 				}
		// 				const constrainedHeight = constraints.minAttrHeight * ctm.d;
		// 				if (newHeight < constrainedHeight) {
		// 					newY += newHeight - constrainedHeight;
		// 					newHeight = constrainedHeight;
		// 				} else {
		// 					data.prevCoords.y = event.pageY;
		// 				}
		// 				resizeIndicatorDataStore.set({
		// 					isVisible: true,
		// 					x: newX,
		// 					y: newY,
		// 					width: newWidth,
		// 					height: newHeight,
		// 				});
		// 				break;
		// 			}
		// 			case "ne": {
		// 				const offsetY = event.pageY - data.prevCoords.y;
		// 				let newWidth = parseFloat(resizeIndicatorData.width) + event.pageX - data.prevCoords.x;
		// 				let newHeight = parseFloat(resizeIndicatorData.height) - offsetY;
		// 				let newY = parseFloat(resizeIndicatorData.y) + offsetY;
		// 				const constrainedWidth = constraints.minAttrWidth * ctm.a;
		// 				if (newWidth < constrainedWidth) {
		// 					newWidth = constrainedWidth;
		// 				} else {
		// 					data.prevCoords.x = event.pageX;
		// 				}
		// 				const constrainedHeight = constraints.minAttrHeight * ctm.d;
		// 				if (newHeight < constrainedHeight) {
		// 					newY += newHeight - constrainedHeight;
		// 					newHeight = constrainedHeight;
		// 				} else {
		// 					data.prevCoords.y = event.pageY;
		// 				}
		// 				resizeIndicatorDataStore.update((state) => {
		// 					state.y = newY;
		// 					state.width = newWidth;
		// 					state.height = newHeight;
		// 					return state;
		// 				});
		// 				break;
		// 			}
		// 			case "se": {
		// 				let newWidth = parseFloat(resizeIndicatorData.width) + event.pageX - data.prevCoords.x;
		// 				let newHeight = parseFloat(resizeIndicatorData.height) + event.pageY - data.prevCoords.y;
		// 				if (newWidth < constraints.minAttrWidth * ctm.a) {
		// 					newWidth = constraints.minAttrWidth * ctm.a;
		// 				} else {
		// 					// when the width goes bellow the minimum value allowed, stop storing the mouse X so the user can come back to the corner where the resize started without changing the width of indicator rect
		// 					data.prevCoords.x = event.pageX;
		// 				}
		// 				if (newHeight < constraints.minAttrHeight * ctm.d) {
		// 					newHeight = constraints.minAttrHeight * ctm.d;
		// 				} else {
		// 					// when the height goes bellow the minimum value allowed, stop storing the mouse Y so the user can come back to the corner where the resize started without changing the height of indicator rect
		// 					data.prevCoords.y = event.pageY;
		// 				}
		// 				resizeIndicatorDataStore.update((state) => {
		// 					state.width = newWidth;
		// 					state.height = newHeight;
		// 					return state;
		// 				});
		// 				break;
		// 			}
		// 			case "sw": {
		// 				const offsetX = event.pageX - data.prevCoords.x;
		// 				let newWidth = parseFloat(resizeIndicatorData.width) - offsetX;
		// 				let newHeight = parseFloat(resizeIndicatorData.height) + event.pageY - data.prevCoords.y;
		// 				let newX = parseFloat(resizeIndicatorData.x) + offsetX;
		// 				const constrainedWidth = constraints.minAttrWidth * ctm.a;
		// 				if (newWidth < constrainedWidth) {
		// 					newX += newWidth - constrainedWidth;
		// 					newWidth = constrainedWidth;
		// 				} else {
		// 					data.prevCoords.x = event.pageX;
		// 				}
		// 				const constrainedHeight = constraints.minAttrHeight * ctm.d;
		// 				if (newHeight < constrainedHeight) {
		// 					newHeight = constrainedHeight;
		// 				} else {
		// 					data.prevCoords.y = event.pageY;
		// 				}
		// 				resizeIndicatorDataStore.update((state) => {
		// 					state.x = newX;
		// 					state.width = newWidth;
		// 					state.height = newHeight;
		// 					return state;
		// 				});
		// 				break;
		// 			}
		// 		}
		// 	},
		// 	stop: async (_, data) => {
		// 		// isResizeIndicatorVisible.set(false);
		// 		resizeIndicatorDataStore.update((state) => {
		// 			state.isVisible = false;
		// 			return state;
		// 		});
		// 		document.body.style.cursor = "default";
		// 		const ctm = container.getCTM();
		// 		const parentCtm = rootGroup.getCTM();
		// 		// apply the actual resize
		// 		switch (data.cornerName) {
		// 			case "nw": {
		// 				const newWidth = parseFloat(resizeIndicatorData.width) / ctm.a;
		// 				const newHeight = parseFloat(resizeIndicatorData.height) / ctm.d / (attributesCount + 1);
		// 				const newX = (parseFloat(resizeIndicatorData.x) - parentCtm.e) / parentCtm.a; // apply translation relative to the parent
		// 				const newY = (parseFloat(resizeIndicatorData.y) - parentCtm.f) / parentCtm.d; // apply translation relative to the parent
		// 				origin = [newX, newY];
		// 				dimensions.attrWidth = newWidth;
		// 				dimensions.attrHeight = newHeight;
		// 				dimensions.totalHeight = newHeight * (attributesCount + 1);
		// 				dimensions.headerFontSize = newHeight * config["header-font-scale"];
		// 				dimensions.fontSize = newHeight * config["font-scale"];
		// 				elements.header.style.width = newWidth;
		// 				elements.header.style.height = newHeight;
		// 				elements.tableName.style.fontSize = dimensions.headerFontSize;
		// 				let i = 1;
		// 				for (let attribute of elements.attributes) {
		// 					attribute.rect.style.width = newWidth;
		// 					attribute.rect.style.height = newHeight;
		// 					attribute.name.style.width = newWidth;
		// 					attribute.name.style.height = newHeight;
		// 					attribute.name.style.fontSize = dimensions.fontSize;
		// 					attribute.type.style.width = newWidth;
		// 					attribute.type.style.height = newHeight;
		// 					attribute.type.style.fontSize = dimensions.fontSize;
		// 					i++;
		// 				}
		// 				break;
		// 			}
		// 			case "ne": {
		// 				const newWidth = parseFloat(resizeIndicatorData.width) / ctm.a;
		// 				const newHeight = parseFloat(resizeIndicatorData.height) / ctm.d / (attributesCount + 1);
		// 				const newY = (parseFloat(resizeIndicatorData.y) - parentCtm.f) / parentCtm.d; // apply translation relative to the parent
		// 				origin = [origin[0], newY];
		// 				dimensions.attrWidth = newWidth;
		// 				dimensions.attrHeight = newHeight;
		// 				dimensions.totalHeight = newHeight * (attributesCount + 1);
		// 				dimensions.headerFontSize = newHeight * config["header-font-scale"];
		// 				dimensions.fontSize = newHeight * config["font-scale"];
		// 				elements.header.style.width = newWidth;
		// 				elements.header.style.height = newHeight;
		// 				elements.tableName.style.fontSize = dimensions.headerFontSize;
		// 				let i = 1;
		// 				for (let attribute of elements.attributes) {
		// 					attribute.rect.style.width = newWidth;
		// 					attribute.rect.style.height = newHeight;
		// 					attribute.name.style.width = newWidth;
		// 					attribute.name.style.height = newHeight;
		// 					attribute.name.style.fontSize = dimensions.fontSize;
		// 					attribute.type.style.width = newWidth;
		// 					attribute.type.style.height = newHeight;
		// 					attribute.type.style.fontSize = dimensions.fontSize;
		// 					i++;
		// 				}
		// 				break;
		// 			}
		// 			case "se": {
		// 				const newWidth = parseFloat(resizeIndicatorData.width) / ctm.a;
		// 				const newHeight = parseFloat(resizeIndicatorData.height) / ctm.d / (attributesCount + 1);
		// 				dimensions.attrWidth = newWidth;
		// 				dimensions.attrHeight = newHeight;
		// 				dimensions.totalHeight = newHeight * (attributesCount + 1);
		// 				dimensions.headerFontSize = newHeight * config["header-font-scale"];
		// 				dimensions.fontSize = newHeight * config["font-scale"];
		// 				elements.header.style.width = newWidth;
		// 				elements.header.style.height = newHeight;
		// 				elements.tableName.style.fontSize = dimensions.headerFontSize;
		// 				let i = 1;
		// 				for (let attribute of elements.attributes) {
		// 					attribute.rect.style.width = newWidth;
		// 					attribute.rect.style.height = newHeight;
		// 					attribute.name.style.width = newWidth;
		// 					attribute.name.style.height = newHeight;
		// 					attribute.name.style.fontSize = dimensions.fontSize;
		// 					attribute.type.style.width = newWidth;
		// 					attribute.type.style.height = newHeight;
		// 					attribute.type.style.fontSize = dimensions.fontSize;
		// 					i++;
		// 				}
		// 				break;
		// 			}
		// 			case "sw": {
		// 				const newWidth = parseFloat(resizeIndicatorData.width) / ctm.a;
		// 				const newHeight = parseFloat(resizeIndicatorData.height) / ctm.d / (attributesCount + 1);
		// 				const newX = (parseFloat(resizeIndicatorData.x) - parentCtm.e) / parentCtm.a; // apply translation relative to the parent
		// 				origin = [newX, origin[1]];
		// 				dimensions.attrWidth = newWidth;
		// 				dimensions.attrHeight = newHeight;
		// 				dimensions.totalHeight = newHeight * (attributesCount + 1);
		// 				dimensions.headerFontSize = newHeight * config["header-font-scale"];
		// 				dimensions.fontSize = newHeight * config["font-scale"];
		// 				elements.header.style.width = newWidth;
		// 				elements.header.style.height = newHeight;
		// 				elements.tableName.style.fontSize = dimensions.headerFontSize;
		// 				let i = 1;
		// 				for (let attribute of elements.attributes) {
		// 					attribute.rect.style.width = newWidth;
		// 					attribute.rect.style.height = newHeight;
		// 					attribute.name.style.width = newWidth;
		// 					attribute.name.style.height = newHeight;
		// 					attribute.name.style.fontSize = dimensions.fontSize;
		// 					attribute.type.style.width = newWidth;
		// 					attribute.type.style.height = newHeight;
		// 					attribute.type.style.fontSize = dimensions.fontSize;
		// 					i++;
		// 				}
		// 				break;
		// 			}
		// 		}
		// 	},
		// });
	});

	const handleMove = (ev) => {
		const event = ev.detail.event;
		const data = ev.detail.data;
		const parentCtm = rootGroup.getCTM();
		const newX = origin[0] + (event.pageX - data.prevCoords.x) / parentCtm.a;
		const newY = origin[1] + (event.pageY - data.prevCoords.y) / parentCtm.d;
		origin = [newX, newY];
	};
</script>

<g bind:this={container} transform="translate({origin[0]} {origin[1]})" clip-path="url(#round-corners)">
	<defs>
		<clipPath id="round-corners">
			<rect
				width={dimensions.attrWidth}
				height={dimSpecs["attr-height"] * (attributesCount + 1)}
				rx={dimSpecs["rounded-corner-x"]}
				ry={dimSpecs["rounded-corner-y"]}
			/>
		</clipPath>
	</defs>

	<Header
		tableName={tableData["name"]}
		width={attrWidth}
		height={attrHeight}
		fontSize={fontSize * headerFontScale}
		{attrPadding}
		on:move={handleMove}
	/>

	{#each Object.entries(tableData["attributes"]) as [key, value], i}
		<Attribute
			attrName={key}
			attrType={value["type"]}
			width={attrWidth}
			height={attrHeight}
			{fontSize}
			{attrPadding}
			isPrimaryKey={value["is-primary-key"]}
			index={i}
		/>
	{/each}

	{#each ["nw", "ne", "se", "sw"] as side}
		<!-- todo: add fill="transparent" -->
		<circle
			r="15"
			fill="#000"
			cx={["nw", "sw"].includes(side) ? 0 : dimensions.attrWidth}
			cy={["nw", "ne"].includes(side) ? 0 : dimensions.attrHeight * (attributesCount + 1)}
			class="{side}-resizer"
			bind:this={corners[side]}
		/>
	{/each}
</g>

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
