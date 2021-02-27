<script>
	import { createEventDispatcher } from "svelte";
	import { movable } from "../uiUtils/moveable.js";

	export let tableName;
	export let width;
	export let height;
	export let fontSize;
	export let attrPadding;

	const dispatch = createEventDispatcher();

	function tickMove(ev) {
		dispatch("move", {
			...ev.detail,
		});
	}
</script>

<g class="draggable" use:movable on:tickMove={tickMove}>
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
