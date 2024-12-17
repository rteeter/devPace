import * as vscode from 'vscode';
import { Dashboard } from './dashboard';

export async function activate(context: vscode.ExtensionContext) {
	console.log('DevPace is now active!');

	const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('devPace');

	// Fix Promise handling
	try {
		// Force reset configuration on startup
		await config.update('configured', false, vscode.ConfigurationTarget.Global);

		console.log('Configuration reset');
		const dashboard: Dashboard = new Dashboard(context);

		console.log('Showing settings panel');
		dashboard.updateSettings();

		console.log('Starting popups');
		dashboard.startPopUps();

		const popUpDisposable: vscode.Disposable = vscode.commands.registerCommand(
			'my-first-extension.popUp',
			() => {
				console.log('Executing popup command');
				return dashboard.popUp();
			}
		);

		const pausePopUpsDisposable: vscode.Disposable = vscode.commands.registerCommand(
			'my-first-extension.pausePopUps',
			() => {
				console.log('Executing pause command');
				return dashboard.pausePopUps();
			}
		);

		const startPopUpsDisposable: vscode.Disposable = vscode.commands.registerCommand(
			'my-first-extension.startPopUps',
			() => {
				console.log('Executing start command');
				return dashboard.startPopUps();
			}
		);

		const updateSettingsDisposable: vscode.Disposable = vscode.commands.registerCommand(
			'my-first-extension.updateSettings',
			() => {
				console.log('Executing settings update command');
				return dashboard.updateSettings();
			}
		);

		context.subscriptions.push(
			popUpDisposable,
			pausePopUpsDisposable,
			startPopUpsDisposable,
			updateSettingsDisposable
		);

		console.log('All commands registered');
	} catch (err: unknown) {
		console.error('Error during activation:', err);
		vscode.window.showErrorMessage('Failed to activate DevPace extension');
	}
}

export function deactivate() {
	console.log('DevPace is now deactivated');
}