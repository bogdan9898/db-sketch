<script>
	import { onMount } from "svelte";
	import { createEventDispatcher } from "svelte";

	export let tableName;
	export let width;
	export let height;
	export let fontSize;
	export let attrPadding;

	let group;
	const dispatch = createEventDispatcher();

	onMount(() => {
		uiUtils.listenMove(group, {
			tick: (event, data) => {
				dispatch("move", {
					event,
					data,
				});
			},
		});
	});
</script>

<g class="draggable" bind:this={group}>
	<rect class="tbl-header" {width} {height} />

	<text class="tbl-name txt" dx={attrPadding} dy={(height + fontSize) / 2} font-size={fontSize}>
		{tableName}
	</text>
</g>

<style>
	.draggable:hover {
		cursor: grab;
	}

	.draggable:active {
		cursor: grabbing;
	}

	.tbl-header {
		fill: var(--header-bkg);
	}

	.tbl-name {
		font-weight: bold;
		fill: var(--tbl-name-color);
	}
</style>
