<!-- todo: include vs code css and remove my own css theme -->
<script>
	import Table from "./Table.svelte";
	import Relation from "./Relation.svelte";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import uiUtils from "../uiUtils.js";
	import { resizeIndicatorDataStore, tablesDataStore } from "../stores.js";
	import { dimSpecs } from "../constants.js";

	// todo: receive data from parser
	const data_sample = {
		tables: {
			books: {
				id: {
					type: "int",
					"is-primary-key": true,
					"default-value": undefined,
					nullable: false,
					increment: true,
					unique: true,
				},
				"author-id": {
					type: "varchar",
					"is-primary-key": false,
					"default-value": undefined,
					nullable: false,
					increment: false,
					unique: false,
				},
				name: {
					type: "varchar",
					"is-primary-key": false,
					"default-value": undefined,
					nullable: false,
					increment: false,
					unique: false,
				},
				year: {
					type: "int",
					"is-primary-key": false,
					"default-value": undefined,
					nullable: false,
					increment: false,
					unique: false,
				},
			},
			author: {
				id: {
					type: "int",
					"is-primary-key": true,
					"default-value": undefined,
					nullable: false,
					increment: true,
					unique: true,
				},
				name: {
					type: "varchar",
					"is-primary-key": false,
					"default-value": undefined,
					nullable: false,
					increment: false,
					unique: false,
				},
				"born-date": {
					type: "date",
					"is-primary-key": false,
					"default-value": undefined,
					nullable: false,
					increment: false,
					unique: false,
				},
			},
		},
		references: {
			// foreign keys -> must point to primary keys (or composite key containing primary key)
			"books->author": {
				type: "one-to-one", // many-to-one, one-to-one, one-to-many
				from: ["author-id"], // composite or simple foreign key
				to: ["id"], // composite or simple primary key -> MUST CONTAIN PRIMARY KEY
			},
		},
	};

	let tablesOrigins = {};
	for (let name of Object.keys(data_sample["tables"])) {
		tablesOrigins[name] = [10, 10]; // todo: generate spawn coords
		tablesDataStore[name] = writable({
			attrWidth: dimSpecs["attr-width"],
			attrHeight: dimSpecs["attr-height"],
			attrs: [Object.keys(data_sample["tables"][name])],
		});
	}

	let rootGroup;
	let svg;

	let resizeIndicatorIsVisible;
	resizeIndicatorDataStore.subscribe((data) => {
		resizeIndicatorIsVisible = data.isVisible;
	});

	onMount(() => {
		uiUtils.listenZoom(svg, {
			tick: (event, data) => {
				let ctm = rootGroup.getCTM();
				let newTransform = [(data.mousePos.x - ctm.e) / ctm.a, (data.mousePos.y - ctm.f) / ctm.d];
				ctm = ctm
					.translate(...newTransform)
					.scale(Math.sign(event.deltaY) < 0 ? 1.25 : 0.8)
					.translate(-newTransform[0], -newTransform[1]);
				rootGroup.setAttributeNS(
					null,
					"transform",
					`matrix(${ctm.a} ${ctm.b} ${ctm.c} ${ctm.d} ${ctm.e} ${ctm.f})`
				);
			},
		});

		uiUtils.listenPan(svg, {
			tick: (event, data) => {
				let ctm = rootGroup.getCTM();
				ctm = ctm.translate(
					(event.pageX - data.prevCoords.x) / ctm.a,
					(event.pageY - data.prevCoords.y) / ctm.d
				);
				rootGroup.setAttributeNS(
					null,
					"transform",
					`matrix(${ctm.a} ${ctm.b} ${ctm.c} ${ctm.d} ${ctm.e} ${ctm.f})`
				);
			},
		});
	});
</script>

<svg id="main-svg" width="100%" height="100%" bind:this={svg}>
	<g id="group-wrapper" bind:this={rootGroup}>
		{#each Object.entries(data_sample.tables) as [name, attributes]}
			<Table tableData={{ name, attributes, "table-metadata": { translate: tablesOrigins[name] } }} {rootGroup} />
		{/each}

		<!-- draw paths  -->
		{#each Object.entries(data_sample["references"]) as [tablesNames, info]}
			<Relation pathData={{ tablesNames, info }} />
		{/each}
	</g>
	<rect
		class="resizeIndicator"
		visibility={resizeIndicatorIsVisible ? "visible" : "hidden"}
		x={$resizeIndicatorDataStore.x}
		y={$resizeIndicatorDataStore.y}
		width={$resizeIndicatorDataStore.width}
		height={$resizeIndicatorDataStore.height}
	/>
</svg>

<style>
	/* https://coolors.co/0081a7-00afb9-fdfcdc-fed9b7-f07167 */
	/* https://coolors.co/f72585-b5179e-7209b7-560bad-480ca8-3a0ca3-3f37c9-4361ee-4895ef-4cc9f0 */
	:global(:root) {
		--bck-color: var(--vscde-editor-background);
		--header-bkg: var(--vscode-dropdown-listBackground);
		--attr-bkg: var(--vscode-dropdown-foreground);
		--attr-hover: var(--vscode-dropdown-listBackground);
		/* --attr-width: 300px; */
		/* --attr-height: 45px; */
		--attr-name-color: var(--vscode-textPreformat-foreground);
		--attr-type-color: var(--vscode-textPreformat-foreground);
		/* --font-size: 18px; */
		--pk-name-color: var(--vscode-textLink-foreground);
		--pk-type-color: var(--vscode-textLink-foreground);
		--tbl-name-color: var(--vscode-textLink-foreground);
		--resize-indicator-stroke-color: var(--vscode-focusBorder);
	}

	:global(body) {
		padding: 0px;
		overflow: hidden; /* disable scrollbar */
	}

	:global(.txt) {
		font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana,
			sans-serif;
		user-select: none;
	}

	#main-svg {
		width: 100%;
		height: 100%;
		white-space: pre;
		background: var(--bck-color);
	}

	#main-svg:active {
		cursor: move;
	}

	.resizeIndicator {
		fill: transparent;
		stroke: var(--resize-indicator-stroke-color);
		stroke-width: 4px;
		stroke-dasharray: 8px;
		stroke-linecap: round;
	}

	@media (min-width: 640px) {
	}
</style>
