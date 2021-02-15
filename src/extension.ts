import * as vscode from "vscode";
import { DrawingPanel } from "./DrawingPanel";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("db-sketch.generateDrawing", () => {
			DrawingPanel.createOrShow(context.extensionUri);
		})
	);
}

export function deactivate() {}
