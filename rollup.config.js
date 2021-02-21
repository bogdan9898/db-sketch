import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import fs from "fs";
import path from "path";

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
				stdio: ["ignore", "inherit", "inherit"],
				shell: true,
			});

			process.on("SIGTERM", toExit);
			process.on("exit", toExit);
		},
	};
}

export default fs.readdirSync(path.join(__dirname, "views", "pages")).map((inputFile) => {
	const fileName = inputFile.split(".")[0];
	return {
		input: `views/pages/${inputFile}`,
		output: {
			sourcemap: true,
			format: "iife",
			name: "app",
			file: `out/views/${fileName}.js`,
		},
		plugins: [
			svelte({
				compilerOptions: {
					// enable run-time checks when not in production
					dev: !production,
				},
			}),
			// we'll extract any component CSS out into
			// a separate file - better for performance
			css({ output: `${fileName}.css` }),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration -
			// consult the documentation for details:
			// https://github.com/rollup/plugins/tree/master/packages/commonjs
			resolve({
				rootDir: path.join(__dirname, "views"),
				browser: true,
				dedupe: ["svelte"],
			}),
			commonjs(),

			// In dev mode, call `npm run start` once
			// the bundle has been generated
			// !production && serve(), // we dont need a localhost server to test svelte

			// Watch the `public` directory and refresh the
			// browser on changes when not in production
			// !production && livereload("public"), // livereload doesnt work in vscode

			// If we're building for production (npm run build
			// instead of npm run dev), minify
			production && terser(),
		],
		watch: {
			clearScreen: false,
		},
	};
});
