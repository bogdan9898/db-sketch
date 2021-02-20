<script>
	import { dimSpecs } from "../constants.js";
	import { resizeIndicatorDataStore } from "../store.js";
	import Header from "./Header.svelte";
	import Attribute from "./Attribute.svelte";
	import Corner from "./Corner.svelte";

	export let tableData;
	export let rootGroup;

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

	let resizeIndicatorData = {};
	resizeIndicatorDataStore.subscribe((data) => {
		resizeIndicatorData = { ...data };
	});

	const handleMove = (ev) => {
		const event = ev.detail.event;
		const data = ev.detail.data;
		const parentCtm = rootGroup.getCTM();
		const newX = origin[0] + (event.pageX - data.prevCoords.x) / parentCtm.a;
		const newY = origin[1] + (event.pageY - data.prevCoords.y) / parentCtm.d;
		origin = [newX, newY];
	};

	const handleResize = (ev) => {
		const ctm = container.getCTM();
		const parentCtm = rootGroup.getCTM();
		switch (ev.detail.side) {
			case "nw": {
				const newWidth = parseFloat(resizeIndicatorData.width) / ctm.a;
				const newHeight = parseFloat(resizeIndicatorData.height) / ctm.d / (attributesCount + 1);
				const newX = (parseFloat(resizeIndicatorData.x) - parentCtm.e) / parentCtm.a; // apply translation relative to the parent
				const newY = (parseFloat(resizeIndicatorData.y) - parentCtm.f) / parentCtm.d; // apply translation relative to the parent
				origin = [newX, newY];
				attrWidth = newWidth;
				attrHeight = newHeight;
				break;
			}
			case "ne": {
				const newWidth = parseFloat(resizeIndicatorData.width) / ctm.a;
				const newHeight = parseFloat(resizeIndicatorData.height) / ctm.d / (attributesCount + 1);
				const newY = (parseFloat(resizeIndicatorData.y) - parentCtm.f) / parentCtm.d; // apply translation relative to the parent
				origin = [origin[0], newY];
				attrWidth = newWidth;
				attrHeight = newHeight;
				break;
			}
			case "se": {
				const newWidth = parseFloat(resizeIndicatorData.width) / ctm.a;
				const newHeight = parseFloat(resizeIndicatorData.height) / ctm.d / (attributesCount + 1);
				attrWidth = newWidth;
				attrHeight = newHeight;
				break;
			}
			case "sw": {
				const newWidth = parseFloat(resizeIndicatorData.width) / ctm.a;
				const newHeight = parseFloat(resizeIndicatorData.height) / ctm.d / (attributesCount + 1);
				const newX = (parseFloat(resizeIndicatorData.x) - parentCtm.e) / parentCtm.a; // apply translation relative to the parent
				origin = [newX, origin[1]];
				attrWidth = newWidth;
				attrHeight = newHeight;
				break;
			}
		}
	};
</script>

<g
	bind:this={container}
	transform="translate({origin[0]} {origin[1]})"
	clip-path="url(#round-corners-{tableData['name']})"
>
	<defs>
		<clipPath id="round-corners-{tableData['name']}">
			<rect
				width={attrWidth}
				height={attrHeight * (attributesCount + 1)}
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
		<Corner {side} {attrWidth} {attrHeight} {attributesCount} tableGroup={container} on:resize={handleResize} />
	{/each}
</g>
