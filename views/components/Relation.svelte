<script>
	import { tablesDataStore } from "../stores.js";

	export let pathData;

	// t1 = table containing foreign keys
	// t2 = table to which t1 is pointing

	const [t1Name, t2Name] = pathData.tablesNames.split("->");
	let t1Store = tablesDataStore[t1Name];
	let t2Store = tablesDataStore[t2Name];

	let t1Index;
	t1Store.subscribe((data) => {
		t1Index = data.attrs.indexOf(pathData.info["from"][0]); //-> pathData.info["from"] is an array : treat single elem array differenc from multiple elements arrays
	});
	let t1AttrWidth;
	t1Store.subscribe((data) => {
		t1AttrWidth = data.attrWidth;
	});
	let t1AttrHeight;
	t1Store.subscribe((data) => {
		t1AttrHeight = data.attrHeight;
	});
	let t1X;
	t1Store.subscribe((data) => {
		t1X = data.origin[0] + t1AttrWidth;
	});
	let t1Y;
	t1Store.subscribe((data) => {
		t1Y = data.origin[1] + t1AttrHeight * (t1Index + 1.5);
	});

	let t2Index;
	t2Store.subscribe((data) => {
		t2Index = data.attrs.indexOf(pathData.info["to"][0]); //-> pathData.info["from"] is an array : treat single elem array differenc from multiple elements arrays
	});
	let t2AttrWidth;
	t2Store.subscribe((data) => {
		t2AttrWidth = data.attrWidth;
	});
	let t2AttrHeight;
	t2Store.subscribe((data) => {
		t2AttrHeight = data.attrHeight;
	});
	let t2X;
	t2Store.subscribe((data) => {
		t2X = data.origin[0];
	});
	let t2Y;
	t2Store.subscribe((data) => {
		t2Y = data.origin[1] + t2AttrHeight * (t2Index + 1.5);
	});

	// $: console.log(`${t1Index} ${t2Index}\n${t1AttrWidth} ${t1AttrHeight}\n${t1X} ${t1Y}`);
	// console.log(`t1X: ${t1X}\nt1Y: ${t1Y}`);
	// todo: generate path instructions from t1x, t1y, t2x, t2y
</script>

<path d="M {t1X} {t1Y} H {(t1X + t2X) / 2} V {t2Y} L {t2X} {t2Y}" fill="transparent" stroke="#ffff00" />
