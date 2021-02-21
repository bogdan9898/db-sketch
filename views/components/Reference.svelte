<script>
	import { createEventDispatcher, onMount } from "svelte";
	import { dimSpecs } from "../constants.js";
	import { tablesDataStore } from "../stores.js";

	export let pathData;

	const dispatch = createEventDispatcher();
	let pathCommands = "";
	// t1 = table containing foreign keys
	// t2 = table to which t1 is pointing

	const [t1Name, t2Name] = pathData.tablesNames.split("->");
	let t1Store = tablesDataStore[t1Name];
	let t2Store = tablesDataStore[t2Name];

	let t1Index;
	let t1AttrWidth;
	let t1AttrHeight;
	let t1Origin;
	t1Store.subscribe((data) => {
		t1Index = data.attrs.indexOf(pathData.info["from"][0]); //-> pathData.info["from"] is an array : treat single elem array differenc from multiple elements arrays
		t1AttrWidth = data.attrWidth;
		t1AttrHeight = data.attrHeight;
		t1Origin = { x: data.origin[0], y: data.origin[1] };
	});

	let t2Index;
	let t2AttrWidth;
	let t2AttrHeight;
	let t2Origin;
	t2Store.subscribe((data) => {
		t2Index = data.attrs.indexOf(pathData.info["to"][0]); //-> pathData.info["from"] is an array : treat single elem array differenc from multiple elements arrays
		t2AttrWidth = data.attrWidth;
		t2AttrHeight = data.attrHeight;
		t2Origin = { x: data.origin[0], y: data.origin[1] };
	});

	$: (() => {
		const offset = dimSpecs["min-path-horizontal-len"];
		if (t1Origin.x + t1AttrWidth < t2Origin.x - offset) {
			const t1X = t1Origin.x + t1AttrWidth;
			const t1Y = t1Origin.y + t1AttrHeight * (t1Index + 1.5);
			const t2X = t2Origin.x;
			const t2Y = t2Origin.y + t2AttrHeight * (t2Index + 1.5);
			pathCommands = `M ${t1X} ${t1Y} H ${(t1X + t2X) / 2} V ${t2Y} L ${t2X} ${t2Y}`;
		} else if (t1Origin.x - offset > t2Origin.x + t2AttrWidth) {
			const t1X = t1Origin.x;
			const t1Y = t1Origin.y + t1AttrHeight * (t1Index + 1.5);
			const t2X = t2Origin.x + t2AttrWidth;
			const t2Y = t2Origin.y + t2AttrHeight * (t2Index + 1.5);
			pathCommands = `M ${t1X} ${t1Y} H ${(t1X + t2X) / 2} V ${t2Y} L ${t2X} ${t2Y}`;
		} else if (t1Origin.x + t1AttrWidth / 2 >= t2Origin.x + t2AttrWidth / 2) {
			const t1X = t1Origin.x;
			const t1Y = t1Origin.y + t1AttrHeight * (t1Index + 1.5);
			const t2X = t2Origin.x;
			const t2Y = t2Origin.y + t2AttrHeight * (t2Index + 1.5);
			pathCommands = `M ${t1X} ${t1Y} H ${t2X - offset} V ${t2Y} L ${t2X} ${t2Y}`;
		} else {
			const t1X = t1Origin.x + t1AttrWidth;
			const t1Y = t1Origin.y + t1AttrHeight * (t1Index + 1.5);
			const t2X = t2Origin.x + t2AttrWidth;
			const t2Y = t2Origin.y + t2AttrHeight * (t2Index + 1.5);
			pathCommands = `M ${t1X} ${t1Y} H ${t2X + offset} V ${t2Y} L ${t2X} ${t2Y}`;
		}
	})();

	onMount(() => {
		dispatch("registerNotifier", {
			target: "ref",
			key: [t1Name, t2Name],
			callback: (data) => {
				console.log("data:");
				console.log(data);
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
	class="ref"
	d={pathCommands}
	on:mouseenter={(event) => handleMouseEvent(event, "hightlightStart")}
	on:mouseleave={(event) => handleMouseEvent(event, "highlightStop")}
/>

<style>
	.ref {
		fill: none;
		stroke: var(--ref-stroke-color);
		stroke-width: 2;
	}

	.ref:hover {
		fill: none;
		stroke: var(--ref-active-stroke-color);
		stroke-width: 4;
	}
</style>
