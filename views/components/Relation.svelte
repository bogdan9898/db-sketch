<script>
	import { tablesDataStore } from "../stores.js";

	export let pathData;

	const [fromTable, toTable] = pathData.tablesNames.split("->");
</script>

<path d="M 100 400 H 200 V 300" fill="transparent" stroke="black" />
