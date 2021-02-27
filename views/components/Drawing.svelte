<!-- todo: include vs code css and remove my own css theme -->
<script>
	import Table from "./Table.svelte";
	import Reference from "./Reference.svelte";
	import { writable } from "svelte/store";
	import { resizeIndicatorDataStore, tablesDataStore } from "../stores.js";
	import { dimSpecs } from "../constants.js";
	import { zoombable } from "../uiUtils/zoomable.js";
	import { panable } from "../uiUtils/panable.js";

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
	let i = 0;
	for (let name of Object.keys(data_sample["tables"])) {
		let tmp = [800 * i, 400 * i];
		i++;
		tablesOrigins[name] = tmp; // todo: generate non-overlaping spawn coords
		tablesDataStore[name] = writable({
			origin: tmp,
			attrWidth: dimSpecs["attr-width"],
			attrHeight: dimSpecs["attr-height"],
			attrs: [...Object.keys(data_sample["tables"][name])],
		});
	}

	let rootGroup;

	function tickZoom(ev) {
		const data = ev.detail;
		let ctm = rootGroup.getCTM();
		let newTransform = [(data.mousePos.x - ctm.e) / ctm.a, (data.mousePos.y - ctm.f) / ctm.d];
		ctm = ctm
			.translate(...newTransform)
			.scale(Math.sign(data.deltaY) < 0 ? 1.25 : 0.8)
			.translate(-newTransform[0], -newTransform[1]);
		rootGroup.setAttributeNS(null, "transform", `matrix(${ctm.a} ${ctm.b} ${ctm.c} ${ctm.d} ${ctm.e} ${ctm.f})`);
	}

	function tickPan(ev) {
		const data = ev.detail;
		let ctm = rootGroup.getCTM();
		ctm = ctm.translate(
			(data.currCoords.x - data.prevCoords.x) / ctm.a,
			(data.currCoords.y - data.prevCoords.y) / ctm.d
		);
		rootGroup.setAttributeNS(null, "transform", `matrix(${ctm.a} ${ctm.b} ${ctm.c} ${ctm.d} ${ctm.e} ${ctm.f})`);
	}

	let notifiers = { table: {}, ref: {} };
	const registerNotifier = (event) => {
		const { target, callback } = event.detail;
		switch (target) {
			case "table": {
				notifiers[target][event.detail.key] = callback;
				break;
			}
			case "ref": {
				for (const el of event.detail.keys) {
					if (!notifiers[target][el]) {
						notifiers[target][el] = [];
					}
					notifiers[target][el].push(callback);
				}
				break;
			}
		}
	};

	const handleHighlight = (event, action) => {
		const { source } = event.detail;
		switch (source) {
			case "table": {
				const callbacks = notifiers["ref"][event.detail.table + "->" + event.detail.attr];
				if (callbacks) {
					for (const cb of callbacks) {
						cb({ type: action });
					}
				}
				break;
			}
			case "ref": {
				const { tables, from, to } = event.detail;
				let callback = notifiers["table"][tables[0]];
				callback({
					type: action,
					attrs: from,
				});
				callback = notifiers["table"][tables[1]];
				callback({
					type: action,
					attrs: to,
				});
				break;
			}
			default: {
				console.error(`unkown source: ${source}`);
				break;
			}
		}
	};
</script>

<svg id="main-svg" width="100%" height="100%" use:zoombable on:tickZoom={tickZoom} use:panable on:tickPan={tickPan}>
	<g id="group-wrapper" bind:this={rootGroup}>
		{#each Object.entries(data_sample["references"]) as [tablesNames, info]}
			<Reference
				pathData={{ tablesNames, info }}
				on:registerNotifier|once={registerNotifier}
				on:highlightStart={(event) => handleHighlight(event, "highlightStart")}
				on:highlightStop={(event) => handleHighlight(event, "hightlightStop")}
			/>
		{/each}

		{#each Object.entries(data_sample.tables) as [name, attributes]}
			<Table
				tableData={{ name, attributes, "table-metadata": { translate: tablesOrigins[name] } }}
				{rootGroup}
				on:registerNotifier|once={registerNotifier}
				on:highlightStart={(event) => handleHighlight(event, "highlightStart")}
				on:highlightStop={(event) => handleHighlight(event, "highlightStop")}
			/>
		{/each}
	</g>
	<rect
		class="resizeIndicator"
		visibility={$resizeIndicatorDataStore.isVisible ? "visible" : "hidden"}
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
		--attr-hover: var(--vscode-list-focusBackground);
		/* --attr-width: 300px; */
		/* --attr-height: 45px; */
		--attr-name-color: var(--vscode-textPreformat-foreground);
		--attr-type-color: var(--vscode-textPreformat-foreground);
		--attr-active-border: var(--vscode-tab-activeBorder);
		/* --font-size: 18px; */
		--pk-name-color: var(--vscode-textLink-foreground);
		--pk-type-color: var(--vscode-textLink-foreground);
		--tbl-name-color: var(--vscode-textLink-foreground);
		--resize-indicator-stroke-color: var(--vscode-focusBorder);
		--ref-stroke-color: var(--vscode-dropdown-foreground);
		--ref-active-stroke-color: var(--vscode-tab-activeBorder);
	}

	:global(body) {
		padding: 0px;
		overflow: hidden; /* disable scrollbar */
	}

	:global(.txt) {
		/* font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana,
			sans-serif; */
		font-family: var(--vscode-editor-font-family);
		user-select: none;
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
</style>
