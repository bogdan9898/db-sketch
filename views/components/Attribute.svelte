<script>
	export let attrName;
	export let attrType;
	export let width;
	export let height;
	export let fontSize;
	export let attrPadding;
	export let isPrimaryKey;
	export let index;
	export let highlight;

	$: console.log(`${attrName} ${highlight}`);
</script>

<g class="tbl-attr-container" transform="translate(0 {height * (index + 1)})">
	<rect class="tbl-attr" class:rect-active={highlight == true} {width} {height} />

	<text
		dx={attrPadding}
		dy={(height + fontSize) / 2}
		font-size={fontSize}
		class="attr-name txt"
		class:pk={isPrimaryKey}
	>
		{attrName}
	</text>

	<text
		x={width}
		dx="-{attrPadding}"
		dy={(height + fontSize) / 2}
		font-size={fontSize}
		class="attr-type txt"
		class:pk-type={isPrimaryKey}
	>
		{attrType}
	</text>
</g>

<style>
	.tbl-attr-container:hover rect {
		fill: var(--attr-hover);
		stroke: none !important;
	}

	.rect-active {
		fill: var(--attr-hover) !important;
		stroke: none !important;
	}

	.tbl-attr-container:hover {
		cursor: pointer;
	}

	.tbl-attr {
		fill: var(--attr-bkg);
		stroke: var(--attr-bkg);
	}

	.attr-name {
		fill: var(--attr-name-color);
	}

	.attr-type {
		fill: var(--attr-type-color);
		text-anchor: end;
	}

	.pk {
		font-weight: bold;
		fill: var(--pk-name-color) !important;
	}

	.pk-type {
		font-weight: bold;
		fill: var(--pk-type-color) !important;
	}
</style>
