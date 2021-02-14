import * as vscode from "vscode";
import { getNonce } from "./nonce";

export class DrawingPanel {
	private static instance: DrawingPanel | undefined;
	private static readonly viewType = "drawing-panel";

	private readonly panel: vscode.WebviewPanel;
	private readonly extensionUri: vscode.Uri;
	private disposables: vscode.Disposable[] = [];

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this.panel = panel;
		this.extensionUri = extensionUri;

		this.update();

		this.panel.onDidDispose(
			() => {
				this.dispose();
			},
			null,
			this.disposables
		);
	}

	public dispose(): void {
		DrawingPanel.instance = undefined;

		this.panel.dispose();

		while (this.disposables.length) {
			const el = this.disposables.pop();
			if (el) {
				el.dispose();
			}
		}
	}

	public static createOrShow(extensionUri: vscode.Uri): void {
		const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined; // todo: reveal in the right column
		if (DrawingPanel.instance) {
			// DbPanel.dbWebviewPanel.reveal(columnToShowIn); // todo: open webview panel in the right column
			DrawingPanel.instance.panel.reveal();
			DrawingPanel.instance.update();
		} else {
			const panel = vscode.window.createWebviewPanel(
				DrawingPanel.viewType,
				"Db Sketch",
				columnToShowIn || vscode.ViewColumn.One,
				{
					// Enable JS
					enableScripts: true,
					// Only allow the webview to access resources in our extension's media directory
					localResourceRoots: [
						vscode.Uri.joinPath(extensionUri, "media"),
						vscode.Uri.joinPath(extensionUri, "out", "views"),
					],
				}
			);
			DrawingPanel.instance = new DrawingPanel(panel, extensionUri);

			// todo: parse user written files
			const parsedData = { data: "WIP" };
			panel.webview.postMessage(parsedData);
		}
	}

	public static kill() {
		DrawingPanel.instance?.dispose();
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		DrawingPanel.instance = new DrawingPanel(panel, extensionUri);
	}

	private async update(): Promise<void> {
		this.panel.webview.html = this._getWebviewContent();
		this.panel.webview.onDidReceiveMessage((data: { type: string; value: any }) => {
			switch (data.type) {
				case "info": {
					if (!data.value) {
						return;
					}
					vscode.window.showInformationMessage(data.value);
					break;
				}
				case "error": {
					if (!data.value) {
						return;
					}
					vscode.window.showErrorMessage(data.value);
					break;
				}
			}
		});
	}

	private _getWebviewContent(): string {
		const webview = this.panel.webview;

		const cspSource = webview.cspSource;

		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "out", "views", "Drawing.js"));

		const cssResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "reset.css"));
		const cssVsCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "vscode.css"));
		const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "out", "views", "Drawing.css"));

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource}; img-src ${cspSource} https:; script-src ${cspSource} 'nonce-${nonce}';">

				<title>Db Sketch</title>

				<link href="${cssResetUri}" rel="stylesheet">
				<link href="${cssVsCodeUri}" rel="stylesheet">
				<link href="${cssUri}" rel="stylesheet" >
			</head>
			<body>

			</body>
			<script src="${scriptUri}" nonce="${nonce}"></script>
			</html>
		`;
	}
}
