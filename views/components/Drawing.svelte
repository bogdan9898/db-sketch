<!-- todo: include vs code css and remove my own css theme -->
<script>
	import Table from "./Table.svelte";
	import { onMount } from "svelte";
	import uiUtils from "../uiUtils.js";
	import { resizeIndicatorDataStore } from "../store.js";

	// todo: receive data from parser
	const data_sample = [
		{
			name: "books",
			attributes: {
				id: {
					type: "int",
					"primary-key": true,
					"default-value": undefined,
					nullable: false,
					increment: true,
					unique: true,
				},
				"author-id": {
					type: "varchar",
					"primary-key": false,
					"default-value": undefined,
					nullable: false,
					increment: false,
					unique: false,
				},
				name: {
					type: "varchar",
					"primary-key": false,
					"default-value": undefined,
					nullable: false,
					increment: false,
					unique: false,
				},
				year: {
					type: "int",
					"primary-key": false,
					"default-value": undefined,
					nullable: false,
					increment: false,
					unique: false,
				},
			},
			references: [
				// foreign keys
				{
					type: "one-to-one", // many-to-one, one-to-one, one-to-many
					"from-attributes": ["author-id"], // composite or simple foreign key
					"to-table": "author",
					"to-attributes": ["id"], // composite or simple primary key
				},
			],
		},
		// {
		// 	name: "author",
		// 	attributes: {
		// 		id: {
		// 			type: "int",
		// 			"primary-key": true,
		// 			"default-value": undefined,
		// 			nullable: false,
		// 			increment: true,
		// 			unique: true,
		// 		},
		// 		name: {
		// 			type: "varchar",
		// 			"primary-key": false,
		// 			"default-value": undefined,
		// 			nullable: false,
		// 			increment: false,
		// 			unique: false,
		// 		},
		// 		"born-date": {
		// 			type: "date",
		// 			"primary-key": false,
		// 			"default-value": undefined,
		// 			nullable: false,
		// 			increment: false,
		// 			unique: false,
		// 		},
		// 	},
		// },
	];

	for (let data of data_sample) {
		data["table-metadata"] = {
			translate: [10, 10], // todo: generate spawn coords
		};
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
				let newTransform = [
					(data.mousePos[0] - ctm.e) / ctm.a,
					(data.mousePos[1] - ctm.f) / ctm.d,
				];
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
	});
</script>

<style>
	/* https://coolors.co/0081a7-00afb9-fdfcdc-fed9b7-f07167 */
	/* https://coolors.co/f72585-b5179e-7209b7-560bad-480ca8-3a0ca3-3f37c9-4361ee-4895ef-4cc9f0 */
	:global(:root) {
		--header-bkg: #f07167;
		--attr-bkg: #fdfcdc;
		--attr-hover: #fed9b7;
		--attr-width: 300px;
		--attr-height: 45px;
		--attr-name-color: #00afb9;
		--attr-type-color: #00afb9;
		--font-size: 18px;
		--pk-name-color: #0081a7;
		--pk-type-color: #0081a7;
		--tbl-name-color: #fdfcdc;
		--resize-indicator-stroke-color: #0081a7;
		--bck-color: #00afb9; /* #292a2b */
	}

	:global(body) {
		padding: 0px;
		overflow: hidden; /* disable scrollbar */
	}

	#main-svg {
		width: 100%;
		height: 100%;
		white-space: pre;
		background: var(--bck-color);
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

<svg id="main-svg" width="100%" height="100%" bind:this={svg}>
	<g id="group-wrapper" bind:this={rootGroup}>
		{#each data_sample as tableData}
			<Table {tableData} {rootGroup} />
		{/each}
	</g>
	<rect
		class="resizeIndicator"
		visibility={resizeIndicatorIsVisible ? 'visible' : 'hidden'}
		x={$resizeIndicatorDataStore.x}
		y={$resizeIndicatorDataStore.y}
		width={$resizeIndicatorDataStore.width}
		height={$resizeIndicatorDataStore.height} />
</svg>
