<script>
	import { createEventDispatcher, onMount } from "svelte";
	import { dimSpecs } from "../constants.js";
	import { tablesDataStore } from "../stores.js";
	import { genUid } from "../uid.js";

	export let pathData;

	const dispatch = createEventDispatcher();
	let pathCommands = "";
	let highlight = false;
	const pathUid = `path-${genUid(16)}`;
	let entityInstances = ["-", "-"];
	switch (pathData.info["type"]) {
		case "one-to-one": {
			entityInstances[0] = "1";
			entityInstances[1] = "1";
			break;
		}
		case "many-to-one": {
			entityInstances[0] = "*";
			entityInstances[1] = "1";
			break;
		}
		case "one-to-many": {
			entityInstances[0] = "1";
			entityInstances[1] = "*";
			break;
		}
		default: {
			console.error(`unknown relation: ${pathData.info["type"]}`);
			break;
		}
	}
	let instancesTextNodesCoords = [
		{ x: 0, y: 0 },
		{ x: 0, y: 0 },
	];

	// t1 = table containing foreign keys
	// t2 = table to which t1 is pointing
	const [t1Name, t2Name] = pathData.tablesNames.split("->");
	let t1Store = tablesDataStore[t1Name];
	let t2Store = tablesDataStore[t2Name];

	let t1Index;
	let t1AttrWidth;
	let t1AttrHeight;
	let t1Origin;
	let t1AttrCount;
	t1Store.subscribe((data) => {
		t1Index = data.attrs.indexOf(pathData.info["from"][0]); //-> pathData.info["from"] is an array : treat single elem array differenc from multiple elements arrays
		t1AttrWidth = data.attrWidth;
		t1AttrHeight = data.attrHeight;
		t1Origin = { x: data.origin[0], y: data.origin[1] };
		t1AttrCount = data.attrs.length;
	});

	let t2Index;
	let t2AttrWidth;
	let t2AttrHeight;
	let t2Origin;
	let t2AttrCount;
	t2Store.subscribe((data) => {
		t2Index = data.attrs.indexOf(pathData.info["to"][0]); //-> pathData.info["from"] is an array : treat single elem array differenc from multiple elements arrays
		t2AttrWidth = data.attrWidth;
		t2AttrHeight = data.attrHeight;
		t2Origin = { x: data.origin[0], y: data.origin[1] };
		t2AttrCount = data.attrs.length;
	});

	$: (() => {
		// recalculate new path every time the tables are moved or resized
		const offset = dimSpecs["path-offset"];
		const textHorizontalOffset = dimSpecs["instances-text-horizontal-offset"];
		const textVerticalOffset = dimSpecs["instances-text-vertical-offset"];
		if (t1Origin.x + t1AttrWidth + offset < t2Origin.x - offset) {
			// base case t1<->t2
			const t1X = t1Origin.x + t1AttrWidth;
			const t1Y = t1Origin.y + t1AttrHeight * (t1Index + 1.5);
			const t2X = t2Origin.x;
			const t2Y = t2Origin.y + t2AttrHeight * (t2Index + 1.5);
			pathCommands = `M ${t1X} ${t1Y} H ${(t1X + t2X) / 2} V ${t2Y} H ${t2X}`;
			instancesTextNodesCoords = [
				{ x: t1X + textHorizontalOffset, y: t1Y - textVerticalOffset },
				{ x: t2X - textHorizontalOffset * 2, y: t2Y - textVerticalOffset },
			];
			// pathLength = Math.abs((t1X + t2X) / 2 - t1X) + Math.abs(t2Y - t1Y) + Math.abs(t2X - (t1X + t2X) / 2);
		} else if (t1Origin.x - offset > t2Origin.x + t2AttrWidth + offset) {
			// base case t2<->t1
			const t1X = t1Origin.x;
			const t1Y = t1Origin.y + t1AttrHeight * (t1Index + 1.5);
			const t2X = t2Origin.x + t2AttrWidth;
			const t2Y = t2Origin.y + t2AttrHeight * (t2Index + 1.5);
			pathCommands = `M ${t1X} ${t1Y} H ${(t1X + t2X) / 2} V ${t2Y} H ${t2X}`;
			instancesTextNodesCoords = [
				{ x: t1X - textHorizontalOffset * 2, y: t1Y - textVerticalOffset },
				{ x: t2X + textHorizontalOffset, y: t2Y - textVerticalOffset },
			];
			// pathLength = Math.abs((t1X + t2X) / 2 - t1X) + Math.abs(t2Y - t1Y) + Math.abs(t2X - (t1X + t2X) / 2);
		} else if (t1Origin.x + t1AttrWidth / 2 >= t2Origin.x + t2AttrWidth / 2) {
			// t2<->t1 but not enough space to draw direct path
			const t1Y = t1Origin.y + t1AttrHeight * (t1Index + 1.5);
			const t2Y = t2Origin.y + t2AttrHeight * (t2Index + 1.5);
			if (t2Y - offset >= t1Origin.y + t1AttrHeight * (t1AttrCount + 1) || t2Y + offset <= t1Origin.y) {
				// t1 obstructs right side of t2Attr
				// if(t1 above t2Attr || t1 below t2Attr)
				const t1X = t1Origin.x + t1AttrWidth;
				const t2X = t2Origin.x + t2AttrWidth;
				pathCommands = `M ${t1X} ${t1Y} H ${t1X + offset} V ${t2Y} H ${t2X}`;
				instancesTextNodesCoords = [
					{ x: t1X + textHorizontalOffset, y: t1Y - textVerticalOffset },
					{ x: t2X + textHorizontalOffset, y: t2Y - textVerticalOffset },
				];
				// pathLength = offset + Math.abs(t2Y - t1Y) + Math.abs(t2X - t1X - offset);
			} else if (t1Y - offset >= t2Origin.y + t2AttrHeight * (t2AttrCount + 1) || t1Y + offset <= t2Origin.y) {
				// t2 obstructs left side of t1Attr
				// if(t2 above t1Attr || t2 below t1Attr)
				const t1X = t1Origin.x;
				const t2X = t2Origin.x;
				pathCommands = `M ${t1X} ${t1Y} H ${Math.min(t1X - offset, t2X - offset)} V ${t2Y} H ${t2X}`;
				instancesTextNodesCoords = [
					{ x: t1X - textHorizontalOffset * 2, y: t1Y - textVerticalOffset },
					{ x: t2X - textHorizontalOffset * 2, y: t2Y - textVerticalOffset },
				];
			} else {
				// not short path can be drawn
				const t1X = t1Origin.x + t1AttrWidth;
				const t2X = t2Origin.x;
				const tmpY =
					t1Y >= t2Y
						? Math.max(
								t1Origin.y + (t1AttrCount + 1) * t1AttrHeight,
								t2Origin.y + (t2AttrCount + 1) * t2AttrHeight
						  ) + offset
						: Math.min(t1Origin.y, t2Origin.y) - offset;
				pathCommands = `M ${t1X} ${t1Y} H ${t1X + offset} V ${tmpY} H ${t2X - offset} V ${t2Y} H ${t2X}`;
				instancesTextNodesCoords = [
					{ x: t1X + textHorizontalOffset, y: t1Y - textVerticalOffset },
					{ x: t2X - textHorizontalOffset * 2, y: t2Y - textVerticalOffset },
				];
				// pathLength = offset * 2 + Math.abs(tmpY - t1Y) + Math.abs(t2X - offset - t1X) + Math.abs(t2Y - tmpY) + Math.abs(t2X - t2X + offset);
			}
		} else {
			// t1<->t2 but not enough space to draw direct path
			// t1 obstructs left side of t2Attr
			const t1X = t1Origin.x;
			const t1Y = t1Origin.y + t1AttrHeight * (t1Index + 1.5);
			const t2Y = t2Origin.y + t2AttrHeight * (t2Index + 1.5);
			if (t2Y - offset >= t1Origin.y + t1AttrHeight * (t1AttrCount + 1) || t1Origin.y - offset >= t2Y) {
				// if(t1 above t2 and a shorter path can be drawn ||
				// t1 below t2 and a shorter path can be drawn)
				const t2X = t2Origin.x;
				pathCommands = `M ${t1X} ${t1Y} H ${t1X - offset} V ${t2Y} H ${t2X}`;
				instancesTextNodesCoords = [
					{ x: t1X - textHorizontalOffset * 2, y: t1Y - textVerticalOffset },
					{ x: t2X - textHorizontalOffset * 2, y: t2Y - textVerticalOffset },
				];
				// pathLength = offset + Math.abs(t2Y - t1Y) + Math.abs(t2X - t1X + offset);
			} else if (t1Y - offset >= t2Origin.y + t2AttrHeight * (t2AttrCount + 1) || t1Y + offset <= t2Origin.y) {
				// t2 obstructs left side of t1Attr
				// if(t2 above t1Attr || t2 below t1Attr)
				const t1X = t1Origin.x + t1AttrWidth;
				const t2X = t2Origin.x + t2AttrWidth;
				pathCommands = `M ${t1X} ${t1Y} H ${Math.max(t1X + offset, t2X + offset)} V ${t2Y} H ${t2X}`;
				instancesTextNodesCoords = [
					{ x: t1X + textHorizontalOffset, y: t1Y - textVerticalOffset },
					{ x: t2X + textHorizontalOffset, y: t2Y - textVerticalOffset },
				];
			} else {
				const t2X = t2Origin.x + t2AttrWidth;
				const tmpY =
					t1Y >= t2Y
						? Math.max(
								t1Origin.y + (t1AttrCount + 1) * t1AttrHeight,
								t2Origin.y + (t2AttrCount + 1) * t2AttrHeight
						  ) + offset
						: Math.min(t1Origin.y, t2Origin.y) - offset;
				pathCommands = `M ${t1X} ${t1Y} H ${t1X - offset} V ${tmpY} H ${t2X + offset} V ${t2Y} H ${t2X}`;
				instancesTextNodesCoords = [
					{ x: t1X - textHorizontalOffset * 2, y: t1Y - textVerticalOffset },
					{ x: t2X + textHorizontalOffset, y: t2Y - textVerticalOffset },
				];
				// pathLength = offset * 2 + Math.abs(tmpY - t1Y) + Math.abs(t2X + offset - t1X) + Math.abs(t2Y - tmpY) + Math.abs(t2X - t2X - offset);
			}
		}
	})();

	onMount(() => {
		dispatch("registerNotifier", {
			target: "ref",
			keys: [
				...pathData.info["from"].map((el) => t1Name + "->" + el),
				...pathData.info["to"].map((el) => t2Name + "->" + el),
			],
			callback: async (data) => {
				switch (data.type) {
					case "highlightStart": {
						highlight = true;
						break;
					}
					case "highlightStop": {
						highlight = false;
						break;
					}
					default: {
						console.error(`unkown action: ${data.type}`);
						break;
					}
				}
				dispatch(data.type, {
					source: "ref",
					tables: [t1Name, t2Name],
					from: pathData.info["from"],
					to: pathData.info["to"],
				});
				// handleMouseEvent(undefined, data.type);
			},
		});
	});

	const handleMouseEvent = (_event, action) => {
		dispatch(action, {
			source: "ref",
			tables: [t1Name, t2Name],
			from: pathData.info["from"],
			to: pathData.info["to"],
		});
	};
</script>

<path
	id={pathUid}
	class="ref"
	class:ref-active={highlight === true}
	d={pathCommands}
	on:mouseenter={(event) => handleMouseEvent(event, "highlightStart")}
	on:mouseleave={(event) => handleMouseEvent(event, "highlightStop")}
/>
<text class="txt ref-tips" x={instancesTextNodesCoords[0].x} y={instancesTextNodesCoords[0].y}>
	{entityInstances[0]}
</text>
<text class="txt ref-tips" x={instancesTextNodesCoords[1].x} y={instancesTextNodesCoords[1].y}>
	{entityInstances[1]}
</text>

<style>
	.ref {
		fill: none;
		stroke: var(--ref-stroke-color);
		stroke-width: 2;
	}

	.ref-active {
		fill: none;
		stroke: var(--ref-active-stroke-color);
		stroke-width: 4;
	}

	.ref:hover {
		fill: none;
		stroke: var(--ref-active-stroke-color);
		stroke-width: 4;
	}

	.ref-tips {
		fill: var(--ref-active-stroke-color) !important;
	}
</style>
