import { writable } from "svelte/store";

// export const isResizeIndicatorVisible = writable(false);

let resizeIndicatorDataStore = writable({ isVisible: false, x: 0, y: 0, width: 0, height: 0 });
let tablesDataStore = {}; // used by Path component

export default undefined;
export { resizeIndicatorDataStore, tablesDataStore };
