import * as vscode from 'vscode';
import { Dashboard } from './dashboard';

export function activate(context: vscode.ExtensionContext) {
	const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('devPace');
	const configured: boolean = Boolean(config.get('configured', false));
	const dashboard: Dashboard = new Dashboard(context);
	
	//onboard user by getting user preferences the first time the extension is launched.
	if (!configured){
		dashboard.updateSettings();
	}

	dashboard.startPopUps();

	const popUpDisposable: vscode.Disposable = vscode.commands.registerCommand('my-first-extension.popUp', dashboard.popUp);

	const pausePopUpsDisposable: vscode.Disposable = vscode.commands.registerCommand('my-first-extension.pausePopUps', dashboard.pausePopUps);

	const startPopUpsDisposable: vscode.Disposable = vscode.commands.registerCommand('my-first-extension.startPopUps', dashboard.startPopUps);

	const updateSettingsDisposable: vscode.Disposable = vscode.commands.registerCommand('my-first-extension.updateSettings', dashboard.updateSettings);
	
	context.subscriptions.push(popUpDisposable, pausePopUpsDisposable, startPopUpsDisposable, updateSettingsDisposable);
}

export function deactivate() {}
