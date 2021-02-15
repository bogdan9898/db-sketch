import { writable } from "svelte/store";

// export const isResizeIndicatorVisible = writable(false);

export const resizeIndicatorDataStore = writable({ isVisible: false, x: 0, y: 0, width: 0, height: 0 });
